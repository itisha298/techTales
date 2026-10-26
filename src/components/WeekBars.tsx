import { motion } from 'framer-motion';
import { useMotionPreset } from '../lib/motion';

export interface WeekBar {
  label: string;
  weeks: number;
  tone: 'purple' | 'ink' | 'neutral';
}

const fill = { purple: 'bg-purple', ink: 'bg-ink', neutral: 'bg-[#CFC4DC]' } as const;

/**
 * Horizontal week comparison on one shared scale. Values are direct-labelled
 * in text colours; bars carry identity only. Optional dashed "gap" segment
 * shows the shortfall between the last bar and the scale maximum.
 */
export function WeekBars({
  bars,
  max,
  gap,
  delay = 0,
  compact = false,
}: {
  bars: WeekBar[];
  max: number;
  gap?: { weeks: number; label: string };
  delay?: number;
  /** Tighter vertical rhythm for dense scenes. */
  compact?: boolean;
}) {
  const m = useMotionPreset();
  return (
    <div className={`grid ${compact ? 'gap-[clamp(6px,calc(0.6*var(--u)),12px)]' : 'gap-[clamp(10px,calc(1.1*var(--u)),22px)]'}`}>
      {bars.map((b, i) => {
        const pct = (b.weeks / max) * 100;
        const isLast = i === bars.length - 1;
        return (
          <div key={b.label}>
            <p className="t-small text-muted">{b.label}</p>
            <div className={`flex items-center gap-3 ${compact ? 'mt-1' : 'mt-1.5'}`}>
              <div className={`relative flex-1 ${compact ? 'h-[clamp(12px,calc(0.9*var(--u)),18px)]' : 'h-[clamp(14px,calc(1.15*var(--u)),24px)]'}`}>
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-r-[4px] ${fill[b.tone]}`}
                  style={{ width: `${pct}%`, transformOrigin: 'left' }}
                  initial={{ scaleX: m.reduced ? 1 : 0 }}
                  animate={{ scaleX: 1 }}
                  transition={m.t(0.9 + b.weeks * 0.05, delay + i * 0.2)}
                />
                {gap && isLast && (
                  <motion.div
                    className="absolute inset-y-0 rounded-r-[4px] border-2 border-dashed border-warning/80"
                    style={{ left: `calc(${pct}% + 2px)`, width: `calc(${(gap.weeks / max) * 100}% - 2px)` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={m.t(0.5, delay + 1.4)}
                  />
                )}
              </div>
              <p className="w-[5.5ch] shrink-0 text-right t-body font-bold tabular-nums">{b.weeks} wk</p>
            </div>
          </div>
        );
      })}
      {gap && (
        <motion.p
          className="t-body font-bold text-ink"
          initial={{ opacity: 0, y: m.y(8) }}
          animate={{ opacity: 1, y: 0 }}
          transition={m.t(0.5, delay + 1.6)}
        >
          <span aria-hidden className="mr-2 inline-block border-b-2 border-dashed border-warning align-middle" style={{ width: '1.6em' }} />
          {gap.weeks} {gap.label}
        </motion.p>
      )}
    </div>
  );
}
