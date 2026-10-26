import { useEffect, useRef, type RefObject } from 'react';
import { navigationTuning } from '../theme/tokens';

/** True if an element between target and boundary can still scroll in that direction. */
export function canScrollWithin(target: EventTarget | null, boundary: HTMLElement, deltaY: number) {
  let el = target instanceof HTMLElement ? target : null;
  while (el && el !== boundary.parentElement) {
    const style = window.getComputedStyle(el);
    const scrollable = /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
    if (scrollable) {
      if (deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      if (deltaY < 0 && el.scrollTop > 0) return true;
    }
    if (el === boundary) break;
    el = el.parentElement;
  }
  return false;
}

/**
 * Mouse-wheel / trackpad and touch-swipe navigation for the stage.
 * One gesture = one scene: after a change, input is locked until the lock
 * time has passed AND the wheel has been quiet (absorbs trackpad inertia).
 */
export function useGestureNavigation(
  ref: RefObject<HTMLElement | null>,
  { next, prev, enabled }: { next: () => void; prev: () => void; enabled: boolean },
) {
  const handlers = useRef({ next, prev, enabled });
  useEffect(() => {
    handlers.current = { next, prev, enabled };
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { wheelThreshold, wheelLockMs, wheelQuietMs, swipeThreshold } = navigationTuning;

    let accumulated = 0;
    let lockedUntil = 0;
    let lastWheel = 0;

    const onWheel = (e: WheelEvent) => {
      if (!handlers.current.enabled || e.ctrlKey) return; // ctrl+wheel = browser zoom
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (canScrollWithin(e.target, el, delta)) return;
      const t = performance.now();
      const quietFor = t - lastWheel;
      lastWheel = t;
      if (t < lockedUntil) {
        // Inertia keeps the lock alive until the wheel goes quiet.
        lockedUntil = Math.max(lockedUntil, t + wheelQuietMs);
        return;
      }
      if (quietFor > 300) accumulated = 0;
      accumulated += delta;
      if (Math.abs(accumulated) >= wheelThreshold) {
        if (accumulated > 0) handlers.current.next();
        else handlers.current.prev();
        accumulated = 0;
        lockedUntil = t + wheelLockMs;
      }
    };

    let startX = 0;
    let startY = 0;
    let startTarget: EventTarget | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTarget = e.target;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!handlers.current.enabled || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > swipeThreshold && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) handlers.current.next();
        else handlers.current.prev();
      } else if (Math.abs(dy) > swipeThreshold * 1.5 && Math.abs(dy) > Math.abs(dx) * 1.5) {
        // Vertical swipes only navigate once the scene itself cannot scroll further.
        if (canScrollWithin(startTarget, el, -dy)) return;
        if (dy < 0) handlers.current.next();
        else handlers.current.prev();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [ref]);
}
