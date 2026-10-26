import type { ComponentType } from 'react';
import type { SceneId } from '../types/presentation';
import type { SceneProps } from './types';
import OpeningScene from './OpeningScene';
import JourneyScene from './JourneyScene';
import ContextScene from './ContextScene';
import ChallengeScene from './ChallengeScene';
import SolutionScene from './SolutionScene';
import ValueScene from './ValueScene';
import June28Scene from './June28Scene';
import AssessmentScene from './AssessmentScene';
import TeamScene from './TeamScene';
import AskScene from './AskScene';

export const sceneComponents: Record<SceneId, ComponentType<SceneProps>> = {
  opening: OpeningScene,
  journey: JourneyScene,
  context: ContextScene,
  'innovation-challenge': ChallengeScene,
  'innovation-solution': SolutionScene,
  value: ValueScene,
  'june-28': June28Scene,
  assessment: AssessmentScene,
  team: TeamScene,
  qa: AskScene,
};

/** Scenes (and builds) rendered on a dark purple stage. */
export const isDarkStage = (id: SceneId, step: number) => (id === 'june-28' || id === 'qa') && step >= 1;
