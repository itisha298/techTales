import type { SceneId } from '../types/presentation';

export interface SceneProps {
  /** Current in-scene build (0-based). */
  step: number;
  next: () => void;
  setStep: (step: number) => void;
  goToScene: (id: SceneId) => void;
  openAssessment: () => void;
}
