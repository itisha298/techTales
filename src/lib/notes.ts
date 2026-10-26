import { scenes } from '../content/presentationContent';
import { sceneCues, speakerPlans, speeches, type SpeechParagraph } from '../content/speakerNotes';
import type { SceneId, SpeakerId } from '../types/presentation';

export interface SceneNotes {
  speakerId: SpeakerId;
  /** Speaker whose script is shown (may differ, e.g. Suryakanta's question on the Q&A scene). */
  scriptSpeakerId: SpeakerId | null;
  paragraphs: (SpeechParagraph & { current: boolean })[];
  deliveryTips: string[];
  pauses: string[];
  handoverLine: string | null;
  nextSpeakerId: SpeakerId | null;
  speechDuration: string;
  cues: string[];
  timingGuidance: string;
}

const owners = Object.entries(speeches) as [SpeakerId, NonNullable<(typeof speeches)[SpeakerId]>][];

export function getSceneNotes(sceneId: SceneId): SceneNotes {
  const scene = scenes.find((s) => s.id === sceneId)!;
  const speakerId = scene.speakerId;
  const own = speeches[speakerId];

  let scriptSpeakerId: SpeakerId | null = null;
  let paragraphs: SceneNotes['paragraphs'] = [];
  let tips: string[] = [];

  if (own) {
    scriptSpeakerId = speakerId;
    paragraphs = own.paragraphs.map((p) => ({ ...p, current: p.scene === sceneId }));
    tips = own.deliveryTips;
  } else {
    // No script for this speaker: show any paragraphs tagged with this scene.
    const found = owners.find(([, s]) => s.paragraphs.some((p) => p.scene === sceneId));
    if (found) {
      scriptSpeakerId = found[0];
      paragraphs = found[1].paragraphs.filter((p) => p.scene === sceneId).map((p) => ({ ...p, current: true }));
      tips = found[1].deliveryTips;
    }
  }

  const plan = speakerPlans[speakerId];
  const scriptPlan = scriptSpeakerId ? speakerPlans[scriptSpeakerId] : plan;
  return {
    speakerId,
    scriptSpeakerId,
    paragraphs,
    deliveryTips: tips,
    pauses: scriptPlan.pauses,
    handoverLine: plan.handoverLine,
    nextSpeakerId: plan.nextSpeakerId,
    speechDuration: plan.duration,
    cues: sceneCues[sceneId].cues,
    timingGuidance: sceneCues[sceneId].timingGuidance,
  };
}

/** Splits "(Pause.)" style stage directions out of a paragraph for styling. */
export function splitStageDirections(text: string): { text: string; direction: boolean }[] {
  return text
    .split(/(\((?:Pause|Smile)[^)]*\))/g)
    .filter(Boolean)
    .map((t) => ({ text: t, direction: /^\((Pause|Smile)/.test(t) }));
}
