/**
 * Presenter-only speaker notes. NEVER render these in audience components;
 * they are only read by the presenter notes panel (src/components/NotesPanel.tsx).
 *
 * Content lives in src/content/editable/speakerNotes.json. Speech paragraphs
 * and delivery tips are verbatim from source-assets/Meridian_4_Topics_Speeches.docx.
 * The source spells "Suryakant" and writes "June-27"; both are kept verbatim
 * because this is the script the presenter reads. See contentWarnings.md.
 */
import notesJson from './editable/speakerNotes.json';
import type { SceneId, SpeakerId } from '../types/presentation';

export interface SpeechParagraph {
  /** Scene on which this paragraph is delivered. */
  scene: SceneId;
  text: string;
}

export interface Speech {
  paragraphs: SpeechParagraph[];
  deliveryTips: string[];
}

export interface SpeakerPlan {
  /** Source timing for the whole speech. */
  duration: string;
  /** Key pauses, drawn from the source stage directions and delivery tips. */
  pauses: string[];
  /** Closing line that hands over to the next speaker (verbatim where the source has one). */
  handoverLine: string | null;
  nextSpeakerId: SpeakerId | null;
}

export interface SceneCue {
  /** Presenter-only instructions for operating this scene. */
  cues: string[];
  timingGuidance: string;
}

const notes = notesJson as unknown as {
  speeches: Partial<Record<SpeakerId, Speech>>;
  speakerPlans: Record<SpeakerId, SpeakerPlan>;
  sceneCues: Record<SceneId, SceneCue>;
};

/** Verbatim speeches. Aryama has no scripted speech in the source. */
export const speeches = notes.speeches;
export const speakerPlans = notes.speakerPlans;
/** Per-scene presenter cues. Items marked "Suggested" are operating guidance, not source content. */
export const sceneCues = notes.sceneCues;
