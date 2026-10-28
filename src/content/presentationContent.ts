/**
 * Adapter over the editable content in src/content/editable/*.json.
 *
 * Team members edit the JSON files (see TEAM_CONTENT_EDITING_GUIDE.md). This
 * module resolves placeholders such as {goLive} and exposes the same typed
 * exports the components have always used, so no component reads JSON
 * directly. Validation runs at build time (scripts/content-plugin.ts) and via
 * `npm run validate:content`.
 *
 * Source: source-assets/Meridian_4_Topics_Speeches.docx. On-screen copy must
 * stay faithful to it; see SOURCE_VERIFICATION.md. Full speeches live in
 * speakerNotes.json and are never rendered in audience components.
 */
import presentationJson from './editable/presentation.json';
import chaptersJson from './editable/chapters.json';
import metricsJson from './editable/metrics.json';
import { placeholderValues, resolvePlaceholders, SCENE_STRUCTURE, SLIDE_STRUCTURE } from './schema';
import type { Chapter, Metric, PartMeta, SceneId, SceneMeta, SpeakerId } from '../types/presentation';

/* ---------- Shapes of the editable files ---------- */

interface WeeksLabel {
  weeks: number;
  label: string;
}

interface PresentationFile {
  experience: {
    documentTitle: string;
    brand: string;
    title: string;
    subtitle: string;
    disclaimer: string;
    presentedBy: string;
    teamName: string;
  };
  settings: { assessmentDuration: string; proofOfConceptDuration: string; goLive: string };
  client: { name: string; fullName: string; tom: string; john: string; marcus: string; marcusFullName: string; marcusRole: string };
  scenes: Record<
    SceneId,
    {
      navLabel: string;
      railLabel?: string;
      speakerId: SpeakerId;
      stepSpeakers?: SpeakerId[];
      plannedSeconds: number;
      centralMessage: string;
      visualTreatment: string;
    }
  >;
  slides: Record<string, { navLabel: string; railLabel?: string }>;
  screens: {
    opening: { label: string; cta: string; hint: string; hintTouch: string; teamLabel: string };
    journey: { eyebrow: string; headline: string; closing: { label: string; title: string; detail: string }; nextStep: string };
    context: {
      eyebrow: string;
      headline: string;
      lead: string;
      timeline: { start: string; end: string; endLabel: string; span: string };
      workstreams: { title: string; detail: string }[];
      priorities: { who: string; title: string; detail: string }[];
    };
    challenge: {
      eyebrow: string;
      headline: string;
      lead: string;
      story: { label: string; who: string; context: string };
      hiddenRule: { tag: string; code: string; plain: string; impact: string };
      fragments: string[];
    };
    solution: {
      eyebrow: string;
      headline: string;
      flow: string[];
      human: { title: string; statement: string; actions: string[]; decision: string };
      poc: { label: string };
      controlTower: { name: string; label: string };
      ask: string;
    };
    value: {
      eyebrow: string;
      headline: string;
      journey: { start: string; end: string; label: string };
      layers: string[];
      controlTower: string;
      credentials: { label: string };
      lesson: string;
      value360: { title: string; quadrants: string[] };
    };
    june28: {
      eyebrow: string;
      before: { date: string; label: string };
      setup: string;
      question: string;
      after: { label: string };
      outcomes: string[];
      closing: string;
    };
    assessment: {
      eyebrow: string;
      headline: string;
      commitment: string;
      reasons: string[];
      routeTitle: string;
      steps: string[];
      closing: string;
    };
    team: { eyebrow: string; headline: string; subtitle: string };
    ask: {
      eyebrow: string;
      question: string;
      outcomes: string[];
      actions: { explore: string; qa: string; back: string };
      qa: { eyebrow: string; message: string };
      detail: {
        title: string;
        purpose: string;
        participants: { label: string; items: string[] };
        outputs: { label: string; items: string[] };
        nextSteps: { label: string; items: string[] };
      };
    };
  };
  pendingConfirmations: { topic: string; current: string; where: string }[];
}

interface MetricsFile {
  revenueExposure: { value: number; prefix: string; decimals: number; unit: string; label: string; qualifier: string };
  comparableEstate: Metric[];
  discoveryGap: { planned: WeeksLabel; needed: WeeksLabel; gap: WeeksLabel };
  proofOfConcept: { metrics: Metric[]; acceptance: { value: string; label: string } };
  discoveryResult: { before: WeeksLabel; after: WeeksLabel; summary: string; note: string };
  comparableTransformation: { value: string; label: string }[];
}

const rawPresentation = presentationJson as unknown as PresentationFile;
const values = placeholderValues(rawPresentation);
const P = resolvePlaceholders(rawPresentation, values);
const M = resolvePlaceholders(metricsJson as unknown as MetricsFile, values);
const C = resolvePlaceholders((chaptersJson as unknown as { chapters: Chapter[] }).chapters, values);

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

/**
 * assessmentDuration: every audience-facing reference to the assessment reads
 * this value. The source is inconsistent (Neeti: "two-week"; Suryakant: "a
 * short assessment window"); see contentWarnings.md. Kept configurable.
 */
export const settings = P.settings;
/** Client stakeholder first names as used in the source speeches. */
export const client = P.client;

export const assessmentName = `focused ${settings.assessmentDuration} initial assessment`;
export const proofOfConceptName = `${settings.proofOfConceptDuration} proof of concept`;

/* ------------------------------------------------------------------ */
/* Experience, chapters, scenes                                        */
/* ------------------------------------------------------------------ */

export const experience = P.experience;

export const chapters: Chapter[] = C;
export const chapterById = Object.fromEntries(chapters.map((c) => [c.id, c])) as Record<Chapter['id'], Chapter>;

/** The ten original scenes ("parts"). Ids, hashes, notes and timings are unchanged. */
export const partMeta = Object.fromEntries(
  SCENE_STRUCTURE.map(({ id, chapterId, steps }) => {
    const s = P.scenes[id];
    const part: PartMeta = {
      id,
      navLabel: s.navLabel,
      chapterId,
      ...(s.railLabel !== undefined ? { railLabel: s.railLabel } : {}),
      speakerId: s.speakerId,
      ...(s.stepSpeakers ? { stepSpeakers: s.stepSpeakers } : {}),
      plannedSeconds: s.plannedSeconds,
      steps,
      centralMessage: s.centralMessage,
      visualTreatment: s.visualTreatment,
    };
    return [id, part];
  }),
) as Record<SceneId, PartMeta>;

/**
 * The six presented slides. A slide shows its parts one after another as
 * progressive builds: the first arrow shows the first part, the next arrow the
 * next build, and so on. Totals (time, builds, speakers) add up from the parts.
 */
export const scenes: SceneMeta[] = SLIDE_STRUCTURE.map(({ id, parts }) => {
  const first = partMeta[parts[0]];
  const builds = parts.flatMap((part) => Array.from({ length: partMeta[part].steps }, (_, local) => ({ part, local })));
  const sl = P.slides[id as keyof typeof P.slides];
  return {
    id: id as SceneMeta['id'],
    navLabel: sl.navLabel,
    chapterId: first.chapterId,
    ...(sl.railLabel !== undefined ? { railLabel: sl.railLabel } : {}),
    speakerId: first.speakerId,
    plannedSeconds: parts.reduce((sum, part) => sum + partMeta[part].plannedSeconds, 0),
    steps: builds.length,
    stepSpeakers: builds.map(({ part, local }) => partMeta[part].stepSpeakers?.[local] ?? partMeta[part].speakerId),
    centralMessage: first.centralMessage,
    visualTreatment: first.visualTreatment,
    parts,
    builds,
  };
});

/** Which slide and build shows a given original scene. */
export const buildFor = (part: SceneId): { index: number; step: number } => {
  for (let index = 0; index < scenes.length; index++) {
    const step = scenes[index].builds.findIndex((b) => b.part === part && b.local === 0);
    if (step >= 0) return { index, step };
  }
  return { index: 0, step: 0 };
};

/** The original scene showing at a given slide and build. */
export const partAt = (index: number, step: number): SceneId => scenes[index].builds[step].part;
/** The build number inside the current original scene. */
export const localStepAt = (index: number, step: number): number => scenes[index].builds[step].local;
/** The build number on this slide for a given scene and its own build. */
export const buildIndexOf = (index: number, part: SceneId, local: number): number =>
  Math.max(0, scenes[index].builds.findIndex((b) => b.part === part && b.local === local));
/** URL hash for a build. Hashes keep the original scene ids, so existing links still work. */
export const hashFor = (index: number, step: number): string => partAt(index, step);
/** Slide and build for a URL hash (e.g. #context → the journey slide, second build). */
export const buildFromHash = (hash: string): { index: number; step: number } => {
  const id = decodeURIComponent(hash.replace(/^#/, '')) as SceneId;
  return id in partMeta ? buildFor(id) : { index: 0, step: 0 };
};

export const totalPlannedSeconds = scenes.reduce((sum, s) => sum + s.plannedSeconds, 0);

/* ------------------------------------------------------------------ */
/* Per-scene copy                                                      */
/* ------------------------------------------------------------------ */

const S = P.screens;

export const opening = {
  eyebrow: experience.brand,
  title: experience.title,
  subtitle: experience.subtitle,
  ...S.opening,
  teamName: experience.teamName,
};

export const journey = S.journey;

export const context = {
  eyebrow: S.context.eyebrow,
  headline: S.context.headline,
  lead: S.context.lead,
  timeline: S.context.timeline,
  workstreams: S.context.workstreams,
  exposure: M.revenueExposure,
  priorities: S.context.priorities,
};

export const challenge = {
  eyebrow: S.challenge.eyebrow,
  headline: S.challenge.headline,
  lead: S.challenge.lead,
  story: {
    label: S.challenge.story.label,
    who: S.challenge.story.who,
    metrics: M.comparableEstate,
    context: S.challenge.story.context,
  },
  discovery: M.discoveryGap,
  hiddenRule: S.challenge.hiddenRule,
  /** Decorative, unreadable fragments that stay faint (not claims). */
  fragments: S.challenge.fragments,
};

export const solution = {
  eyebrow: S.solution.eyebrow,
  headline: S.solution.headline,
  flow: S.solution.flow,
  human: S.solution.human,
  poc: {
    label: S.solution.poc.label,
    metrics: M.proofOfConcept.metrics,
    acceptance: M.proofOfConcept.acceptance,
  },
  discovery: M.discoveryResult,
  controlTower: S.solution.controlTower,
  ask: S.solution.ask,
};

export const value = {
  eyebrow: S.value.eyebrow,
  headline: S.value.headline,
  journey: S.value.journey,
  layers: S.value.layers,
  controlTower: S.value.controlTower,
  credentials: { label: S.value.credentials.label, items: M.comparableTransformation },
  lesson: S.value.lesson,
  value360: S.value.value360,
};

export const june28 = S.june28;
export const assessment = S.assessment;
export const teamScene = S.team;
export const ask = S.ask;

/* ------------------------------------------------------------------ */
/* Interface labels (not editable content)                             */
/* ------------------------------------------------------------------ */

export const ui = {
  previous: 'Previous scene',
  next: 'Next scene',
  nextBuild: 'Next build',
  menu: 'Chapter menu',
  overview: 'Chapter overview',
  close: 'Close',
  nowSpeaking: 'Now speaking',
  build: (step: number, steps: number) => `Build ${step} of ${steps}`,
  buildHint: 'Next arrow completes the animation',
  rehearsal: 'Rehearsal',
} as const;

/**
 * Presenter-only reminder of source ambiguities that are deliberately NOT
 * resolved in the UI. Shown in the notes and rehearsal panels, never to the audience.
 */
export const pendingConfirmations = P.pendingConfirmations;

