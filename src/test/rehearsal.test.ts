import { describe, expect, it } from 'vitest';
import { createRehearsalStore } from '../hooks/rehearsal';

function setup(scenes = 4) {
  let t = 0;
  const data = new Map<string, string>();
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
  const store = createRehearsalStore(scenes, () => t, storage);
  return { store, advance: (s: number) => (t += s * 1000), storage, data };
}

describe('rehearsal timing', () => {
  it('banks time against each scene as the speaker moves through', () => {
    const { store, advance } = setup();
    store.start(0);
    advance(40);
    store.enterScene(1);
    advance(65);
    store.enterScene(2);
    advance(10);
    store.pause();
    expect(store.getSnapshot().perScene).toEqual([40, 65, 10, 0]);
  });

  it('accumulates repeat visits to the same scene', () => {
    const { store, advance } = setup();
    store.start(0);
    advance(20);
    store.enterScene(1);
    advance(5);
    store.enterScene(0);
    advance(15);
    store.pause();
    expect(store.getSnapshot().perScene[0]).toBe(35);
  });

  it('does not count time while paused', () => {
    const { store, advance } = setup();
    store.start(0);
    advance(10);
    store.pause();
    advance(500);
    store.start(0);
    advance(5);
    store.pause();
    expect(store.getSnapshot().perScene[0]).toBe(15);
  });

  it('persists the run locally and restores it', () => {
    const { store, advance, storage } = setup();
    store.start(0);
    advance(30);
    store.enterScene(1);
    store.pause();
    const restored = createRehearsalStore(4, () => 0, storage);
    expect(restored.getSnapshot().perScene).toEqual([30, 0, 0, 0]);
  });

  it('reset clears the run', () => {
    const { store, advance, data } = setup();
    store.start(0);
    advance(30);
    store.pause();
    store.reset();
    expect(store.getSnapshot().perScene).toEqual([0, 0, 0, 0]);
    expect(data.size).toBe(0);
  });

  it('ignores corrupt stored data', () => {
    const storage = { getItem: () => '{oops', setItem: () => {}, removeItem: () => {} };
    expect(createRehearsalStore(3, () => 0, storage).getSnapshot().perScene).toEqual([0, 0, 0]);
  });
});
