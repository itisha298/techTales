import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { june28 } from '../content/presentationContent';
import { useMotionPreset } from '../lib/motion';
import { SpeakerBadge } from '../components/Portrait';
import { Chevron, Eyebrow, Reveal } from '../components/primitives';
import { AmbientLight, Nudge, TravelGlow } from '../components/ambient';
import type { SceneProps } from './types';

const HIDDEN = 'polygon(0% 0%, 0% 0%, -50% 100%, -50% 100%)';
const SHOWN = 'polygon(0% 0%, 150% 0%, 100% 100%, -50% 100%)';

export default function June28Scene({ step, setStep }: SceneProps) {
  const m = useMotionPreset();
  const future = step >= 1;
  const wipe = (delay: number) => ({
    initial: { clipPath: future ? SHOWN : HIDDEN },
    animate: { clipPath: future ? SHOWN : HIDDEN },
    transition: m.reduced ? { duration: 0.2 } : { duration: 1.05, delay: future ? delay : 0.14 - delay, ease: [0.65, 0, 0.35, 1] as const },
  });
  const after = (d: number) => (future ? m.t(0.6, 0.75 + d) : { duration: 0.15 });

  return (
    <div className="relative h-full overflow-hidden">
      {/* ---------- Today: the deadline ---------- */}
      <div className="scene-pad relative flex h-full flex-col" aria-hidden={future}>
        <header className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:justify-between">
          <Reveal>
            <Eyebrow>{june28.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.2}>
            <SpeakerBadge speakerId="neeti" />
          </Reveal>
        </header>
        <div className="flex flex-1 flex-col justify-center">
          <Reveal delay={0.15} y={30}>
            <p className="t-eyebrow text-muted">{june28.before.label}</p>
            <p className="mt-2 text-[clamp(64px,calc(10.5*var(--u)),220px)] font-bold leading-[0.86] tracking-[-0.055em] text-ink">
              {june28.before.date}
            </p>
          </Reveal>
          <div className="mt-[clamp(18px,calc(2.6*var(--u)),52px)] flex items-center gap-4">
            <span aria-hidden className="relative block h-[2px] flex-1 overflow-hidden">
              <motion.span
                className="absolute inset-0 bg-purple"
                style={{ transformOrigin: 'left' }}
                initial={{ scaleX: m.reduced ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={m.t(1.4, 0.5)}
              />
              {/* A slow light moving from go-live toward what comes next */}
              {!future && <TravelGlow duration={6} delay={2} fraction={0.16} className="via-white/90" repeatDelay={1.4} />}
            </span>
            <Nudge distance={6} duration={3.6}>
              <Chevron className="h-[28px] w-[18px] text-purple" strokeWidth={2.5} />
            </Nudge>
          </div>
          <Reveal delay={0.7}>
            <h2 className="t-headline-sm mt-[clamp(18px,calc(2.6*var(--u)),52px)] max-w-[26ch]">{june28.setup}</h2>
          </Reveal>
          <Reveal delay={1.3} className="mt-[clamp(16px,calc(2.4*var(--u)),48px)]">
            <button
              type="button"
              onClick={() => setStep(1)}
              tabIndex={future ? -1 : 0}
              className="group t-body inline-flex items-center gap-3 font-semibold text-deep hover:text-purple"
            >
              The real question
              <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>
      </div>

      {/* ---------- The day after: diagonal purple wipe ---------- */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-purple" {...wipe(0)} />
      <motion.div
        className="absolute inset-0 bg-deep text-white"
        aria-hidden={!future}
        style={{ pointerEvents: future ? 'auto' : 'none' }}
        {...wipe(0.14)}
      >
        {/* thin architectural diagonal */}
        <span aria-hidden className="absolute -right-[10%] top-0 h-[160%] w-px origin-top rotate-[35deg] bg-white/15" />
        <span aria-hidden className="absolute right-[12%] top-0 h-[160%] w-px origin-top rotate-[35deg] bg-white/10" />
        {future && (
          <AmbientLight className="-right-[10%] top-[10%] h-[90vh] w-[90vh] bg-[radial-gradient(closest-side,rgba(161,0,255,0.35),transparent)]" duration={16} drift={70} />
        )}

        <div className="scene-pad relative flex h-full flex-col overflow-y-auto thin-scroll">
          <motion.div
            className="flex flex-wrap items-center gap-x-4 gap-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: future ? 1 : 0 }}
            transition={after(0)}
          >
            <span className="t-eyebrow text-white/70">
              {june28.before.date} · {june28.before.label}
            </span>
            <Chevron className="h-4 w-3 text-white" strokeWidth={2.5} />
            <span className="t-eyebrow text-white">{june28.after.label}</span>
          </motion.div>

          <motion.h2
            className="t-headline my-auto max-w-[22ch] py-[clamp(16px,calc(2.6*var(--u)),52px)] text-white"
            initial={{ opacity: 0, y: m.y(24) }}
            animate={{ opacity: future ? 1 : 0, y: future ? 0 : m.y(24) }}
            transition={after(0.1)}
          >
            {june28.question}
          </motion.h2>

          <ul className="grid grid-cols-1 gap-x-[calc(3*var(--u))] pt-[clamp(20px,calc(3*var(--u)),60px)] sm:grid-cols-2 lg:grid-cols-3">
            {june28.outcomes.map((o, i) => (
              <motion.li
                key={o}
                className="relative flex items-baseline gap-4 border-t border-white/25 py-[clamp(10px,calc(1.1*var(--u)),22px)]"
                initial={{ opacity: 0, y: m.y(14) }}
                animate={{ opacity: future ? 1 : 0, y: future ? 0 : m.y(14) }}
                transition={after(0.45 + i * 0.1)}
              >
                {future && (
                  <span aria-hidden className="absolute inset-x-0 -top-px h-px overflow-hidden">
                    <TravelGlow duration={8} delay={2.2 + i * 0.6} fraction={0.3} className="via-white/80" repeatDelay={2} />
                  </span>
                )}
                <span className="t-small font-semibold tabular-nums text-white/70">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[clamp(20px,calc(1.9*var(--u)),40px)] font-bold leading-tight tracking-[-0.02em]">{o}</span>
              </motion.li>
            ))}
          </ul>
          <motion.p
            className="t-lead mt-[clamp(10px,calc(1.4*var(--u)),28px)] font-semibold text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: future ? 1 : 0 }}
            transition={after(1.2)}
          >
            {june28.closing}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
