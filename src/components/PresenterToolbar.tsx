import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, ExternalLink, LayoutGrid, Link2, Link2Off, Maximize, Minimize, NotebookText, Pause, Play, RotateCcw, RotateCw, Timer } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { scenes, totalPlannedSeconds } from '../content/presentationContent';
import { getMember } from '../data/team';
import { presenterTimer, usePresenterTimer } from '../hooks/presenterTimer';
import { navigationTuning } from '../theme/tokens';
import { speakerFor } from '../lib/speaker';
import { formatClock, useMotionPreset } from '../lib/motion';

function ElapsedClock() {
  const t = usePresenterTimer();
  return <span className="tabular-nums">{formatClock(t.elapsed)}</span>;
}

function SceneClock({ planned }: { planned: number }) {
  const t = usePresenterTimer();
  const over = t.sceneElapsed > planned;
  return (
    <span className={`tabular-nums ${over ? 'font-bold text-warning-ink' : ''}`}>
      {formatClock(t.sceneElapsed)} / {formatClock(planned)}
      {over && <span className="sr-only"> over time</span>}
      {over && <span aria-hidden> ▲</span>}
    </span>
  );
}

function TimerToggle() {
  const t = usePresenterTimer();
  return (
    <ToolButton label={t.running ? 'Pause timer' : 'Start timer'} onClick={presenterTimer.toggle}>
      {t.running ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
    </ToolButton>
  );
}

function ToolButton({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`flex h-9 w-9 items-center justify-center transition-colors duration-150 hover:bg-lavender ${active ? 'bg-lavender text-deep' : 'text-ink'}`}
    >
      {children}
    </button>
  );
}

function Item({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="truncate text-[14px] font-semibold text-ink">{children}</p>
    </div>
  );
}

export interface SyncStatus {
  supported: boolean;
  on: boolean;
  peers: number;
  /** Sync is suspended because this window is rehearsing. */
  suspended: boolean;
}

const syncText = (s: SyncStatus) =>
  !s.supported ? 'Unavailable' : s.suspended ? 'Paused (rehearsal)' : !s.on ? 'Off' : s.peers > 0 ? `Linked · ${s.peers} window${s.peers > 1 ? 's' : ''}` : 'On · waiting';

/**
 * Presenter toolbar: hidden by default; appears on pointer movement or when
 * keyboard focus enters it, and hides again after a short idle period.
 */
export function PresenterToolbar({
  index,
  step = 0,
  pinned = false,
  sync,
  rehearsal = false,
  onToggleSync,
  onOpenPresenter,
  onRehearsal,
  notesOpen,
  timerOpen,
  isFullscreen,
  onNotes,
  onOverview,
  onTimer,
  onFullscreen,
  onRestart,
}: {
  index: number;
  step?: number;
  /** Always visible (presenter window). */
  pinned?: boolean;
  sync?: SyncStatus;
  rehearsal?: boolean;
  onToggleSync?: () => void;
  onOpenPresenter?: () => void;
  onRehearsal?: () => void;
  notesOpen: boolean;
  timerOpen: boolean;
  isFullscreen: boolean;
  onNotes: () => void;
  onOverview: () => void;
  onTimer: () => void;
  onFullscreen: () => void;
  onRestart: () => void;
}) {
  const m = useMotionPreset();
  const [visible, setVisible] = useState(false);
  const hovering = useRef(false);
  const focused = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const show = () => {
      setVisible(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        if (!hovering.current && !focused.current) setVisible(false);
      }, navigationTuning.toolbarIdleMs);
    };
    window.addEventListener('pointermove', show);
    return () => {
      window.removeEventListener('pointermove', show);
      window.clearTimeout(timer.current);
    };
  }, []);

  const scene = scenes[index];
  const next = scenes[index + 1];
  const speaker = getMember(speakerFor(scene, step));
  const progress = Math.round(((index + 1) / scenes.length) * 100);
  const shown = visible || pinned;

  return (
    <div
      className="fixed inset-x-0 top-0 z-30 flex justify-center px-3 pt-3 transition-[padding] duration-300"
      // Keep clear of the notes panel when it is open.
      style={notesOpen ? { paddingRight: 'calc(min(560px, 100vw) + 12px)' } : undefined}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
      onFocus={() => {
        focused.current = true;
        setVisible(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          focused.current = false;
          setVisible(false);
        }
      }}
    >
      <AnimatePresence>
        {shown && (
          <motion.div
            role="toolbar"
            aria-label="Presenter tools"
            className="flex max-w-full items-center gap-5 overflow-x-auto border border-line bg-white/95 px-4 py-2 shadow-[0_18px_40px_-30px_rgba(70,0,115,0.5)] backdrop-blur-sm"
            initial={{ opacity: 0, y: m.y(-10) }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: m.y(-10) }}
            transition={m.t(0.2)}
          >
            <Item label={`Scene ${index + 1}/${scenes.length}`} className="w-[170px]">
              {scene.navLabel}
            </Item>
            <Item label="Next" className="hidden w-[150px] md:block">
              {next ? next.navLabel : 'End'}
            </Item>
            <Item label="Speaker" className="hidden w-[120px] lg:block">
              {speaker.shortName}
            </Item>
            {scene.steps > 1 && (
              <Item label={`Build ${step + 1}/${scene.steps}`} className="w-[130px]">
                <span className={step < scene.steps - 1 ? 'text-deep' : ''}>{step < scene.steps - 1 ? '→ animates' : '→ next scene'}</span>
              </Item>
            )}
            {sync && (
              <Item label="Sync" className="hidden w-[130px] md:block">
                <span data-testid="sync-status">{syncText(sync)}</span>
              </Item>
            )}
            <Item label="Elapsed">
              <ElapsedClock />
            </Item>
            <Item label="Scene / planned" className="hidden sm:block">
              <SceneClock planned={scene.plannedSeconds} />
            </Item>
            <Item label="Total planned" className="hidden xl:block">
              {formatClock(totalPlannedSeconds)}
            </Item>
            <Item label="Progress" className="hidden md:block">
              {progress}%
            </Item>
            <div className="flex items-center gap-0.5 border-l border-line pl-3">
              <TimerToggle />
              <ToolButton label="Reset timer" onClick={presenterTimer.reset}>
                <RotateCw aria-hidden className="h-4 w-4" />
              </ToolButton>
              <ToolButton label="Timer panel (T)" onClick={onTimer} active={timerOpen}>
                <Clock3 aria-hidden className="h-4 w-4" />
              </ToolButton>
              <ToolButton label="Presenter notes (N)" onClick={onNotes} active={notesOpen}>
                <NotebookText aria-hidden className="h-4 w-4" />
              </ToolButton>
              <ToolButton label="Chapter overview (O)" onClick={onOverview}>
                <LayoutGrid aria-hidden className="h-4 w-4" />
              </ToolButton>
              <ToolButton label={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'} onClick={onFullscreen} active={isFullscreen}>
                {isFullscreen ? <Minimize aria-hidden className="h-4 w-4" /> : <Maximize aria-hidden className="h-4 w-4" />}
              </ToolButton>
              {sync && onToggleSync && (
                <ToolButton
                  label={!sync.supported ? 'Window sync unavailable in this browser' : sync.on ? 'Unlink windows (S)' : 'Link windows (S)'}
                  onClick={onToggleSync}
                  active={sync.on && sync.supported}
                >
                  {sync.on ? <Link2 aria-hidden className="h-4 w-4" /> : <Link2Off aria-hidden className="h-4 w-4" />}
                </ToolButton>
              )}
              {onOpenPresenter && (
                <ToolButton label="Open linked presenter window (P)" onClick={onOpenPresenter}>
                  <ExternalLink aria-hidden className="h-4 w-4" />
                </ToolButton>
              )}
              {onRehearsal && (
                <ToolButton label={rehearsal ? 'End rehearsal mode (R)' : 'Rehearsal mode (R)'} onClick={onRehearsal} active={rehearsal}>
                  <Timer aria-hidden className="h-4 w-4" />
                </ToolButton>
              )}
              <ToolButton label="Restart experience" onClick={onRestart}>
                <RotateCcw aria-hidden className="h-4 w-4" />
              </ToolButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Keyboard users can always reach the toolbar */}
      {!shown && (
        <button type="button" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:bg-white focus:px-4 focus:py-2" onFocus={() => setVisible(true)}>
          Presenter tools
        </button>
      )}
    </div>
  );
}

/** T — compact timer panel. */
export function TimerHud({ index, onClose }: { index: number; onClose: () => void }) {
  const m = useMotionPreset();
  const t = usePresenterTimer();
  const scene = scenes[index];
  const remaining = totalPlannedSeconds - t.elapsed;
  return (
    <motion.section
      aria-label="Presentation timer"
      className="fixed bottom-[calc(var(--chrome-h)+12px)] right-[var(--pad-x)] z-30 w-[280px] border border-line bg-white p-4 shadow-[0_18px_40px_-30px_rgba(70,0,115,0.5)]"
      initial={{ opacity: 0, y: m.y(10) }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: m.y(10) }}
      transition={m.t(0.2)}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Elapsed {t.running ? '' : '· paused'}</p>
        <button type="button" onClick={onClose} className="text-[12px] font-semibold text-muted hover:text-ink" aria-label="Close timer (T)">
          Close
        </button>
      </div>
      <p className="mt-1 text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{formatClock(t.elapsed)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
        <div>
          <p className="text-muted">This scene</p>
          <p className="font-semibold">
            <SceneClock planned={scene.plannedSeconds} />
          </p>
        </div>
        <div>
          <p className="text-muted">Remaining plan</p>
          <p className={`font-semibold tabular-nums ${remaining < 0 ? 'text-warning-ink' : ''}`}>{formatClock(remaining)}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={presenterTimer.toggle} className="flex-1 bg-ink py-2 text-[13px] font-semibold text-white hover:bg-deep">
          {t.running ? 'Pause' : t.elapsed > 0 ? 'Resume' : 'Start'}
        </button>
        <button type="button" onClick={presenterTimer.reset} className="flex-1 border border-line py-2 text-[13px] font-semibold hover:bg-lavender">
          Reset
        </button>
      </div>
    </motion.section>
  );
}
