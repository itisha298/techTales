import { useSyncExternalStore } from 'react';

/**
 * Rehearsal timing: records how long each scene actually took in a practice
 * run, so speakers can compare against the plan. Completely separate from the
 * presenter timer, and persisted locally (this browser only) so a run can be
 * reviewed afterwards.
 */
export interface RehearsalSnapshot {
  running: boolean;
  /** Seconds spent per scene index. */
  perScene: number[];
  currentIndex: number;
  /** Seconds in the current visit to the current scene. */
  currentVisit: number;
}

const STORAGE_KEY = 'meridian-rehearsal-v1';

export function createRehearsalStore(
  sceneCount: number,
  now: () => number = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = typeof localStorage !== 'undefined' ? localStorage : null,
) {
  const load = (): number[] => {
    try {
      const raw = storage?.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      if (Array.isArray(parsed) && parsed.length === sceneCount && parsed.every((n) => typeof n === 'number')) return parsed;
    } catch {
      // Ignore corrupt or blocked storage.
    }
    return Array.from({ length: sceneCount }, () => 0);
  };

  let banked = load(); // ms, completed time per scene
  banked = banked.map((s) => s * 1000);
  let running = false;
  let currentIndex = 0;
  let visitStart = 0;
  let interval: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();

  const live = () => (running ? now() - visitStart : 0);
  const build = (): RehearsalSnapshot => ({
    running,
    currentIndex,
    perScene: banked.map((ms, i) => Math.floor((ms + (i === currentIndex ? live() : 0)) / 1000)),
    currentVisit: Math.floor(live() / 1000),
  });
  let snapshot = build();

  const save = () => {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(banked.map((ms) => Math.round(ms / 1000))));
    } catch {
      // Storage may be unavailable (private mode); timing still works in memory.
    }
  };
  const emit = () => {
    snapshot = build();
    listeners.forEach((l) => l());
  };
  const bank = () => {
    if (running) {
      banked[currentIndex] += now() - visitStart;
      visitStart = now();
    }
  };

  return {
    start(index: number) {
      currentIndex = index;
      if (running) return;
      running = true;
      visitStart = now();
      interval = setInterval(emit, 500);
      emit();
    },
    pause() {
      if (!running) return;
      bank();
      running = false;
      clearInterval(interval);
      save();
      emit();
    },
    /** Record a scene change. Time so far is banked against the scene being left. */
    enterScene(index: number) {
      if (index === currentIndex) return;
      bank();
      currentIndex = index;
      save();
      emit();
    },
    reset() {
      banked = Array.from({ length: sceneCount }, () => 0);
      visitStart = now();
      try {
        storage?.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      emit();
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getSnapshot: () => snapshot,
  };
}

export type RehearsalStore = ReturnType<typeof createRehearsalStore>;

let instance: RehearsalStore | null = null;
export const getRehearsalStore = (sceneCount: number) => (instance ??= createRehearsalStore(sceneCount));

export const useRehearsal = (store: RehearsalStore) => useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
