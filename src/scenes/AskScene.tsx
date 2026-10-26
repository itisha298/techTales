import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { ask } from '../content/presentationContent';
import { getMember } from '../data/team';
import { useMotionPreset } from '../lib/motion';
import { Portrait, SpeakerBadge } from '../components/Portrait';
import { Chevron, Eyebrow, Reveal } from '../components/primitives';
import { AmbientLight, Nudge, PulseRing } from '../components/ambient';
import { useLive } from '../hooks/useAmbient';
import type { SceneProps } from './types';

function TheAsk({ onOpenQa, onExplore }: { onOpenQa: () => void; onExplore: () => void }) {
  const m = useMotionPreset();
  return (
    <div className="scene-pad relative flex min-h-full flex-col">
      {/* Cropped geometry: a single lavender 45° plane on the right */}
      <motion.span
        aria-hidden
        className="absolute bottom-0 right-0 top-0 hidden w-[44%] bg-lavender lg:block"
        style={{ clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%)' }}
        initial={{ opacity: 0, x: m.y(40) }}
        animate={{ opacity: 1, x: 0 }}
        transition={m.t(0.9, 0.1)}
      />
      <AmbientLight className="-right-[8%] top-[18%] hidden h-[70vh] w-[70vh] bg-[radial-gradient(closest-side,rgba(161,0,255,0.09),transparent)] lg:block" duration={17} drift={45} />
      <header className="relative flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:justify-between">
        <Reveal>
          <Eyebrow>{ask.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.2}>
          <SpeakerBadge speakerId="aryama" label="Facilitator" />
        </Reveal>
      </header>

      <div className="relative grid flex-1 items-center gap-[calc(4*var(--u))] py-[clamp(16px,calc(2*var(--u)),40px)] lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Reveal delay={0.15} y={28}>
          <h2 className="t-headline max-w-[17ch]">{ask.question}</h2>
        </Reveal>
        <ul className="grid gap-0">
          {ask.outcomes.map((o, i) => (
            <motion.li
              key={o}
              className="flex items-center gap-4 border-t border-ink/15 py-[clamp(12px,calc(1.4*var(--u)),28px)] last:border-b"
              initial={{ opacity: 0, x: m.y(-14) }}
              animate={{ opacity: 1, x: 0 }}
              transition={m.t(0.5, 0.6 + i * 0.15)}
            >
              <Chevron className="h-[0.9em] w-[0.55em] shrink-0 text-purple" strokeWidth={2.5} />
              <span className="text-[clamp(18px,calc(1.7*var(--u)),36px)] font-bold leading-tight tracking-[-0.02em]">{o}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <Reveal delay={1.1} className="relative flex flex-wrap gap-4">
        <button
          type="button"
          onClick={onExplore}
          className="t-body inline-flex items-center gap-3 border-2 border-ink bg-white px-[clamp(18px,calc(1.6*var(--u)),32px)] py-[clamp(12px,calc(0.9*var(--u)),18px)] font-semibold transition-colors duration-200 hover:border-purple hover:text-deep"
        >
          {ask.actions.explore}
        </button>
        <span className="relative inline-flex">
          <PulseRing className="inset-0" delay={2} duration={4.2} scale={1.12} />
          <button
            type="button"
            onClick={onOpenQa}
            className="group cut-br t-body relative inline-flex items-center gap-3 bg-purple px-[clamp(20px,calc(1.8*var(--u)),36px)] py-[clamp(14px,calc(1*var(--u)),20px)] font-semibold text-white transition-colors duration-200 hover:bg-deep [--cut:14px]"
          >
            {ask.actions.qa}
            <Nudge distance={4} duration={3.4}>
              <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Nudge>
          </button>
        </span>
      </Reveal>
    </div>
  );
}

function QandA({ onBack, onExplore }: { onBack: () => void; onExplore: () => void }) {
  const m = useMotionPreset();
  const live = useLive();
  const aryama = getMember('aryama');
  return (
    <div className="relative h-full overflow-hidden bg-deep text-white">
      {/* Slow ambient purple light and a gently drifting architectural line */}
      <AmbientLight className="-left-[12%] top-[20%] h-[90vh] w-[90vh] bg-[radial-gradient(closest-side,rgba(161,0,255,0.32),transparent)]" duration={19} drift={70} />
      <motion.span
        aria-hidden
        className="absolute -right-[6%] top-0 h-[170%] w-px origin-top rotate-[35deg] bg-white/15"
        data-ambient={live || undefined}
        initial={{ x: 0 }}
        animate={live ? { x: [0, -60, 0] } : { x: 0 }}
        transition={live ? { duration: 16, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-y-0 right-0 hidden w-[46%] bg-[#3a0060] lg:block"
        style={{ clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={m.t(0.9)}
      />
      <div className="scene-pad relative grid h-full gap-8 overflow-y-auto thin-scroll lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-[calc(5*var(--u))]">
        <div className="flex flex-col">
          <Reveal>
            <Eyebrow tone="light">{ask.qa.eyebrow}</Eyebrow>
          </Reveal>
          <div className="flex flex-1 flex-col justify-center py-8">
            <motion.span
              className="inline-flex"
              data-ambient={live || undefined}
              initial={{ opacity: 1 }}
              animate={live ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
              transition={live ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
            >
              <MessageCircle aria-hidden className="h-[clamp(28px,calc(2.4*var(--u)),48px)] w-[clamp(28px,calc(2.4*var(--u)),48px)] text-white/70" strokeWidth={1.5} />
            </motion.span>
            <Reveal delay={0.25} y={28}>
              <h2 className="t-headline mt-[clamp(14px,calc(1.8*var(--u)),36px)] max-w-[16ch] text-white">{ask.qa.message}</h2>
            </Reveal>
            <Reveal delay={0.5}>
              <div className="mt-[clamp(20px,calc(2.6*var(--u)),52px)] border-l-2 border-purple pl-5">
                <p className="text-[clamp(20px,calc(1.8*var(--u)),38px)] font-bold leading-tight">{aryama.name}</p>
                <p className="t-body text-white/80">{aryama.role}</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.7} className="flex flex-wrap gap-x-6 gap-y-3">
            <button type="button" onClick={onBack} className="t-small inline-flex items-center gap-2 font-semibold text-white/85 hover:text-white">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              {ask.actions.back}
            </button>
            <button type="button" onClick={onExplore} className="t-small inline-flex items-center gap-2 font-semibold text-white/85 hover:text-white">
              {ask.actions.explore}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          </Reveal>
        </div>
        <div className="relative flex items-end justify-center pb-2 lg:items-center">
          <div className="relative w-[min(78%,calc(28*var(--u)))] min-w-[200px]">
            <Portrait member={aryama} reveal delay={0.15} eager className="cut-br aspect-[3/4] w-full [--cut:40px]" />
            <span aria-hidden className="absolute -left-3 -top-3 h-14 w-14 border-l-2 border-t-2 border-purple" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AskScene({ step, setStep, openAssessment }: SceneProps) {
  const m = useMotionPreset();
  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          className="absolute inset-0 overflow-y-auto thin-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={m.t(0.4)}
        >
          {step === 0 ? (
            <TheAsk onOpenQa={() => setStep(1)} onExplore={openAssessment} />
          ) : (
            <QandA onBack={() => setStep(0)} onExplore={openAssessment} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
