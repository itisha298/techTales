export type SpeakerId = 'mayank' | 'sushant' | 'neeti' | 'suryakanta' | 'aryama';

export type ChapterId = 'context' | 'innovation' | 'value' | 'why-accenture';

export type SceneId =
  | 'opening'
  | 'journey'
  | 'context'
  | 'innovation-challenge'
  | 'innovation-solution'
  | 'value'
  | 'june-28'
  | 'assessment'
  | 'team'
  | 'qa';

export interface TeamMember {
  id: SpeakerId;
  name: string;
  /** Short first name used in running order and notes. */
  shortName: string;
  role: string;
  /** Chapter label shown next to the portrait. */
  chapter: string;
  image: string;
  imageAlt: string;
  /** CSS object-position for the default (portrait) crop. */
  objectPosition: string;
  /** CSS object-position for tight circular / square crops. */
  objectPositionTight: string;
  shortIntroduction: string;
}

export interface Chapter {
  id: ChapterId;
  number: string;
  /** Topic name in the source document, e.g. "1. Context Setting". */
  sourceTopic: string;
  title: string;
  /** Full source subtitle. */
  subtitle: string;
  /** Shortened subtitle for on-screen use (falls back to subtitle). */
  screenSubtitle?: string;
  speakerId: SpeakerId;
  /** Source timing, e.g. "about 3 min 25 sec". */
  duration: string;
  durationSeconds: number;
  /** One-line outcome statement used in the journey scene. */
  outcome: string;
  navLabel: string;
}

export interface Metric {
  value: number;
  /** Text before the counted number, e.g. "$". */
  prefix?: string;
  /** Text after the counted number, e.g. "B" or "+". */
  suffix?: string;
  decimals?: number;
  label: string;
  qualifier?: string;
}

export interface SceneMeta {
  id: SceneId;
  /** Short label used in navigation, overview and the progress rail. */
  navLabel: string;
  /** Chapter this scene belongs to, or null for framing scenes. */
  chapterId: ChapterId | null;
  /** Label shown in the bottom rail when chapterId is null. */
  railLabel?: string;
  speakerId: SpeakerId;
  /** Planned speaking time for this scene, in seconds. */
  plannedSeconds: number;
  /** Number of in-scene builds advanced by "next" before leaving the scene. */
  steps: number;
  /** Optional speaker per build (e.g. the ask is posed by one speaker, Q&A led by another). */
  stepSpeakers?: SpeakerId[];
  /** Plain-language description of the visual treatment (documentation). */
  visualTreatment: string;
  centralMessage: string;
}
