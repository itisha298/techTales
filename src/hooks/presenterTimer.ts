import { useSyncExternalStore } from 'react';

/**
 * Presenter timer as a tiny external store, so only the components that
 * display time re-render each second (not the whole deck).
 */
interface Snapshot {
  running: boolean;
  elapsed: number; // seconds, whole presentation
  sceneElapsed: number; // seconds since the current scene opened
}

let running = false;
let accumulated = 0; // ms banked while paused
let startedAt = 0; // performance.now() when last started
let sceneMark = 0; // elapsed ms when the current scene opened
let interval: number | undefined;
let snapshot: Snapshot = { running: false, elapsed: 0, sceneElapsed: 0 };
const listeners = new Set<() => void>();

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const elapsedMs = () => accumulated + (running ? now() - startedAt : 0);

function emit() {
  const e = elapsedMs();
  snapshot = { running, elapsed: Math.floor(e / 1000), sceneElapsed: Math.floor(Math.max(0, e - sceneMark) / 1000) };
  listeners.forEach((l) => l());
}

export const presenterTimer = {
  start() {
    if (running) return;
    running = true;
    startedAt = now();
    interval = window.setInterval(emit, 500);
    emit();
  },
  pause() {
    if (!running) return;
    accumulated = elapsedMs();
    running = false;
    window.clearInterval(interval);
    emit();
  },
  toggle() {
    if (running) presenterTimer.pause();
    else presenterTimer.start();
  },
  reset() {
    accumulated = 0;
    sceneMark = 0;
    startedAt = now();
    emit();
  },
  /** Call when the scene changes so per-scene time restarts. */
  markScene() {
    sceneMark = elapsedMs();
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
};

export const usePresenterTimer = () =>
  useSyncExternalStore(presenterTimer.subscribe, presenterTimer.getSnapshot, presenterTimer.getSnapshot);
