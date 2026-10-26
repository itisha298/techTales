import { describe, expect, it } from 'vitest';
import { deckReducer, indexFromHash, type DeckState } from '../hooks/useDeck';
import { sceneIds, sceneIndexById, scenes } from '../content/presentationContent';

const at = (index: number, step = 0): DeckState => ({ index, step, direction: 1 });

describe('deck navigation', () => {
  it('advances one scene at a time and stops at the end', () => {
    let s = at(0);
    for (let i = 0; i < 50; i++) s = deckReducer(s, { type: 'next' });
    expect(s.index).toBe(scenes.length - 1);
    expect(s.step).toBe(scenes[scenes.length - 1].steps - 1);
  });

  it('visits every scene and every build exactly once going forward', () => {
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

  it('runs in-scene builds before leaving a scene', () => {
    const june = sceneIndexById['june-28'];
    let s = at(june);
    s = deckReducer(s, { type: 'next' });
    expect(s).toMatchObject({ index: june, step: 1 });
    s = deckReducer(s, { type: 'next' });
    expect(s).toMatchObject({ index: june + 1, step: 0 });
  });

  it('enters a multi-step scene on its last build when going back', () => {
    const june = sceneIndexById['june-28'];
    const s = deckReducer(at(june + 1), { type: 'prev' });
    expect(s).toMatchObject({ index: june, step: 1, direction: -1 });
  });

  it('does not move before the first scene', () => {
    expect(deckReducer(at(0), { type: 'prev' })).toEqual(at(0));
  });

  it('clamps direct jumps', () => {
    expect(deckReducer(at(0), { type: 'goto', index: 99 }).index).toBe(scenes.length - 1);
    expect(deckReducer(at(3), { type: 'goto', index: -4 }).index).toBe(0);
  });

  it('maps every URL hash to its scene and unknown hashes to the opening', () => {
    sceneIds.forEach((id, i) => expect(indexFromHash(`#${id}`)).toBe(i));
    expect(indexFromHash('#nope')).toBe(0);
    expect(indexFromHash('')).toBe(0);
  });

  it('uses the required hash ids in order', () => {
    expect(sceneIds).toEqual([
      'opening',
      'journey',
      'context',
      'innovation-challenge',
      'innovation-solution',
      'value',
      'june-28',
      'assessment',
      'team',
      'qa',
    ]);
  });
});
