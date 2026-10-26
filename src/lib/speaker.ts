import type { SceneMeta, SpeakerId } from '../types/presentation';

/** The speaker for a given build of a scene (falls back to the scene speaker). */
export const speakerFor = (scene: SceneMeta, step: number): SpeakerId =>
  scene.stepSpeakers?.[step] ?? scene.speakerId;
