import { describe, expect, it } from 'vitest';
import { deckReducer, type DeckState } from '../hooks/useDeck';
import { buildFor, buildFromHash, scenes } from '../content/presentationContent';

const SLIDE_ORDER = ['opening', 'journey', 'innovation', 'value', 'assessment', 'team'];

const at = (index: number, step = 0): DeckState => ({ index, step, direction: 1 });

describe('deck navigation', () => {
  it('advances one build at a time and stops at the end', () => {
    let s = at(0);
    for (let i = 0; i < 50; i++) s = deckReducer(s, { type: 'next' });
    expect(s.index).toBe(scenes.length - 1);
    expect(s.step).toBe(scenes[scenes.length - 1].steps - 1);
  });

  it('visits every build of every slide exactly once going forward', () => {
    const seen: string[] = [];
    let s = at(0);
    seen.push(`${s.index}.${s.step}`);
    for (;;) {
      const n = deckReducer(s, { type: 'next' });
      if (n === s) break;
      s = n;
      seen.push(`${s.index}.${s.step}`);
    }
    const expected = scenes.reduce((sum, sc) => sum + sc.steps, 0);
    expect(new Set(seen).size).toBe(expected);
    expect(new Set(seen.map((k) => k.split('.')[0])).size).toBe(scenes.length);
  });

  it('runs every build of a slide before leaving it (value: value, June 28 wipe, June 28 close)', () => {
    const value = buildFor('value');
    let s = at(value.index, 0);
    s = deckReducer(s, { type: 'next' });
    expect(s).toMatchObject({ index: value.index, step: 1 });
    s = deckReducer(s, { type: 'next' });
    expect(s).toMatchObject({ index: value.index, step: 2 });
    s = deckReducer(s, { type: 'next' });
    expect(s).toMatchObject({ index: value.index + 1, step: 0 });
  });

  it('enters a slide on its last build when going back', () => {
    const value = buildFor('value');
    const s = deckReducer(at(value.index + 1), { type: 'prev' });
    expect(s).toMatchObject({ index: value.index, step: scenes[value.index].steps - 1, direction: -1 });
  });

  it('does not move before the first scene', () => {
    expect(deckReducer(at(0), { type: 'prev' })).toEqual(at(0));
  });

  it('clamps direct jumps', () => {
    expect(deckReducer(at(0), { type: 'goto', index: 99 }).index).toBe(scenes.length - 1);
    expect(deckReducer(at(3), { type: 'goto', index: -4 }).index).toBe(0);
  });

  it('maps every original scene hash to its build, and unknown hashes to the opening', () => {
    expect(buildFromHash('#nope')).toEqual({ index: 0, step: 0 });
    expect(buildFromHash('')).toEqual({ index: 0, step: 0 });
    expect(buildFromHash('#context')).toEqual(buildFor('context'));
    expect(buildFromHash('#june-28')).toEqual(buildFor('june-28'));
    expect(buildFromHash('#qa')).toEqual(buildFor('qa'));
  });

  it('presents six slides in the required order, ending with the team', () => {
    expect(scenes.map((s) => s.id)).toEqual(SLIDE_ORDER);
  });
});
