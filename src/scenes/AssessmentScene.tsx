import { motion } from 'framer-motion';
import { assessment } from '../content/presentationContent';
import { useElementSize } from '../hooks/useElementSize';
import { colors } from '../theme/tokens';
import { useMotionPreset } from '../lib/motion';
import { SpeakerBadge } from '../components/Portrait';
import { Chevron, Eyebrow, Reveal } from '../components/primitives';
import { PulseRing } from '../components/ambient';
import { useAmbient } from '../hooks/useAmbient';

const ROUTE_AT = 1.0;
const ROUTE_DUR = 2.4;

/** Desktop route: stepped path with true 45° rises, measured in pixels. */
function Route() {
  const m = useMotionPreset();
  const ambient = useAmbient();
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const steps = assessment.steps;
  const n = steps.length;
  const stepW = width / n;
  const top = 14;
  const rise = Math.min(stepW * 0.5, Math.max(0, (height - 96) / (n - 1)));
  const pts = steps.map((_, i) => ({ x: 8 + i * stepW, y: top + (n - 1 - i) * rise }));
  let d = pts.length ? `M 0 ${pts[0].y} L ${pts[0].x} ${pts[0].y}` : '';
  for (let i = 1; i < n; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    d += ` L ${b.x - (a.y - b.y)} ${a.y} L ${b.x} ${b.y}`;
  }
  if (pts.length) d += ` L ${width - 2} ${pts[n - 1].y}`;
  const at = (i: number) => ROUTE_AT + (ROUTE_DUR * i) / n;

  return (
    <div ref={ref} className="relative hidden h-full min-h-[200px] lg:block">
      {width > 0 && (
        <>
          <svg aria-hidden className="absolute inset-0 overflow-visible" width={width} height={height}>
            <path d={d} fill="none" stroke={colors.line} strokeWidth={2} />
            <motion.path
              d={d}
              fill="none"
              stroke={colors.purple}
              strokeWidth={2.5}
              initial={{ pathLength: m.reduced ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={m.t(ROUTE_DUR, ROUTE_AT, { ease: 'linear' })}
            />
            {/* Continuous light travelling the route through every stage */}
            {ambient && (
              <path
                data-ambient
                d={d}
                pathLength={1}
                fill="none"
                stroke={colors.deepPurple}
                strokeWidth={4}
                strokeLinecap="round"
                className="route-flow"
                style={{ animationDelay: `${ROUTE_AT + ROUTE_DUR}s` }}
              />
            )}
          </svg>
          <ol>
            {steps.map((s, i) => (
              <motion.li
                key={s}
                className="absolute"
                style={{ left: pts[i].x, top: pts[i].y, width: stepW - 16 }}
                initial={{ opacity: 0, y: m.y(10) }}
                animate={{ opacity: 1, y: 0 }}
                transition={m.t(0.45, at(i))}
              >
                <PulseRing className="-left-[8px] -top-[8px] h-4 w-4 rotate-45" delay={ROUTE_AT + ROUTE_DUR + i * 0.75} duration={4.5} scale={2.4} />
                <span
                  aria-hidden
                  className={`absolute -left-[8px] -top-[8px] h-4 w-4 rotate-45 border-2 border-purple ${
                    i === n - 1 ? 'bg-purple' : 'bg-white'
                  }`}
                />
                <p className="t-eyebrow pt-[22px] text-deep">{String(i + 1).padStart(2, '0')}</p>
                <p className="t-body mt-1 pr-2 font-bold leading-snug text-ink">{s}</p>
              </motion.li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

/** Small-screen route: vertical list on a line. */
function RouteStacked() {
  return (
    <ol className="relative grid gap-5 border-l-2 border-purple pl-6 lg:hidden">
      {assessment.steps.map((s, i) => (
        <li key={s} className="relative">
          <span aria-hidden className="absolute -left-[33px] top-1 h-4 w-4 rotate-45 border-2 border-purple bg-white" />
          <span className="t-eyebrow text-deep">{String(i + 1).padStart(2, '0')}</span>
          <p className="t-body font-bold">{s}</p>
        </li>
      ))}
    </ol>
  );
}

export default function AssessmentScene() {
  const m = useMotionPreset();
  return (
    <div className="scene-pad flex min-h-full flex-col gap-[clamp(18px,calc(2.4*var(--u)),48px)]">
      <header className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Reveal>
            <Eyebrow>{assessment.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1} y={24}>
            <h2 className="t-headline mt-[clamp(12px,calc(1.4*var(--u)),28px)]">{assessment.headline}</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="t-lead mt-[clamp(10px,calc(1.2*var(--u)),24px)] max-w-[52ch] text-muted">{assessment.commitment}</p>
          </Reveal>
        </div>
        <Reveal delay={0.25}>
          <SpeakerBadge speakerId="suryakanta" />
        </Reveal>
      </header>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4" aria-label="Why Accenture">
        {assessment.reasons.map((r, i) => (
          <motion.li
            key={r}
            className="flex items-center gap-3 border-t-2 border-ink pt-[clamp(8px,calc(0.9*var(--u)),18px)]"
            initial={{ opacity: 0, y: m.y(14) }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.t(0.5, 0.35 + i * 0.1)}
          >
            <Chevron className="h-[0.9em] w-[0.55em] shrink-0 text-purple" strokeWidth={2.5} />
            <span className="text-[clamp(18px,calc(1.6*var(--u)),34px)] font-bold leading-tight tracking-[-0.02em]">{r}</span>
          </motion.li>
        ))}
      </ul>

      <div className="flex flex-1 flex-col">
        <Reveal delay={ROUTE_AT - 0.2}>
          <p className="t-eyebrow text-deep">{assessment.routeTitle}</p>
        </Reveal>
        <div className="mt-[clamp(12px,calc(1.6*var(--u)),32px)] flex-1">
          <Route />
          <RouteStacked />
        </div>
      </div>

      <Reveal delay={ROUTE_AT + ROUTE_DUR}>
        <p className="t-lead font-bold text-ink">{assessment.closing}</p>
      </Reveal>
    </div>
  );
}
