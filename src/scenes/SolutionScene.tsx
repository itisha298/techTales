import { motion } from 'framer-motion';
import { Check, PenLine, X } from 'lucide-react';
import { solution } from '../content/presentationContent';
import { colors } from '../theme/tokens';
import { useMotionPreset } from '../lib/motion';
import { SpeakerBadge } from '../components/Portrait';
import { Chevron, CountUp, Eyebrow, Reveal } from '../components/primitives';
import { WeekBars } from '../components/WeekBars';
import { PulseRing } from '../components/ambient';
import { useAmbient, useLive } from '../hooks/useAmbient';

const FLOW_START = 0.45;
const FLOW_DUR = 1.7;
const HUMAN_AT = FLOW_START + FLOW_DUR;
/** Icons for the three expert actions, in order (accept, edit, reject). */
const ACTION_ICONS = [Check, PenLine, X] as const;

/** A data packet crossing the whole workflow track toward human review. */
function Packet({ delay }: { delay: number }) {
  const on = useAmbient();
  const live = useLive();
  if (!on) return null;
  return (
    <motion.span
      aria-hidden
      data-ambient
      className="absolute inset-y-0 left-0 w-full"
      initial={{ x: '0%', opacity: 0 }}
      animate={live ? { x: ['0%', '100%'], opacity: [0, 1, 1, 0] } : { x: '0%', opacity: 0 }}
      transition={live ? { duration: 6, delay, repeat: Infinity, ease: 'linear', times: [0, 0.08, 0.9, 1] } : { duration: 0 }}
    >
      <span className="absolute left-0 top-1/2 h-[9px] w-[9px] -translate-y-1/2 rotate-45 bg-deep" />
    </motion.span>
  );
}

function DiscoveryFlow() {
  const m = useMotionPreset();
  const machine = solution.flow.slice(0, -1);
  return (
    <div className="grid gap-[clamp(16px,calc(1.8*var(--u)),36px)] lg:grid-cols-[minmax(0,2.35fr)_minmax(0,1fr)]">
      <div>
        {/* Group labels: the AI drafts, it does not decide */}
        <div className="hidden grid-cols-6 gap-3 lg:grid">
          <p className="t-eyebrow col-span-1 text-muted">Source</p>
          <p className="t-eyebrow col-span-5 border-l border-line pl-3 text-deep">GenWizard drafts</p>
        </div>
        <div className="relative mt-3">
          <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-line lg:block" />
          <motion.div
            aria-hidden
            className="absolute left-0 right-0 top-[6px] hidden h-[3px] bg-purple lg:block"
            style={{ transformOrigin: 'left' }}
            initial={{ scaleX: m.reduced ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={m.t(FLOW_DUR, FLOW_START, { ease: 'linear' })}
          />
          <div aria-hidden className="absolute left-0 right-[10px] top-[3px] hidden h-[9px] overflow-hidden lg:block">
            <Packet delay={HUMAN_AT + 0.8} />
            <Packet delay={HUMAN_AT + 3.8} />
          </div>
          <ol className="relative grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
            {machine.map((step, i) => (
              <motion.li
                key={step}
                initial={{ opacity: 0.25 }}
                animate={{ opacity: 1 }}
                transition={m.t(0.35, FLOW_START + (FLOW_DUR * i) / 6)}
              >
                <span className="relative block h-[15px] w-[15px]">
                  {i === 1 && <PulseRing className="inset-0 rotate-45" delay={HUMAN_AT + 0.5} duration={3.8} scale={2.6} />}
                  <span aria-hidden className="absolute inset-0 rotate-45 border-2 border-purple bg-white" />
                </span>
                <p className="t-eyebrow mt-3 text-muted">{String(i + 1).padStart(2, '0')}</p>
                <p className="t-small mt-1 font-bold leading-snug text-ink">{step}</p>
              </motion.li>
            ))}
          </ol>
        </div>
        <motion.p
          className="t-body mt-[clamp(12px,calc(1.5*var(--u)),30px)] max-w-[56ch] border-l-2 border-purple pl-4 font-semibold text-ink"
          initial={{ opacity: 0, y: m.y(10) }}
          animate={{ opacity: 1, y: 0 }}
          transition={m.t(0.5, HUMAN_AT + 0.6)}
        >
          {solution.human.decision}
        </motion.p>
      </div>

      {/* Human review gate, with a slow pulse marking where decisions are made */}
      <div className="relative">
      <PulseRing className="inset-0" delay={HUMAN_AT + 1} duration={4.5} scale={1.04} />
      <motion.div
        className="cut-br relative bg-deep p-[clamp(16px,calc(1.6*var(--u)),32px)] text-white [--cut:22px]"
        initial={{ opacity: 0, x: m.y(-16) }}
        animate={{ opacity: 1, x: 0 }}
        transition={m.t(0.6, HUMAN_AT)}
      >
        <p className="t-eyebrow text-white/80">07 · Experts decide</p>
        <p className="mt-2 text-[clamp(22px,calc(2*var(--u)),42px)] font-bold leading-tight tracking-[-0.02em]">
          {solution.human.title}
        </p>
        <p className="t-small mt-1 text-white/85">{solution.human.statement}</p>
        <ul className="mt-[clamp(10px,calc(1.2*var(--u)),24px)] flex flex-wrap gap-2" aria-label="Expert actions on every draft">
          {solution.human.actions.map((a, i) => {
            const Icon = ACTION_ICONS[i] ?? Check;
            return (
              <motion.li
                key={a}
                className="t-small inline-flex items-center gap-1.5 border border-white/50 px-3 py-1.5 font-bold"
                initial={{ opacity: 0, y: m.y(8) }}
                animate={{ opacity: 1, y: 0 }}
                transition={m.t(0.4, HUMAN_AT + 0.3 + i * 0.12)}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {a}
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
      </div>
    </div>
  );
}

/** Samples a cubic bezier into keyframes for a travelling pulse. */
const bezier = (p0: number, p1: number, p2: number, p3: number) =>
  Array.from({ length: 13 }, (_, k) => {
    const t = k / 12;
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
  });

function ControlTower() {
  const ambient = useAmbient();
  const live = useLive();
  const ys = [22, 60, 98];
  return (
    <svg aria-hidden viewBox="0 0 260 120" className="h-[clamp(56px,calc(4.6*var(--u)),96px)] w-auto">
      {ys.map((y, i) => (
        <g key={y}>
          <path d={`M 34 ${y} C 120 ${y}, 140 60, 206 60`} fill="none" stroke={colors.line} strokeWidth={1.5} />
          <rect x={14} y={y - 9} width={18} height={18} fill={colors.white} stroke={colors.ink} strokeWidth={1.5} />
          {ambient && (
            <motion.circle
              r={4}
              fill={colors.purple}
              data-ambient
              initial={{ cx: 34, cy: y, opacity: 0 }}
              animate={live ? { cx: bezier(34, 120, 140, 206), cy: bezier(y, y, 60, 60), opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0] } : { cx: 34, cy: y, opacity: 0 }}
              transition={live ? { duration: 1.6, delay: HUMAN_AT + 0.6 + i * 0.25, repeat: Infinity, repeatDelay: 1.4, ease: 'linear' } : { duration: 0 }}
            />
          )}
        </g>
      ))}
      <rect x={206} y={42} width={36} height={36} fill={colors.purple} transform="rotate(45 224 60)" />
    </svg>
  );
}

export default function SolutionScene() {
  const { poc, discovery, controlTower } = solution;
  const results = HUMAN_AT + 0.4;
  return (
    <div className="scene-pad flex min-h-full flex-col gap-[clamp(14px,calc(1.6*var(--u)),36px)]">
      <header className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Reveal>
            <Eyebrow>{solution.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1} y={24}>
            <h2 className="t-headline-sm mt-[clamp(12px,calc(1.4*var(--u)),28px)] max-w-[24ch]">{solution.headline}</h2>
          </Reveal>
        </div>
        <Reveal delay={0.2}>
          <SpeakerBadge speakerId="sushant" />
        </Reveal>
      </header>

      <Reveal delay={0.3}>
        <DiscoveryFlow />
      </Reveal>

      <div className="mt-auto grid gap-8 border-t border-line pt-[clamp(14px,calc(1.6*var(--u)),32px)] lg:grid-cols-[1.1fr_1.15fr_0.8fr] lg:gap-[calc(3.2*var(--u))]">
        <Reveal delay={results}>
          <p className="t-eyebrow text-deep">{poc.label}</p>
          <div className="mt-3 grid grid-cols-[auto_auto_1fr] items-start gap-x-[calc(2.4*var(--u))] gap-y-3">
            {poc.metrics.map((mt, i) => (
              <div key={mt.label}>
                <CountUp value={mt.value} delay={results + i * 0.1} className="t-metric-sm" />
                <p className="t-small mt-1 text-muted">{mt.label}</p>
              </div>
            ))}
            <div>
              <p className="t-metric-sm text-purple">{poc.acceptance.value}</p>
              <p className="t-small mt-1 text-muted">{poc.acceptance.label}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={results + 0.15}>
          <p className="t-eyebrow text-deep">{discovery.summary}</p>
          <div className="mt-3">
            <WeekBars
              max={discovery.before.weeks}
              delay={results + 0.3}
              compact
              bars={[
                { label: discovery.before.label, weeks: discovery.before.weeks, tone: 'neutral' },
                { label: discovery.after.label, weeks: discovery.after.weeks, tone: 'purple' },
              ]}
            />
          </div>
          <p className="t-small mt-2 text-muted">{discovery.note}</p>
        </Reveal>

        <Reveal delay={results + 0.3}>
          <p className="t-eyebrow text-deep">{controlTower.name}</p>
          <div className="mt-3 flex items-center gap-4">
            <ControlTower />
          </div>
          <p className="t-body mt-2 font-bold">{controlTower.label}</p>
        </Reveal>
      </div>

      <Reveal delay={results + 0.6}>
        <p className="t-body flex items-start gap-3 font-semibold">
          <Chevron className="mt-[0.3em] h-[0.9em] w-[0.55em] shrink-0 text-purple" strokeWidth={2.5} />
          {solution.ask}
        </p>
      </Reveal>
    </div>
  );
}
