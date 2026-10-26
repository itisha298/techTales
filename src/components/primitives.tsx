import { animate, motion, type HTMLMotionProps } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { durations, ease } from '../theme/tokens';
import { useMotionPreset } from '../lib/motion';

/** Fade + short rise. The workhorse content reveal. */
export function Reveal({
  delay = 0,
  y = 18,
  duration = durations.reveal,
  children,
  ...rest
}: { delay?: number; y?: number; duration?: number; children: ReactNode } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const m = useMotionPreset();
  return (
    <motion.div
      initial={{ opacity: 0, y: m.y(y) }}
      animate={{ opacity: 1, y: 0 }}
      transition={m.t(duration, delay)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Small uppercase label with a short purple lead rule. */
export function Eyebrow({
  children,
  tone = 'purple',
  className = '',
}: {
  children: ReactNode;
  tone?: 'purple' | 'muted' | 'light';
  className?: string;
}) {
  const color = tone === 'purple' ? 'text-deep' : tone === 'light' ? 'text-white/85' : 'text-muted';
  const rule = tone === 'light' ? 'bg-white' : 'bg-purple';
  return (
    <p className={`t-eyebrow flex items-center gap-3 ${color} ${className}`}>
      <span aria-hidden className={`inline-block h-[2px] w-8 ${rule}`} />
      {children}
    </p>
  );
}

/** The forward-motion ">" motif, drawn with two strokes. */
export function Chevron({ className = '', strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 12 20" className={className} fill="none">
      <path d="M2 2 L10 10 L2 18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" />
    </svg>
  );
}

/** Animated number. The final value is always available to assistive tech. */
export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.4,
  delay = 0,
  className = '',
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionPreset();
  const format = (v: number) =>
    `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  const final = format(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const fmt = (v: number) =>
      `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
    if (reduced) {
      node.textContent = fmt(value);
      return;
    }
    node.textContent = fmt(0);
    const controls = animate(0, value, { duration, delay, ease, onUpdate: (v) => (node.textContent = fmt(v)) });
    return () => controls.stop();
  }, [value, decimals, prefix, suffix, duration, delay, reduced]);

  return (
    <span className={className}>
      <span aria-hidden ref={ref} data-final={final}>
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}

/** Thin horizontal rule that draws from left to right. */
export function DrawRule({
  delay = 0,
  duration = 0.9,
  className = 'bg-line',
  origin = 'left',
}: {
  delay?: number;
  duration?: number;
  className?: string;
  origin?: 'left' | 'right';
}) {
  const m = useMotionPreset();
  return (
    <motion.span
      aria-hidden
      className={`block h-px w-full ${className}`}
      style={{ transformOrigin: origin }}
      initial={{ scaleX: m.reduced ? 1 : 0 }}
      animate={{ scaleX: 1 }}
      transition={m.t(duration, delay)}
    />
  );
}
