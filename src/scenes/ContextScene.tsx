import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { context } from '../content/presentationContent';
import { useMotionPreset } from '../lib/motion';
import { SpeakerBadge } from '../components/Portrait';
import { CountUp, Eyebrow, Reveal } from '../components/primitives';
import { PulseRing, TravelGlow } from '../components/ambient';

const TL_START = 0.5;
const TL_DUR = 1.8;

function Timeline() {
  const m = useMotionPreset();
  const { timeline, workstreams } = context;
  return (
    <figure className="relative" aria-label={`Timeline: ${timeline.span} from ${timeline.start} to ${timeline.end}`}>
      <div className="flex items-end justify-between gap-4">
        <p className="t-eyebrow text-muted">{timeline.start}</p>
        <p className="t-eyebrow text-deep">{timeline.span}</p>
        <span className="w-[clamp(120px,calc(15*var(--u)),300px)]" />
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-stretch gap-[clamp(12px,calc(1.6*var(--u)),32px)]">
        <ol className="relative">
          {/* six monthly ticks — unlabelled on purpose: the source gives no interim dates */}
          <div aria-hidden className="pointer-events-none absolute inset-0 flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} className="h-full w-px bg-line" />
            ))}
          </div>
          {workstreams.map((w, i) => (
            <li key={w.title} className="relative py-[clamp(8px,calc(0.95*var(--u)),20px)]">
              <div className="relative h-[2px] bg-line">
                <motion.span
                  aria-hidden
                  className="absolute inset-0 bg-purple"
                  style={{ transformOrigin: 'left' }}
                  initial={{ scaleX: m.reduced ? 1 : 0 }}
                  animate={{ scaleX: 1 }}
                  transition={m.t(TL_DUR, TL_START + i * 0.15)}
                />
                {/* Progress keeps flowing toward go-live */}
                <div aria-hidden className="absolute inset-x-0 -top-[1px] h-[4px] overflow-hidden">
                  <TravelGlow duration={5.5} delay={TL_START + TL_DUR + i * 1.3} fraction={0.1} className="via-deep" repeatDelay={2.5} />
                </div>
              </div>
              <div className="mt-[clamp(6px,calc(0.6*var(--u)),12px)] flex flex-wrap items-baseline gap-x-4 gap-y-1 bg-white/0">
                <motion.p
                  className="t-body font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={m.t(0.5, TL_START + 0.2 + i * 0.25)}
                >
                  {w.title}
                </motion.p>
                <motion.p
                  className="t-body text-muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={m.t(0.5, TL_START + 0.35 + i * 0.25)}
                >
                  {w.detail}
                </motion.p>
              </div>
            </li>
          ))}
        </ol>

        {/* Go-live marker */}
        <motion.div
          className="relative flex w-[clamp(120px,calc(15*var(--u)),300px)] flex-col justify-center border-l-2 border-purple pl-[clamp(14px,calc(1.4*var(--u)),28px)]"
          initial={{ opacity: 0, x: m.y(-12) }}
          animate={{ opacity: 1, x: 0 }}
          transition={m.t(0.6, TL_START + TL_DUR - 0.2)}
        >
          <PulseRing className="-left-[9px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45" delay={TL_START + TL_DUR} duration={3.6} scale={2.8} />
          <span aria-hidden className="absolute -left-[9px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-purple" />
          <p className="text-[clamp(28px,calc(2.9*var(--u)),60px)] font-bold leading-none tracking-[-0.03em]">{timeline.end}</p>
          <p className="t-small mt-2 text-muted">{timeline.endLabel}</p>
        </motion.div>
      </div>
    </figure>
  );
}

export default function ContextScene() {
  const { exposure, priorities } = context;
  return (
    <div className="scene-pad flex min-h-full flex-col gap-[clamp(24px,calc(3*var(--u)),60px)]">
      <header className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[calc(80*var(--u))]">
          <Reveal>
            <Eyebrow>{context.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1} y={24}>
            <h2 className="t-headline mt-[clamp(12px,calc(1.4*var(--u)),28px)]">{context.headline}</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="t-lead mt-[clamp(10px,calc(1.2*var(--u)),24px)] max-w-[44ch] text-muted">{context.lead}</p>
          </Reveal>
        </div>
        <Reveal delay={0.3}>
          <SpeakerBadge speakerId="mayank" />
        </Reveal>
      </header>

      <Reveal delay={0.35} className="flex-1 lg:flex lg:flex-col lg:justify-center">
        <Timeline />
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-[calc(5*var(--u))]">
        <Reveal delay={TL_START + TL_DUR} className="border-t-2 border-ink pt-[clamp(12px,calc(1.2*var(--u)),24px)]">
          <p className="t-eyebrow text-deep">{exposure.label}</p>
          <p className="mt-2 flex items-baseline gap-3">
            <span className="t-body font-semibold text-muted">Up to</span>
            <CountUp
              value={exposure.value}
              decimals={exposure.decimals}
              prefix={exposure.prefix}
              delay={TL_START + TL_DUR}
              duration={1.3}
              className="t-metric text-ink"
            />
            <span className="text-[clamp(22px,calc(2.2*var(--u)),46px)] font-bold tracking-[-0.02em]">{exposure.unit}</span>
          </p>
          <p className="t-small mt-2 max-w-[56ch] text-muted">{exposure.qualifier}</p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {priorities.map((p, i) => (
            <Reveal
              key={p.title}
              delay={TL_START + TL_DUR + 0.2 + i * 0.12}
              className="border-t border-line pt-[clamp(12px,calc(1.2*var(--u)),24px)]"
            >
              <p className="t-eyebrow text-muted">{p.who}’s priority</p>
              <p className="mt-2 flex items-center gap-2 text-[clamp(20px,calc(1.8*var(--u)),38px)] font-bold leading-tight tracking-[-0.02em]">
                <CheckCircle2 aria-hidden className="h-[0.85em] w-[0.85em] shrink-0 text-success" />
                {p.title}
              </p>
              <p className="t-body mt-1 text-muted">{p.detail}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
