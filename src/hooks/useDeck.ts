import { useCallback, useEffect, useReducer } from 'react';
import { sceneIds, scenes } from '../content/presentationContent';
import type { SceneId } from '../types/presentation';

export interface DeckState {
  index: number;
  step: number;
  /** +1 forward, -1 backward: drives transition direction. */
  direction: 1 | -1;
}

type Action =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'goto'; index: number; step?: number }
  | { type: 'step'; step: number };

const last = scenes.length - 1;
const clamp = (i: number) => Math.min(last, Math.max(0, i));

export function deckReducer(state: DeckState, action: Action): DeckState {
  switch (action.type) {
    case 'next': {
      if (state.step < scenes[state.index].steps - 1) return { ...state, step: state.step + 1, direction: 1 };
      if (state.index >= last) return state;
      return { index: state.index + 1, step: 0, direction: 1 };
    }
    case 'prev': {
      if (state.step > 0) return { ...state, step: state.step - 1, direction: -1 };
      if (state.index <= 0) return state;
      const index = state.index - 1;
      return { index, step: scenes[index].steps - 1, direction: -1 };
    }
    case 'goto': {
      const index = clamp(action.index);
      const step = Math.min(scenes[index].steps - 1, Math.max(0, action.step ?? 0));
      if (index === state.index && step === state.step) return state;
      return { index, step, direction: index >= state.index ? 1 : -1 };
    }
    case 'step': {
      const step = Math.min(scenes[state.index].steps - 1, Math.max(0, action.step));
      if (step === state.step) return state;
      return { ...state, step, direction: step > state.step ? 1 : -1 };
    }
  }
}

export const indexFromHash = (hash: string): number => {
  const id = decodeURIComponent(hash.replace(/^#/, '')) as SceneId;
  const i = sceneIds.indexOf(id);
  return i >= 0 ? i : 0;
};

/** Scene navigation with URL-hash persistence (#opening, #journey, …). */
export function useDeck() {
  const [state, dispatch] = useReducer(deckReducer, undefined, () => ({
    index: indexFromHash(window.location.hash),
    step: 0,
    direction: 1 as const,
  }));

  // Reflect the scene in the URL without growing history on every slide.
  useEffect(() => {
    const hash = `#${sceneIds[state.index]}`;
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  }, [state.index]);

  // Manual hash edits / links jump to that scene.
  useEffect(() => {
    const onHash = () => dispatch({ type: 'goto', index: indexFromHash(window.location.hash) });
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const prev = useCallback(() => dispatch({ type: 'prev' }), []);
  const goTo = useCallback((index: number, step = 0) => dispatch({ type: 'goto', index, step }), []);
  const setStep = useCallback((step: number) => dispatch({ type: 'step', step }), []);

  return { ...state, scene: scenes[state.index], total: scenes.length, next, prev, goTo, setStep };
}

export type Deck = ReturnType<typeof useDeck>;
