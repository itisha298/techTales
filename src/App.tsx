import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { experience, sceneIndexById, scenes, ui } from './content/presentationContent';
import { useDeck } from './hooks/useDeck';
import { useFullscreen } from './hooks/useFullscreen';
import { useGestureNavigation } from './hooks/useGestureNavigation';
import { presenterTimer } from './hooks/presenterTimer';
import { getRehearsalStore } from './hooks/rehearsal';
import { DeckSync, syncSupported } from './lib/deckSync';
import { useMotionPreset } from './lib/motion';
import { speakerFor } from './lib/speaker';
import { isDarkStage, sceneComponents } from './scenes';
import { BottomRail } from './components/BottomRail';
import { AssessmentPanel, ChapterMenu, OverviewOverlay } from './components/Overlays';
import { NotesPanel } from './components/NotesPanel';
import { PresenterToolbar, TimerHud } from './components/PresenterToolbar';
import { RehearsalPanel } from './components/RehearsalPanel';
import { getMember, team } from './data/team';
import { durations } from './theme/tokens';
import type { SceneId, SpeakerId } from './types/presentation';

type Overlay = 'overview' | 'menu' | 'assessment' | null;

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown', 'PageDown', ' ']);
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp']);
/** Keys a scrollable panel keeps for itself. */
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End']);
/** How long the "Now speaking" handover line stays in the rail. */
const HANDOVER_MS = 4000;
const SYNC_SESSION_KEY = 'meridian-sync';

const readFlags = () => {
  const p = new URLSearchParams(window.location.search);
  let syncSaved = false;
  try {
    syncSaved = sessionStorage.getItem(SYNC_SESSION_KEY) === '1';
  } catch {
    // storage blocked: sync simply starts off
  }
  const presenter = p.get('view') === 'presenter';
  return { presenter, sync: presenter || p.has('sync') || syncSaved, rehearsal: p.has('rehearsal') };
};

export default function App() {
  const deck = useDeck();
  const { index, step, direction, scene, next, prev, goTo, setStep, total } = deck;
  const m = useMotionPreset();
  const fullscreen = useFullscreen();
  const stageRef = useRef<HTMLElement>(null);
  const [flags] = useState(readFlags);

  const [overlay, setOverlay] = useState<Overlay>(null);
  const [notesOpen, setNotesOpen] = useState(flags.presenter);
  const [timerOpen, setTimerOpen] = useState(false);
  const [rehearsal, setRehearsal] = useState(flags.rehearsal);
  const [syncOn, setSyncOn] = useState(flags.sync && syncSupported());
  const [peers, setPeers] = useState(0);
  const rehearsalStore = useMemo(() => getRehearsalStore(scenes.length), []);

  useGestureNavigation(stageRef, { next, prev, enabled: overlay === null });

  // Photographs stay off the critical path, then warm the cache once the
  // opening has painted so later diagonal reveals never play over an empty frame.
  useEffect(() => {
    const warm = () => team.forEach((m) => (new Image().src = m.image));
    const id = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(id);
  }, []);

  // Per-scene timing and document title.
  useEffect(() => {
    presenterTimer.markScene();
    document.title = `${scene.navLabel} · ${experience.documentTitle}`;
  }, [scene]);

  /* ---------- Speaker handover ---------- */
  const speakerId = speakerFor(scene, step);
  const [lastSpeaker, setLastSpeaker] = useState<SpeakerId>(speakerId);
  const [handoverFor, setHandoverFor] = useState<SpeakerId | null>(null);
  if (speakerId !== lastSpeaker) {
    // Adjust state during render (no effect round-trip): a new speaker starts a handover.
    setLastSpeaker(speakerId);
    setHandoverFor(speakerId);
  }
  useEffect(() => {
    if (!handoverFor) return;
    const id = window.setTimeout(() => setHandoverFor(null), HANDOVER_MS);
    return () => window.clearTimeout(id);
  }, [handoverFor]);

  /* ---------- Optional window sync (BroadcastChannel) ---------- */
  const position = useRef({ index, step });
  useEffect(() => {
    position.current = { index, step };
  }, [index, step]);
  const syncRef = useRef<DeckSync | null>(null);
  const syncActive = syncOn && !rehearsal; // rehearsal windows never sync
  useEffect(() => {
    if (!syncActive) return;
    const s = new DeckSync({
      onRemote: (p) => goTo(p.index, p.step),
      getPosition: () => position.current,
      onPeers: setPeers,
    });
    if (!s.start()) return;
    syncRef.current = s;
    return () => {
      s.stop();
      syncRef.current = null;
    };
  }, [syncActive, goTo]);
  useEffect(() => {
    syncRef.current?.publish({ index, step });
  }, [index, step]);
  useEffect(() => {
    try {
      sessionStorage.setItem(SYNC_SESSION_KEY, syncOn ? '1' : '0');
    } catch {
      // ignore
    }
  }, [syncOn]);
  const toggleSync = useCallback(() => {
    if (syncSupported()) setSyncOn((v) => !v);
  }, []);
  const openPresenterWindow = useCallback(() => {
    if (syncSupported()) setSyncOn(true);
    const url = `${window.location.pathname}?view=presenter${window.location.hash}`;
    window.open(url, 'meridian-presenter', 'popup,width=1280,height=820');
  }, []);

  /* ---------- Rehearsal mode (window-local) ---------- */
  useEffect(() => {
    if (!rehearsal) return;
    rehearsalStore.start(position.current.index);
    return () => rehearsalStore.pause();
  }, [rehearsal, rehearsalStore]);
  useEffect(() => {
    if (rehearsal) rehearsalStore.enterScene(index);
  }, [rehearsal, index, rehearsalStore]);
  const toggleRehearsal = useCallback(() => setRehearsal((v) => !v), []);

  const toggleTimer = useCallback(() => {
    setTimerOpen((open) => {
      if (!open && !presenterTimer.getSnapshot().running && presenterTimer.getSnapshot().elapsed === 0) presenterTimer.start();
      return !open;
    });
  }, []);

  const restart = useCallback(() => {
    setOverlay(null);
    presenterTimer.pause();
    presenterTimer.reset();
    goTo(0);
  }, [goTo]);

  const toggleOverlay = (o: Exclude<Overlay, null>) => setOverlay((cur) => (cur === o ? null : o));

  // Central keyboard controller.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Never intercept browser / OS shortcuts (refresh, dev tools, zoom, tabs…).
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      const key = e.key;
      const lower = key.length === 1 ? key.toLowerCase() : key;

      if (key === 'Escape') {
        if (overlay) setOverlay(null);
        else if (notesOpen) setNotesOpen(false);
        else if (timerOpen) setTimerOpen(false);
        return;
      }
      if (lower === 'o') return toggleOverlay('overview');
      if (lower === 'm') return toggleOverlay('menu');
      if (lower === 'n') return setNotesOpen((v) => !v);
      if (lower === 't') return toggleTimer();
      if (lower === 'r') return toggleRehearsal();
      if (lower === 's') return toggleSync();
      if (lower === 'p') return openPresenterWindow();
      if (lower === 'f') {
        void fullscreen.toggle();
        return;
      }

      if (overlay) return; // modal open: deck navigation paused

      if (target?.closest('[data-native-keys]') && SCROLL_KEYS.has(key)) return;
      if ((key === ' ' || key === 'Enter') && target?.closest('button, a')) return; // native activation

      if (NEXT_KEYS.has(key)) {
        e.preventDefault();
        next();
      } else if (PREV_KEYS.has(key)) {
        e.preventDefault();
        prev();
      } else if (key === 'Home') {
        e.preventDefault();
        goTo(0);
      } else if (key === 'End') {
        e.preventDefault();
        goTo(total - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay, notesOpen, timerOpen, next, prev, goTo, total, toggleTimer, toggleRehearsal, toggleSync, openPresenterWindow, fullscreen]);

  const goToScene = useCallback((id: SceneId) => goTo(sceneIndexById[id]), [goTo]);
  const openAssessment = useCallback(() => setOverlay('assessment'), []);
  const selectScene = (i: number) => {
    setOverlay(null);
    goTo(i);
  };

  const Scene = sceneComponents[scene.id];
  const dark = isDarkStage(scene.id, step);
  const speaker = getMember(speakerId);
  const buildNote = scene.steps > 1 ? ` ${ui.build(step + 1, scene.steps)}.` : '';

  return (
    <>
      <main ref={stageRef} className="fixed inset-0 overflow-hidden bg-white" aria-roledescription="presentation">
        <h1 className="sr-only">{experience.documentTitle}</h1>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.section
            key={scene.id}
            custom={direction}
            data-scene={scene.id}
            data-step={step}
            aria-roledescription="scene"
            aria-label={`${index + 1} of ${total}: ${scene.navLabel}`}
            className="thin-scroll absolute inset-0 overflow-y-auto overflow-x-hidden"
            initial={{ opacity: 0, y: m.y(direction * 24) }}
            animate={{ opacity: 1, y: 0, transition: m.t(durations.sceneEnter) }}
            exit={{ opacity: 0, y: m.y(direction * -16), transition: m.t(durations.sceneExit) }}
          >
            <Scene step={step} next={next} setStep={setStep} goToScene={goToScene} openAssessment={openAssessment} />
          </motion.section>
        </AnimatePresence>
        <BottomRail
          index={index}
          step={step}
          dark={dark}
          handover={handoverFor !== null}
          onPrev={prev}
          onNext={next}
          onMenu={() => toggleOverlay('menu')}
        />
      </main>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Scene ${index + 1} of ${total}: ${scene.navLabel}. Speaker: ${speaker.name}.${buildNote}`}
      </p>

      {rehearsal && (
        <p
          data-testid="rehearsal-badge"
          className="pointer-events-none fixed right-[var(--pad-x)] top-3 z-30 bg-ink px-3 py-1 text-[12px] font-bold uppercase tracking-[0.16em] text-white"
        >
          {ui.rehearsal} · not live
        </p>
      )}

      <PresenterToolbar
        index={index}
        step={step}
        pinned={flags.presenter}
        sync={{ supported: syncSupported(), on: syncOn, peers: syncActive ? peers : 0, suspended: syncOn && rehearsal }}
        rehearsal={rehearsal}
        onToggleSync={toggleSync}
        onOpenPresenter={openPresenterWindow}
        onRehearsal={toggleRehearsal}
        notesOpen={notesOpen}
        timerOpen={timerOpen}
        isFullscreen={fullscreen.isFullscreen}
        onNotes={() => setNotesOpen((v) => !v)}
        onOverview={() => toggleOverlay('overview')}
        onTimer={toggleTimer}
        onFullscreen={() => void fullscreen.toggle()}
        onRestart={restart}
      />

      <AnimatePresence>{timerOpen && <TimerHud key="timer" index={index} onClose={() => setTimerOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{notesOpen && <NotesPanel key="notes" index={index} step={step} onClose={() => setNotesOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{rehearsal && <RehearsalPanel key="rehearsal" store={rehearsalStore} onClose={() => setRehearsal(false)} />}</AnimatePresence>
      <AnimatePresence>
        {overlay === 'overview' && <OverviewOverlay key="overview" current={index} onSelect={selectScene} onClose={() => setOverlay(null)} />}
        {overlay === 'menu' && <ChapterMenu key="menu" current={index} onSelect={selectScene} onClose={() => setOverlay(null)} />}
        {overlay === 'assessment' && <AssessmentPanel key="assessment" onClose={() => setOverlay(null)} />}
      </AnimatePresence>
    </>
  );
}
