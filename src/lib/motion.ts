import { useReducedMotion, type Transition } from 'framer-motion';
import { ease } from '../theme/tokens';

/**
 * Motion preset that respects prefers-reduced-motion.
 * Reduced: no movement, no delays, short fades only. Content is never hidden.
 */
export function useMotionPreset() {
  const reduced = !!useReducedMotion();
  return {
    reduced,
    t: (duration: number, delay = 0, extra?: Transition): Transition =>
      reduced
        ? { duration: Math.min(duration, 0.2), delay: 0, ease }
        : { duration, delay, ease, ...extra },
    y: (px: number) => (reduced ? 0 : px),
  };
}

/** Diagonal (45°-style) mask reveal, left to right. */
export const diagonalHidden = 'polygon(0% 0%, 0% 0%, -40% 100%, -40% 100%)';
export const diagonalShown = 'polygon(0% 0%, 140% 0%, 100% 100%, -40% 100%)';

/** Scale unit helper: u(4) → "calc(4 * var(--u))". */
export const u = (n: number) => `calc(${n} * var(--u))`;

export const formatClock = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(Math.abs(totalSeconds)));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${totalSeconds < 0 ? '−' : ''}${m}:${r.toString().padStart(2, '0')}`;
};
