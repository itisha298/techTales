import { motion } from 'framer-motion';
import { challenge } from '../content/presentationContent';
import { colors } from '../theme/tokens';
import { useMotionPreset } from '../lib/motion';
import { SpeakerBadge } from '../components/Portrait';
import { CountUp, Eyebrow, Reveal } from '../components/primitives';
import { WeekBars } from '../components/WeekBars';
import { useAmbient, useLive } from '../hooks/useAmbient';

/* ---------- Abstract legacy estate ---------- */

const COLS = 7;
const ROWS = 6;
const GX = (c: number) => 40 + c * 88;
const GY = (r: number) => 36 + r * 80;
// Grid positions that hold a node (deterministic, hand-tuned for balance).
const NODES: [number, number][] = [
  [0, 0], [2, 0], [3, 0], [5, 0], [6, 0],
  [1, 1], [2, 1], [4, 1], [6, 1],
  [0, 2], [1, 2], [3, 2], [4, 2], [5, 2],
  [0, 3], [2, 3], [3, 3], [5, 3], [6, 3],
  [1, 4], [2, 4], [4, 4], [6, 4],
  [0, 5], [3, 5], [4, 5], [5, 5],
];
const EDGES: [number, number][] = [
  [0, 5], [1, 6], [2, 6], [2, 7], [3, 7], [4, 8], [5, 10], [6, 11], [7, 12], [8, 13], [9, 10], [10, 11],
  [11, 12], [12, 13], [9, 14], [10, 15], [11, 16], [13, 17], [13, 18], [14, 19], [15, 20], [16, 21], [17, 21],
  [18, 22], [19, 23], [20, 24], [21, 25], [22, 26], [24, 25], [16, 24],
];
/** Nodes that surface one by one, ending at the focal rule. */
const SURFACING = [6, 11, 2, 16, 21, 13, 12];
const FOCAL = 12;
const FRAGMENT_AT = [0, 4, 9, 19, 23, 26];

const edgePath = (a: number, b: number) => {
  const [c1, r1] = NODES[a];
  const [c2, r2] = NODES[b];
  return `M ${GX(c1)} ${GY(r1)} H ${GX(c2)} V ${GY(r2)}`;
};

const SURFACE_START = 0.9;
const SURFACE_STEP = 0.32;
const FOCAL_AT = SURFACE_START + SURFACE_STEP * SURFACING.length;
const DECODE_AT = FOCAL_AT + 0.9;
/** Continuous motion starts once the entrance has settled. */
const AMBIENT_AT = DECODE_AT + 0.8;
/** Faint (still-hidden) connections that gently light up in turn. */
const GLINTS = [1, 8, 14, 18, 23, 26];

/** Keyframes for a packet travelling an orthogonal edge (H then V), timed by segment length. */
const packetPath = (a: number, b: number) => {
  const [c1, r1] = NODES[a];
  const [c2, r2] = NODES[b];
  const h = Math.abs(GX(c2) - GX(c1));
  const v = Math.abs(GY(r2) - GY(r1));
  const knee = h + v === 0 ? 0.5 : h / (h + v);
  return { cx: [GX(c1), GX(c2), GX(c2)], cy: [GY(r1), GY(r1), GY(r2)], times: [0, knee, 1], length: h + v };
};

function LegacyEstate() {
  const m = useMotionPreset();
  const ambient = useAmbient();
  const live = useLive();
  const surfacedEdges = EDGES.filter(([a, b]) => SURFACING.includes(a) && SURFACING.includes(b));
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${GX(COLS - 1) + 40} ${GY(ROWS - 1) + 36}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Faint workflow paths */}
      {EDGES.map(([a, b], i) => (
        <motion.path
          key={`e${i}`}
          d={edgePath(a, b)}
          fill="none"
          stroke={colors.line}
          strokeWidth={1.25}
          initial={{ pathLength: m.reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={m.t(1.1, 0.1 + i * 0.015)}
        />
      ))}
      {/* Paths between surfaced rules become visible */}
      {surfacedEdges.map(([a, b], i) => (
        <motion.path
          key={`s${i}`}
          d={edgePath(a, b)}
          fill="none"
          stroke={colors.purple}
          strokeOpacity={0.55}
          strokeWidth={1.75}
          initial={{ pathLength: m.reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={m.t(0.7, SURFACE_START + 0.4 + i * SURFACE_STEP)}
        />
      ))}
      {/* Unreadable code fragments: illustrative only */}
      {FRAGMENT_AT.map((n, i) => {
        const [c, r] = NODES[n];
        return (
          <motion.text
            key={`f${n}`}
            x={c >= 5 ? GX(c) - 12 : GX(c) + 12}
            y={GY(r) - 10}
            textAnchor={c >= 5 ? 'end' : 'start'}
            fill={colors.muted}
            fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace"
            fontSize={13}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.38 }}
            transition={m.t(0.8, 0.4 + i * 0.1)}
          >
            {challenge.fragments[i]}
          </motion.text>
        );
      })}
      {ambient && (
        <g>
          {/* Hidden connections gently illuminating, one after another */}
          {GLINTS.map((e, i) => (
            <motion.path
              key={`g${e}`}
              d={edgePath(...EDGES[e])}
              fill="none"
              stroke={colors.purple}
              strokeWidth={1.25}
              data-ambient
              initial={{ opacity: 0 }}
              animate={live ? { opacity: [0, 0.32, 0] } : { opacity: 0 }}
              transition={live ? { duration: 5, delay: AMBIENT_AT + i * 1.6, repeat: Infinity, repeatDelay: GLINTS.length * 1.6 - 5, ease: 'easeInOut' } : { duration: 0 }}
            />
          ))}
          {/* Data streams flowing along the surfaced rule paths */}
          {surfacedEdges.map(([a, b], i) => {
            const p = packetPath(a, b);
            const duration = Math.max(2.4, p.length / 70);
            return (
              <motion.circle
                key={`p${i}`}
                r={3.5}
                fill={colors.purple}
                data-ambient
                initial={{ cx: p.cx[0], cy: p.cy[0], opacity: 0 }}
                animate={live ? { cx: p.cx, cy: p.cy, opacity: [0, 1, 1, 0] } : { cx: p.cx[0], cy: p.cy[0], opacity: 0 }}
                transition={!live ? { duration: 0 } : {
                  cx: { duration, times: p.times, repeat: Infinity, repeatDelay: 1.2, delay: AMBIENT_AT + i * 0.7, ease: 'linear' },
                  cy: { duration, times: p.times, repeat: Infinity, repeatDelay: 1.2, delay: AMBIENT_AT + i * 0.7, ease: 'linear' },
                  opacity: { duration, times: [0, 0.15, 0.85, 1], repeat: Infinity, repeatDelay: 1.2, delay: AMBIENT_AT + i * 0.7 },
                }}
              />
            );
          })}
          {/* The decoded rule keeps a slow heartbeat */}
          <motion.circle
            cx={GX(NODES[FOCAL][0])}
            cy={GY(NODES[FOCAL][1])}
            r={16}
            fill="none"
            stroke={colors.purple}
            strokeWidth={1}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            data-ambient
            initial={{ opacity: 0, scale: 1 }}
            animate={live ? { opacity: [0.5, 0], scale: [1, 2.2] } : { opacity: 0, scale: 1 }}
            transition={live ? { duration: 4, delay: AMBIENT_AT, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.3 } : { duration: 0 }}
          />
        </g>
      )}
      {/* Nodes */}
      {NODES.map(([c, r], i) => {
        const order = SURFACING.indexOf(i);
        const surfaced = order >= 0;
        const at = SURFACE_START + order * SURFACE_STEP;
        return (
          <g key={`n${i}`} transform={`translate(${GX(c)} ${GY(r)})`}>
            <circle r={3.5} fill={colors.lineStrong} />
            {surfaced && (
              <>
                <motion.rect
                  x={-7}
                  y={-7}
                  width={14}
                  height={14}
                  transform="rotate(45)"
                  fill={i === FOCAL ? colors.purple : colors.white}
                  stroke={colors.purple}
                  strokeWidth={2}
                  initial={{ opacity: 0, scale: m.reduced ? 1 : 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={m.t(0.45, at)}
                />
                {!m.reduced && (
                  <motion.circle
                    r={18}
                    fill="none"
                    stroke={colors.purple}
                    strokeWidth={1}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 0.6, 0], scale: [0.4, 1.4, 1.8] }}
                    transition={{ duration: 1.1, delay: at, ease: 'easeOut' }}
                  />
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DecodedRule() {
  const m = useMotionPreset();
  const r = challenge.hiddenRule;
  return (
    <motion.div
      className="relative border-l-2 border-purple bg-white/95 py-[clamp(12px,calc(1.2*var(--u)),24px)] pl-[clamp(14px,calc(1.4*var(--u)),28px)] pr-4 shadow-[0_18px_40px_-28px_rgba(70,0,115,0.45)]"
      initial={{ opacity: 0, y: m.y(14) }}
      animate={{ opacity: 1, y: 0 }}
      transition={m.t(0.55, FOCAL_AT)}
    >
      <p className="t-eyebrow text-muted">{r.tag}</p>
      <motion.p
        className="mt-2 font-mono text-[clamp(13px,calc(0.95*var(--u)),19px)] text-ink"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.42 }}
        transition={m.t(0.6, DECODE_AT)}
      >
        <span aria-hidden>{r.code}</span>
        <span className="sr-only">Code-like legacy rule</span>
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: m.y(10) }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.t(0.6, DECODE_AT + 0.15)}
      >
        <p className="mt-3 t-body font-bold text-ink">{r.plain}</p>
        <p className="t-body text-deep">{r.impact}</p>
      </motion.div>
    </motion.div>
  );
}

export default function ChallengeScene() {
  const { story, discovery } = challenge;
  return (
    <div className="scene-pad grid min-h-full gap-[clamp(24px,calc(3*var(--u)),60px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col">
        <Reveal>
          <Eyebrow>{challenge.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.1} y={24}>
          <h2 className="t-headline-sm mt-[clamp(12px,calc(1.4*var(--u)),28px)] max-w-[18ch]">{challenge.headline}</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="t-lead mt-[clamp(10px,calc(1.2*var(--u)),24px)] max-w-[46ch] text-muted">{challenge.lead}</p>
        </Reveal>

        <div className="mt-auto pt-[clamp(14px,calc(1.4*var(--u)),32px)]">
          <Reveal delay={0.4} className="border-t border-line pt-[clamp(10px,calc(1*var(--u)),20px)]">
            <p className="t-eyebrow text-deep">
              {story.label} <span className="text-muted">· {story.who}</span>
            </p>
            <div className="mt-[clamp(8px,calc(1*var(--u)),20px)] flex flex-wrap items-end gap-x-[calc(4*var(--u))] gap-y-3">
              {story.metrics.map((mt, i) => (
                <div key={mt.label}>
                  <CountUp value={mt.value} delay={0.5 + i * 0.15} className="t-metric" />
                  <p className="t-body mt-1 text-muted">{mt.label}</p>
                </div>
              ))}
            </div>
            <p className="t-small mt-2 text-muted">{story.context}</p>
          </Reveal>
          <Reveal delay={0.7} className="mt-[clamp(16px,calc(2*var(--u)),40px)]">
            <WeekBars
              max={discovery.needed.weeks}
              delay={0.9}
              bars={[
                { label: discovery.needed.label, weeks: discovery.needed.weeks, tone: 'ink' },
                { label: discovery.planned.label, weeks: discovery.planned.weeks, tone: 'purple' },
              ]}
              gap={{ weeks: discovery.gap.weeks, label: discovery.gap.label }}
            />
          </Reveal>
        </div>
      </div>

      <div className="relative flex flex-col">
        <Reveal delay={0.2} className="flex justify-end">
          <SpeakerBadge speakerId="sushant" />
        </Reveal>
        <div className="relative flex-1">
          <div className="relative h-[260px] sm:h-[340px] lg:absolute lg:inset-0 lg:bottom-[22%] lg:h-auto">
            <LegacyEstate />
          </div>
          <div className="relative mt-4 lg:absolute lg:bottom-0 lg:left-[14%] lg:right-0 lg:mt-0">
            <DecodedRule />
          </div>
        </div>
      </div>
    </div>
  );
}
