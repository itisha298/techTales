import { motion } from 'framer-motion';
import { value } from '../content/presentationContent';
import { useMotionPreset } from '../lib/motion';
import { SpeakerBadge } from '../components/Portrait';
import { Eyebrow, Reveal } from '../components/primitives';
import { PulseRing, TravelGlow } from '../components/ambient';
import { useAmbient, useLive } from '../hooks/useAmbient';

const PULSE_AT = 0.9;
const PULSE_DUR = 2.6;

const LOOP_AT = PULSE_AT + PULSE_DUR + 0.6;

function ControlTowerLanes() {
  const m = useMotionPreset();
  const ambient = useAmbient();
  const live = useLive();
  const { journey, layers, controlTower } = value;
  return (
    <figure aria-label={`${journey.label}. ${controlTower}: ${layers.join(', ')}.`}>
      <div className="flex items-end justify-between gap-4">
        <p className="t-body font-bold">{journey.label}</p>
        <p className="t-eyebrow hidden text-deep sm:block">{controlTower}</p>
      </div>
      <div className="mt-[clamp(10px,calc(1.2*var(--u)),24px)] grid grid-cols-[auto_1fr_auto] items-center gap-x-[clamp(10px,calc(1.2*var(--u)),24px)]">
        <p className="t-eyebrow row-span-6 self-stretch border-r-2 border-ink pr-3 text-ink [writing-mode:vertical-rl] rotate-180 text-center">
          {journey.start}
        </p>
        <div className="relative row-span-6 col-start-2 py-1">
          <ul className="grid gap-[clamp(4px,calc(0.55*var(--u)),12px)]">
            {layers.map((layer, i) => (
              <li key={layer} className="grid grid-cols-[clamp(150px,calc(12*var(--u)),240px)_1fr] items-center gap-4">
                <span className="t-small font-semibold text-ink">{layer}</span>
                <span className="relative block h-[2px] bg-line">
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 bg-purple/70"
                    style={{ transformOrigin: 'left' }}
                    initial={{ scaleX: m.reduced ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={m.t(PULSE_DUR, PULSE_AT + i * 0.03, { ease: 'linear' })}
                  />
                  {/* Continuous flow along each relationship line */}
                  <span aria-hidden className="absolute inset-x-0 -top-[1px] h-[4px] overflow-hidden">
                    <TravelGlow duration={7 + (i % 3)} delay={LOOP_AT + i * 0.55} fraction={0.08} className="via-deep/80" repeatDelay={1.5} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {/* Control-tower pulse: one vertical sweep across every layer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-[-10px] right-0 left-[calc(clamp(150px,calc(12*var(--u)),240px)+16px)] overflow-hidden"
          >
            <motion.div
              className="absolute inset-y-0 left-0 w-full"
              initial={{ x: m.reduced ? '99%' : '0%', opacity: 1 }}
              animate={ambient ? { x: '99%', opacity: [1, 1, 0] } : { x: '99%' }}
              transition={m.t(PULSE_DUR + (ambient ? 0.6 : 0), PULSE_AT, { ease: 'linear' })}
            >
              <span className="absolute inset-y-0 left-0 w-[2px] bg-purple" />
              <span className="absolute inset-y-0 left-[-28px] w-[28px] bg-linear-to-l from-purple/15 to-transparent" />
            </motion.div>
            {/* After the entrance sweep, the control tower keeps scanning every layer */}
            {ambient && (
              <motion.div
                data-ambient
                className="absolute inset-y-0 left-0 w-full"
                initial={{ x: '0%', opacity: 0 }}
                animate={live ? { x: ['0%', '99%'], opacity: [0, 0.9, 0.9, 0] } : { x: '0%', opacity: 0 }}
                transition={live ? { duration: 9, delay: LOOP_AT, repeat: Infinity, ease: 'linear', times: [0, 0.08, 0.92, 1], repeatDelay: 1.2 } : { duration: 0 }}
              >
                <span className="absolute inset-y-0 left-0 w-[2px] bg-purple/80" />
                <span className="absolute inset-y-0 left-[-40px] w-[40px] bg-linear-to-l from-purple/12 to-transparent" />
              </motion.div>
            )}
          </div>
        </div>
        <p className="t-eyebrow row-span-6 col-start-3 self-stretch border-l-2 border-purple pl-3 text-deep [writing-mode:vertical-rl] text-center">
          {journey.end}
        </p>
      </div>
    </figure>
  );
}

function Value360({ delay }: { delay: number }) {
  const m = useMotionPreset();
  const q = value.value360.quadrants;
  return (
    <div className="relative">
      <p className="t-eyebrow text-deep">{value.value360.title}</p>
      <div className="relative mt-3 grid grid-cols-2">
        {q.map((label, i) => (
          <motion.div
            key={label}
            className={`flex min-h-[clamp(58px,calc(5.4*var(--u)),110px)] items-end p-[clamp(10px,calc(1*var(--u)),20px)] ${
              i % 2 === 0 ? 'border-r' : ''
            } ${i < 2 ? 'border-b' : ''} border-line ${i === 0 ? 'bg-lavender' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={m.t(0.5, delay + i * 0.22)}
          >
            <p className="t-small font-bold leading-snug">{label}</p>
          </motion.div>
        ))}
        <PulseRing
          className="left-1/2 top-1/2 h-[clamp(28px,calc(2.4*var(--u)),48px)] w-[clamp(28px,calc(2.4*var(--u)),48px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          delay={delay + 1.4}
          duration={4.2}
          scale={2.2}
        />
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[clamp(28px,calc(2.4*var(--u)),48px)] w-[clamp(28px,calc(2.4*var(--u)),48px)] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={m.t(0.4, delay + 0.9)}
        />
      </div>
    </div>
  );
}

export default function ValueScene() {
  const { credentials } = value;
  const after = PULSE_AT + PULSE_DUR - 0.6;
  return (
    <div className="scene-pad flex min-h-full flex-col gap-[clamp(16px,calc(2*var(--u)),44px)]">
      <header className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Reveal>
            <Eyebrow>{value.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1} y={24}>
            <h2 className="t-headline-sm mt-[clamp(12px,calc(1.4*var(--u)),28px)] max-w-[30ch]">{value.headline}</h2>
          </Reveal>
        </div>
        <Reveal delay={0.2}>
          <SpeakerBadge speakerId="neeti" />
        </Reveal>
      </header>

      <Reveal delay={0.4} className="flex-1 lg:flex lg:flex-col lg:justify-center">
        <ControlTowerLanes />
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.75fr_1fr] lg:gap-[calc(4*var(--u))]">
        <Reveal delay={after} className="border-t-2 border-ink pt-[clamp(12px,calc(1.2*var(--u)),24px)]">
          <p className="t-eyebrow text-deep">{credentials.label}</p>
          <dl className="mt-3 flex flex-wrap justify-between gap-x-[calc(2.6*var(--u))] gap-y-4">
            {credentials.items.map((c) => (
              <div key={c.label}>
                <dt className="sr-only">{c.label}</dt>
                <dd>
                  <p className="whitespace-nowrap text-[clamp(20px,calc(1.95*var(--u)),42px)] font-bold leading-none tracking-[-0.03em]">{c.value}</p>
                  <p className="t-small mt-1.5 text-muted">{c.label}</p>
                </dd>
              </div>
            ))}
          </dl>
          <p className="t-lead mt-[clamp(12px,calc(1.4*var(--u)),28px)] font-semibold text-deep">“{value.lesson}”</p>
        </Reveal>
        <Reveal delay={after + 0.3}>
          <Value360 delay={after + 0.4} />
        </Reveal>
      </div>
    </div>
  );
}
