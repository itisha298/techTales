import { useEffect, useState } from 'react';
import { useMotionPreset } from '../lib/motion';

/** Tracks whether the browser tab is visible. */
export function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

/** True when continuous ambient motion should run. */
export function useAmbient() {
  const { reduced } = useMotionPreset();
  const visible = usePageVisible();
  return !reduced && visible;
}

/**
 * True one frame after mount (and only while ambient motion is allowed).
 *
 * Loops must start by *changing* their animate target after mount. Scenes
 * opened directly (refresh, deep link) sit under AnimatePresence
 * initial={false}, which snaps any mount-time animation, including an
 * infinite loop, straight to its final keyframe. Switching from a rest
 * state to the loop after mount always animates.
 */
export function useLive() {
  const on = useAmbient();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return on && mounted;
}
