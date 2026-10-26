/**
 * Central design tokens.
 *
 * Colours are mirrored as CSS custom properties in src/index.css (@theme).
 * If you change a colour here, change the matching `--color-*` value there
 * too (see CONTENT_EDITING_GUIDE.md → Theme colours).
 */
export const colors = {
  purple: '#A100FF',
  deepPurple: '#460073',
  violet: '#7C3AED',
  ink: '#161616',
  lavender: '#F6F1FF',
  line: '#E7DDF2',
  /** Slightly stronger line for illustration nodes and the globe outline. */
  lineStrong: '#D9C8EC',
  muted: '#68616F',
  white: '#FFFFFF',
  success: '#14805E',
  warning: '#B76E00',
  /** Text-safe variant of warning (contrast ≥ 4.5:1 on white). */
  warningInk: '#8A5300',
} as const;

/** Signature easing curve used across the experience. */
export const ease = [0.22, 1, 0.36, 1] as const;

/** Durations in seconds. */
export const durations = {
  micro: 0.2,
  reveal: 0.55,
  sceneEnter: 0.6,
  sceneExit: 0.28,
} as const;

/** Wheel / swipe tuning for scene navigation. */
export const navigationTuning = {
  wheelThreshold: 40,
  /** Minimum ms between wheel-driven scene changes. */
  wheelLockMs: 900,
  /** Wheel must go quiet for this long before another change (absorbs trackpad inertia). */
  wheelQuietMs: 220,
  swipeThreshold: 60,
  /** Presenter toolbar auto-hide delay. */
  toolbarIdleMs: 2600,
} as const;
