import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { chapterById, experience, scenes, ui } from '../content/presentationContent';
import { getMember } from '../data/team';
import { diagonalHidden, diagonalShown, useMotionPreset } from '../lib/motion';
import { speakerFor } from '../lib/speaker';
import { Portrait } from './Portrait';

/**
 * Discreet build indicator for scenes with an in-scene animation: one small
 * diamond per build, filled once shown. Tells the presenter that the next
 * arrow completes the animation rather than changing scene.
 */
export function BuildIndicator({ step, steps, dark }: { step: number; steps: number; dark: boolean }) {
  if (steps < 2) return null;
  const label = `${ui.build(step + 1, steps)}${step < steps - 1 ? ` · ${ui.buildHint}` : ''}`;
  return (
    <span title={label} data-testid="build-indicator" className="mr-3 inline-flex items-center gap-1.5">
      {Array.from({ length: steps }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={`h-[7px] w-[7px] rotate-45 border transition-colors duration-300 ${
            dark ? 'border-white' : 'border-purple'
          } ${i <= step ? (dark ? 'bg-white' : 'bg-purple') : 'bg-transparent'}`}
        />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Understated persistent chrome: chapter, disclaimer, position and controls. */
export function BottomRail({
  index,
  step,
  dark,
  onPrev,
  onNext,
  onMenu,
  handover = false,
}: {
  index: number;
  step: number;
  dark: boolean;
  /** True for a few seconds after the speaker changes. */
  handover?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onMenu: () => void;
}) {
  const m = useMotionPreset();
  const scene = scenes[index];
  const chapter = scene.chapterId ? chapterById[scene.chapterId] : null;
  const total = scenes.length;
  const atStart = index === 0 && step === 0;
  const atEnd = index === total - 1 && step === scene.steps - 1;
  const progress = (index + (scene.steps > 1 ? step / scene.steps : 0) + 1) / total;
  const speaker = getMember(speakerFor(scene, step));
  const midBuild = step < scene.steps - 1;

  const ink = dark ? 'text-white' : 'text-ink';
  const muted = dark ? 'text-white/75' : 'text-muted';
  const btn = `flex h-11 w-11 items-center justify-center transition-colors duration-200 disabled:opacity-30 ${
    dark ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-lavender'
  }`;

  return (
    <footer
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 transition-colors duration-500 ${dark ? 'bg-deep' : 'bg-white'}`}
      style={{ height: 'var(--chrome-h)' }}
    >
      {/* progress line */}
      <div className={`absolute inset-x-0 top-0 h-[2px] ${dark ? 'bg-white/15' : 'bg-line'}`}>
        <motion.div
          className={`h-full ${dark ? 'bg-white' : 'bg-purple'}`}
          style={{ transformOrigin: 'left' }}
          animate={{ scaleX: progress }}
          transition={m.t(0.6)}
        />
      </div>
      {/* Small screens: disclaimer gets its own line inside the rail */}
      <p className={`px-[var(--pad-x)] pt-2 text-[12px] leading-tight lg:hidden ${muted}`}>{experience.disclaimer}</p>
      <div className="flex items-center justify-between gap-4 px-[var(--pad-x)] max-lg:h-[52px] lg:h-full">
        <div className="flex min-w-0 items-center gap-3">
          {/* Speaker portrait: diagonal cross-fade on every handover */}
          <div className="relative h-8 w-8 shrink-0">
            <AnimatePresence initial={false}>
              <motion.div
                key={speaker.id}
                className="absolute inset-0"
                initial={{ clipPath: m.reduced ? diagonalShown : diagonalHidden, opacity: m.reduced ? 0 : 1 }}
                animate={{ clipPath: diagonalShown, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={m.t(0.7)}
              >
                <Portrait member={speaker} tight eager decorative className="h-8 w-8 rounded-full" />
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {handover ? (
              <motion.p
                key={`handover-${speaker.id}`}
                data-testid="handover"
                className={`t-small min-w-0 truncate ${ink}`}
                initial={{ opacity: 0, y: m.y(6) }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: m.y(-6) }}
                transition={m.t(0.35)}
              >
                <span className={`t-eyebrow mr-2 ${dark ? 'text-white/80' : 'text-purple'}`}>{ui.nowSpeaking}</span>
                <span className="font-bold">{speaker.name}</span>
                <span className={`ml-2 ${muted}`}>{speaker.role}</span>
              </motion.p>
            ) : (
              <motion.p
                key="label"
                className={`t-small min-w-0 truncate font-semibold ${ink}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={m.t(0.3)}
              >
                {chapter ? (
                  <>
                    <span className={dark ? 'text-white' : 'text-purple'}>{chapter.number}</span>
                    <span className={`mx-2 ${muted}`}>/</span>
                    {chapter.title}
                  </>
                ) : (
                  scene.railLabel
                )}
                <span className={`mx-2 ${muted}`}>·</span>
                <span className={`font-medium ${muted}`}>{speaker.name}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <p className={`t-small hidden shrink text-center lg:block ${muted}`}>{experience.disclaimer}</p>
        <nav aria-label="Presentation" className="pointer-events-auto flex shrink-0 items-center gap-1">
          <BuildIndicator step={step} steps={scene.steps} dark={dark} />
          <span className={`t-small mr-2 tabular-nums ${muted}`} aria-hidden>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button type="button" className={btn} onClick={onPrev} disabled={atStart} aria-label={ui.previous}>
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
          <button type="button" className={btn} onClick={onNext} disabled={atEnd} aria-label={midBuild ? ui.nextBuild : ui.next}>
            <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
          <button type="button" className={btn} onClick={onMenu} aria-label={`${ui.menu} (M)`}>
            <LayoutGrid aria-hidden className="h-[18px] w-[18px]" />
          </button>
        </nav>
      </div>
    </footer>
  );
}
