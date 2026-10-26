import { motion } from 'framer-motion';
import { useAmbient, useLive } from '../hooks/useAmbient';

/**
 * Continuous "living" motion shared by every scene.
 *
 * - Loops are transform/opacity only (GPU-friendly, no layout shift).
 * - Scenes unmount when they become inactive, so their loops stop with them.
 * - Loops are removed while the browser tab is hidden and restart when visible.
 * - With prefers-reduced-motion they render nothing: the static scene keeps
 *   all information.
 */
/** Soft expanding ring around a milestone or indicator (3–5 s). */
export function PulseRing({
  className = '',
  delay = 0,
  duration = 4,
  scale = 2.4,
  tone = 'purple',
}: {
  className?: string;
  delay?: number;
  duration?: number;
  scale?: number;
  tone?: 'purple' | 'white';
}) {
  const on = useAmbient();
  const live = useLive();
  if (!on) return null;
  return (
    <motion.span
      aria-hidden
      data-ambient
      className={`pointer-events-none absolute border ${tone === 'white' ? 'border-white/60' : 'border-purple/60'} ${className}`}
      initial={{ scale: 1, opacity: 0 }}
      animate={live ? { scale: [1, scale], opacity: [0.55, 0] } : { scale: 1, opacity: 0 }}
      transition={live ? { duration, delay, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.4 } : { duration: 0 }}
    />
  );
}

/**
 * A soft highlight travelling along a line. Place inside a positioned,
 * overflow-hidden track; it crosses the full track width seamlessly.
 */
export function TravelGlow({
  duration = 6,
  delay = 0,
  fraction = 0.14,
  className = 'via-purple',
  repeatDelay = 0.8,
}: {
  duration?: number;
  delay?: number;
  /** Glow width as a fraction of the track. */
  fraction?: number;
  className?: string;
  repeatDelay?: number;
}) {
  const on = useAmbient();
  const live = useLive();
  if (!on) return null;
  return (
    <motion.span
      aria-hidden
      data-ambient
      className={`pointer-events-none absolute inset-y-0 left-0 bg-linear-to-r from-transparent to-transparent ${className}`}
      style={{ width: `${fraction * 100}%` }}
      initial={{ x: '-100%' }}
      animate={live ? { x: ['-100%', `${100 / fraction}%`] } : { x: '-100%' }}
      transition={live ? { duration, delay, repeat: Infinity, ease: 'linear', repeatDelay } : { duration: 0 }}
    />
  );
}

/** Very slow drifting ambient light (12–20 s), for backgrounds only. */
export function AmbientLight({
  className = '',
  duration = 18,
  drift = 40,
}: {
  className?: string;
  duration?: number;
  /** Drift distance in px. */
  drift?: number;
}) {
  const on = useAmbient();
  const live = useLive();
  if (!on) return null;
  return (
    <motion.span
      aria-hidden
      data-ambient
      className={`pointer-events-none absolute rounded-full ${className}`}
      initial={{ x: 0, y: 0, opacity: 0.6 }}
      animate={live ? { x: [0, drift, -drift * 0.5, 0], y: [0, -drift * 0.6, drift * 0.4, 0], opacity: [0.6, 1, 0.75, 0.6] } : { x: 0, y: 0, opacity: 0.6 }}
      transition={live ? { duration, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
    />
  );
}

/** A gentle forward nudge for arrows and chevrons (3–4 s). */
export function Nudge({ children, distance = 5, duration = 3.6 }: { children: React.ReactNode; distance?: number; duration?: number }) {
  const on = useAmbient();
  const live = useLive();
  if (!on) return <>{children}</>;
  return (
    <motion.span
      data-ambient
      className="inline-flex"
      initial={{ x: 0 }}
      animate={live ? { x: [0, distance, 0] } : { x: 0 }}
      transition={live ? { duration, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
    >
      {children}
    </motion.span>
  );
}
