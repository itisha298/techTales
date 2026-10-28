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

/** The six presented slides. Each slide runs one or more parts as progressive builds. */
export type SlideId = 'opening' | 'journey' | 'innovation' | 'value' | 'assessment' | 'team';

/** One original scene (a "part"): content, hash id, notes and timing are unchanged. */
export interface PartMeta {
  id: SceneId;
  navLabel: string;
  /** Chapter this part belongs to, or null for framing scenes. */
  chapterId: ChapterId | null;
  railLabel?: string;
  speakerId: SpeakerId;
  stepSpeakers?: SpeakerId[];
  plannedSeconds: number;
  /** Number of builds inside this part. */
  steps: number;
  centralMessage: string;
  visualTreatment: string;
}

export interface SceneMeta {
  id: SlideId;
  navLabel: string;
  chapterId: ChapterId | null;
  railLabel?: string;
  /** Presenter of the slide's first build. */
  speakerId: SpeakerId;
  /** Sum of the parts' planned times. */
  plannedSeconds: number;
  /** Total builds across all parts of this slide. */
  steps: number;
  /** Presenter for each build, in order. */
  stepSpeakers: SpeakerId[];
  centralMessage: string;
  visualTreatment: string;
  /** Original scenes shown on this slide, in order. */
  parts: SceneId[];
  /** Each build: which part is showing, and that part's own build number. */
  builds: { part: SceneId; local: number }[];
}
