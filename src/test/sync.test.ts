import { afterEach, describe, expect, it } from 'vitest';
import { DeckSync, syncSupported, type DeckPosition } from '../lib/deckSync';

/** Lets queued BroadcastChannel messages deliver. */
const flush = () => new Promise((r) => setTimeout(r, 30));

let channelSeq = 0;
const instances: DeckSync[] = [];

function makeWindow(start: DeckPosition, channel: string) {
  const state = { pos: { ...start }, applied: [] as DeckPosition[], peers: 0 };
  const sync = new DeckSync(
    {
      onRemote: (p) => {
        state.pos = p;
        state.applied.push(p);
      },
      getPosition: () => state.pos,
      onPeers: (n) => (state.peers = n),
    },
    channel,
  );
  instances.push(sync);
  /** Simulates a local navigation in this window. */
  const navigate = (p: DeckPosition) => {
    state.pos = p;
    sync.publish(p);
  };
  return { state, sync, navigate };
}

afterEach(() => {
  instances.splice(0).forEach((s) => s.stop());
});

describe('window sync (BroadcastChannel)', () => {
  it('is available in this runtime', () => {
    expect(syncSupported()).toBe(true);
  });

  it('a newly linked window adopts the position of an existing window', async () => {
    const ch = `test-${++channelSeq}`;
    const audience = makeWindow({ index: 4, step: 0 }, ch);
    audience.sync.start();
    const presenter = makeWindow({ index: 0, step: 0 }, ch);
    presenter.sync.start();
    await flush();
    expect(presenter.state.pos).toEqual({ index: 4, step: 0 });
    // The existing window did not move.
    expect(audience.state.pos).toEqual({ index: 4, step: 0 });
  });

  it('navigation in one window moves the other, without echo loops', async () => {
    const ch = `test-${++channelSeq}`;
    const a = makeWindow({ index: 0, step: 0 }, ch);
    const b = makeWindow({ index: 0, step: 0 }, ch);
    a.sync.start();
    b.sync.start();
    await flush();
    a.navigate({ index: 6, step: 1 });
    await flush();
    expect(b.state.pos).toEqual({ index: 6, step: 1 });
    // b re-publishes after applying (as the app's effect does) — must be swallowed.
    b.sync.publish(b.state.pos);
    await flush();
    expect(a.state.applied).toEqual([]);
    expect(b.state.applied).toEqual([{ index: 6, step: 1 }]);
  });

  it('counts linked windows and forgets a window that leaves', async () => {
    const ch = `test-${++channelSeq}`;
    const a = makeWindow({ index: 0, step: 0 }, ch);
    const b = makeWindow({ index: 0, step: 0 }, ch);
    a.sync.start();
    b.sync.start();
    await flush();
    expect(a.state.peers).toBe(1);
    b.sync.stop();
    await flush();
    expect(a.state.peers).toBe(0);
  });

  it('unlinked windows stay independent', async () => {
    const ch = `test-${++channelSeq}`;
    const a = makeWindow({ index: 0, step: 0 }, ch);
    const b = makeWindow({ index: 2, step: 0 }, ch); // never started
    a.sync.start();
    a.navigate({ index: 3, step: 0 });
    await flush();
    expect(b.state.pos).toEqual({ index: 2, step: 0 });
    expect(b.sync.active).toBe(false);
  });

  it('publishing while unlinked is a safe no-op', () => {
    const w = makeWindow({ index: 0, step: 0 }, `test-${++channelSeq}`);
    expect(() => w.sync.publish({ index: 1, step: 0 })).not.toThrow();
  });

  it('reports unavailability instead of throwing when BroadcastChannel is missing', () => {
    const original = globalThis.BroadcastChannel;
    // @ts-expect-error simulate an older or locked-down browser
    delete globalThis.BroadcastChannel;
    try {
      expect(syncSupported()).toBe(false);
      const w = makeWindow({ index: 0, step: 0 }, 'none');
      expect(w.sync.start()).toBe(false);
      expect(w.sync.active).toBe(false);
    } finally {
      globalThis.BroadcastChannel = original;
    }
  });
});
