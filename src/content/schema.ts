/**
 * Schema, placeholder resolution and validation for the editable content in
 * src/content/editable/*.json.
 *
 * This file has no runtime imports so it can run in three places:
 *   - the Vite build/dev server (scripts/content-plugin.ts) — a broken edit
 *     stops the build with a clear message;
 *   - the command line: `npm run validate:content` (scripts/validate-content.ts);
 *   - unit tests (src/test/contentValidation.test.ts).
 *
 * Messages are written for non-technical editors: they name the file and the
 * exact field to fix.
 */
import type { ChapterId, SceneId, SpeakerId } from '../types/presentation.ts';

/* ------------------------------------------------------------------ */
/* Fixed structure (changing these needs a developer)                  */
/* ------------------------------------------------------------------ */

export const SPEAKER_IDS: readonly SpeakerId[] = ['mayank', 'sushant', 'neeti', 'suryakanta', 'aryama'];
export const CHAPTER_IDS: readonly ChapterId[] = ['context', 'innovation', 'value', 'why-accenture'];

/** Scene order, URL hash ids, chapter grouping and build counts are tied to the scene components. */
export const SCENE_STRUCTURE: readonly { id: SceneId; chapterId: ChapterId | null; steps: number }[] = [
  { id: 'opening', chapterId: null, steps: 1 },
  { id: 'journey', chapterId: null, steps: 1 },
  { id: 'context', chapterId: 'context', steps: 1 },
  { id: 'innovation-challenge', chapterId: 'innovation', steps: 1 },
  { id: 'innovation-solution', chapterId: 'innovation', steps: 1 },
  { id: 'value', chapterId: 'value', steps: 1 },
  { id: 'june-28', chapterId: 'value', steps: 2 },
  { id: 'assessment', chapterId: 'why-accenture', steps: 1 },
  { id: 'team', chapterId: null, steps: 1 },
  { id: 'qa', chapterId: null, steps: 2 },
];
export const SCENE_IDS = SCENE_STRUCTURE.map((s) => s.id);

/** The planned session length the scene timings must add up to. */
export const PLANNED_TOTAL_SECONDS = 20 * 60;

/** Audience-facing length limits. */
export const LIMITS = { words: 40, headlineWords: 16, characters: 260 } as const;

export const EDITABLE_FILES = ['presentation.json', 'chapters.json', 'team.json', 'metrics.json', 'speakerNotes.json'] as const;
export type EditableFile = (typeof EDITABLE_FILES)[number];
export type RawContent = Record<EditableFile, unknown>;

/* ------------------------------------------------------------------ */
/* Placeholders: {goLive}, {assessmentDuration}, …                     */
/* ------------------------------------------------------------------ */

export const PLACEHOLDERS = ['goLive', 'assessmentDuration', 'proofOfConceptDuration', 'teamName', 'tom', 'john', 'brand', 'client'] as const;
const TOKEN = /\{([A-Za-z]+)\}/g;

export function placeholderValues(presentation: {
  settings: { goLive: string; assessmentDuration: string; proofOfConceptDuration: string };
  experience: { teamName: string; brand: string };
  client: { tom: string; john: string; name: string };
}): Record<string, string> {
  return {
    goLive: presentation.settings.goLive,
    assessmentDuration: presentation.settings.assessmentDuration,
    proofOfConceptDuration: presentation.settings.proofOfConceptDuration,
    teamName: presentation.experience.teamName,
    brand: presentation.experience.brand,
    tom: presentation.client.tom,
    john: presentation.client.john,
    client: presentation.client.name,
  };
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Replaces {token} with its value; {Token} (capitalised) capitalises the value. */
export function resolvePlaceholders<T>(value: T, values: Record<string, string>): T {
  if (typeof value === 'string') {
    return value.replace(TOKEN, (whole, name: string) => {
      const key = lowerFirst(name);
      if (!(key in values)) return whole;
      return name === key ? values[key] : upperFirst(values[key]);
    }) as T;
  }
  if (Array.isArray(value)) return value.map((v) => resolvePlaceholders(v, values)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolvePlaceholders(v, values)])) as T;
  }
  return value;
}

/* ------------------------------------------------------------------ */
/* Rule definitions                                                    */
/* ------------------------------------------------------------------ */

type Rule =
  | { k: 'text'; optional?: boolean; audience?: boolean; headline?: boolean }
  | { k: 'number'; optional?: boolean; min?: number; integer?: boolean }
  | { k: 'speaker'; optional?: boolean }
  | { k: 'scene'; optional?: boolean }
  | { k: 'image'; optional?: boolean }
  | { k: 'list'; of: Rule; optional?: boolean; min?: number; length?: number }
  | { k: 'object'; fields: Record<string, Rule>; optional?: boolean }
  | { k: 'record'; of: Rule; keys: readonly string[]; optional?: boolean; exact?: boolean };

const text = (o: { optional?: boolean; audience?: boolean; headline?: boolean } = {}): Rule => ({ k: 'text', audience: true, ...o });
const note = (o: { optional?: boolean } = {}): Rule => ({ k: 'text', audience: false, ...o });
const headline = (): Rule => ({ k: 'text', audience: true, headline: true });
const num = (o: { optional?: boolean; min?: number; integer?: boolean } = {}): Rule => ({ k: 'number', ...o });
const speaker = (): Rule => ({ k: 'speaker' });
const list = (of: Rule, o: { optional?: boolean; min?: number; length?: number } = {}): Rule => ({ k: 'list', of, min: 1, ...o });
const obj = (fields: Record<string, Rule>, o: { optional?: boolean } = {}): Rule => ({ k: 'object', fields, ...o });
const opt = (r: Rule): Rule => ({ ...r, optional: true }) as Rule;

const weeks = obj({ weeks: num({ min: 0 }), label: text() });

const SCENE_ENTRY = obj({
  navLabel: text(),
  railLabel: opt(text()),
  speakerId: speaker(),
  stepSpeakers: opt(list(speaker())),
  plannedSeconds: num({ min: 1, integer: true }),
  centralMessage: note(),
  visualTreatment: note(),
});

export const RULES: Record<EditableFile, Rule> = {
  'presentation.json': obj({
    experience: obj({
      documentTitle: text(),
      brand: text(),
      title: headline(),
      subtitle: text(),
      disclaimer: text(),
      presentedBy: text(),
      teamName: text(),
    }),
    settings: obj({ assessmentDuration: text(), proofOfConceptDuration: text(), goLive: text() }),
    client: obj({ name: text(), fullName: text(), tom: text(), john: text() }),
    scenes: { k: 'record', keys: SCENE_IDS, of: SCENE_ENTRY, exact: true },
    screens: obj({
      opening: obj({ label: text(), cta: text(), hint: text(), hintTouch: text(), teamLabel: text() }),
      journey: obj({
        eyebrow: text(),
        headline: headline(),
        closing: obj({ label: text(), title: text(), detail: text() }),
        nextStep: text(),
      }),
      context: obj({
        eyebrow: text(),
        headline: headline(),
        lead: text(),
        timeline: obj({ start: text(), end: text(), endLabel: text(), span: text() }),
        workstreams: list(obj({ title: text(), detail: text() }), { length: 3 }),
        priorities: list(obj({ who: text(), title: text(), detail: text() }), { length: 2 }),
      }),
      challenge: obj({
        eyebrow: text(),
        headline: headline(),
        lead: text(),
        story: obj({ label: text(), who: text(), context: text() }),
        hiddenRule: obj({ tag: text(), code: text(), plain: text(), impact: text() }),
        fragments: list(note(), { length: 6 }),
      }),
      solution: obj({
        eyebrow: text(),
        headline: headline(),
        flow: list(text(), { length: 7 }),
        human: obj({ title: text(), statement: text(), actions: list(text(), { length: 3 }), decision: text() }),
        poc: obj({ label: text() }),
        controlTower: obj({ name: text(), label: text() }),
        ask: text(),
      }),
      value: obj({
        eyebrow: text(),
        headline: headline(),
        journey: obj({ start: text(), end: text(), label: text() }),
        layers: list(text(), { min: 1 }),
        controlTower: text(),
        credentials: obj({ label: text() }),
        lesson: text(),
        value360: obj({ title: text(), quadrants: list(text(), { length: 4 }) }),
      }),
      june28: obj({
        eyebrow: text(),
        before: obj({ date: text(), label: text() }),
        setup: headline(),
        question: headline(),
        after: obj({ label: text() }),
        outcomes: list(text(), { length: 6 }),
        closing: text(),
      }),
      assessment: obj({
        eyebrow: text(),
        headline: headline(),
        commitment: text(),
        reasons: list(text(), { length: 4 }),
        routeTitle: text(),
        steps: list(text(), { length: 7 }),
        closing: text(),
      }),
      team: obj({ eyebrow: text(), headline: headline(), subtitle: text() }),
      ask: obj({
        eyebrow: text(),
        question: headline(),
        outcomes: list(text(), { length: 3 }),
        actions: obj({ explore: text(), qa: text(), back: text() }),
        qa: obj({ eyebrow: text(), message: headline() }),
        detail: obj({
          title: text(),
          purpose: text(),
          participants: obj({ label: text(), items: list(text()) }),
          outputs: obj({ label: text(), items: list(text()) }),
          nextSteps: obj({ label: text(), items: list(text()) }),
        }),
      }),
    }),
    pendingConfirmations: list(obj({ topic: note(), current: note(), where: note() })),
  }),
  'chapters.json': obj({
    chapters: list(
      obj({
        id: text(),
        number: text(),
        sourceTopic: note(),
        title: headline(),
        subtitle: text(),
        screenSubtitle: opt(text()),
        speakerId: speaker(),
        duration: note(),
        durationSeconds: num({ min: 1, integer: true }),
        outcome: text(),
        navLabel: text(),
      }),
      { length: CHAPTER_IDS.length },
    ),
  }),
  'team.json': obj({
    members: list(
      obj({
        id: speaker(),
        name: text(),
        shortName: text(),
        role: text(),
        chapter: text(),
        image: { k: 'image' },
        imageAlt: opt(text()),
        objectPosition: text(),
        objectPositionTight: text(),
        shortIntroduction: text(),
      }),
      { length: SPEAKER_IDS.length },
    ),
  }),
  'metrics.json': obj({
    revenueExposure: obj({
      value: num({ min: 0 }),
      prefix: text({ optional: true }),
      decimals: num({ min: 0, integer: true }),
      unit: text(),
      label: text(),
      qualifier: text(),
    }),
    comparableEstate: list(obj({ value: num({ min: 0 }), label: text() }), { length: 2 }),
    discoveryGap: obj({ planned: weeks, needed: weeks, gap: weeks }),
    proofOfConcept: obj({
      metrics: list(obj({ value: num({ min: 0 }), label: text() }), { length: 2 }),
      acceptance: obj({ value: text(), label: text() }),
    }),
    discoveryResult: obj({ before: weeks, after: weeks, summary: text(), note: text() }),
    comparableTransformation: list(obj({ value: text(), label: text() }), { length: 4 }),
  }),
  'speakerNotes.json': obj({
    speeches: {
      k: 'record',
      keys: SPEAKER_IDS,
      of: obj({ paragraphs: list(obj({ scene: { k: 'scene' }, text: note() })), deliveryTips: list(note(), { min: 0 }) }),
    },
    speakerPlans: {
      k: 'record',
      keys: SPEAKER_IDS,
      exact: true,
      of: obj({
        duration: note(),
        pauses: list(note(), { min: 0 }),
        handoverLine: { k: 'text', audience: false, optional: true },
        nextSpeakerId: { k: 'speaker', optional: true },
      }),
    },
    sceneCues: { k: 'record', keys: SCENE_IDS, exact: true, of: obj({ cues: list(note(), { min: 0 }), timingGuidance: note() }) },
  }),
};

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export interface Issue {
  severity: 'error' | 'warning';
  file: string;
  field: string;
  message: string;
}

export interface ValidateOptions {
  /** Returns true if a file under public/ exists (build/CLI only). */
  fileExists?: (publicPath: string) => boolean;
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const typeName = (v: unknown) => (v === null ? 'empty (null)' : Array.isArray(v) ? 'a list' : typeof v === 'object' ? 'a group of fields' : `a ${typeof v}`);
const fieldPath = (parts: (string | number)[]) =>
  parts.reduce<string>((acc, p) => (typeof p === 'number' ? `${acc}[${p}]` : acc ? `${acc}.${p}` : p), '') || '(whole file)';

function check(rule: Rule, value: unknown, at: (string | number)[], file: string, issues: Issue[], opts: ValidateOptions) {
  const field = fieldPath(at);
  const err = (message: string) => issues.push({ severity: 'error', file, field, message });
  const warn = (message: string) => issues.push({ severity: 'warning', file, field, message });

  if (value === undefined || value === null) {
    if (rule.optional) return;
    if (value === null && rule.k === 'text' && rule.optional) return;
    err('is required but is missing.');
    return;
  }

  switch (rule.k) {
    case 'text':
    case 'speaker':
    case 'scene':
    case 'image': {
      if (typeof value !== 'string') return err(`must be text in "quotes", but is ${typeName(value)}.`);
      if (!value.trim()) return err('is empty. Please enter the text.');
      if (rule.k === 'speaker' && !SPEAKER_IDS.includes(value as SpeakerId))
        return err(`"${value}" is not a known speaker. Use one of: ${SPEAKER_IDS.join(', ')}.`);
      if (rule.k === 'scene' && !SCENE_IDS.includes(value as SceneId))
        return err(`"${value}" is not a known scene. Use one of: ${SCENE_IDS.join(', ')}.`);
      if (rule.k === 'image') {
        if (!/^[a-z0-9/_.-]+\.(png|jpe?g|webp)$/i.test(value) || value.startsWith('/') || value.includes('..'))
          return err(`"${value}" is not a valid image path. Use a path inside the public folder, e.g. team/mayank-jain.png.`);
        if (opts.fileExists && !opts.fileExists(value)) return err(`image "public/${value}" does not exist. Upload the photo there or correct the path.`);
        return;
      }
      for (const m of value.matchAll(TOKEN)) {
        if (!PLACEHOLDERS.includes(lowerFirst(m[1]) as (typeof PLACEHOLDERS)[number]))
          err(`uses the unknown placeholder {${m[1]}}. Available: ${PLACEHOLDERS.map((p) => `{${p}}`).join(', ')}.`);
      }
      if (rule.k === 'text' && rule.audience) {
        const w = words(value);
        const max = rule.headline ? LIMITS.headlineWords : LIMITS.words;
        if (w > max) err(`is too long for the screen (${w} words; maximum ${max}). Please shorten it.`);
        else if (value.length > LIMITS.characters) err(`is too long for the screen (${value.length} characters; maximum ${LIMITS.characters}).`);
      }
      return;
    }
    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) return err(`must be a number without quotes (e.g. 42), but is ${typeName(value)}.`);
      if (rule.min !== undefined && value < rule.min) err(`must be ${rule.min} or more.`);
      if (rule.integer && !Number.isInteger(value)) err('must be a whole number.');
      return;
    }
    case 'list': {
      if (!Array.isArray(value)) return err(`must be a list in [square brackets], but is ${typeName(value)}.`);
      if (rule.length !== undefined && value.length !== rule.length)
        err(`must have exactly ${rule.length} item${rule.length === 1 ? '' : 's'} (the screen layout expects this), but has ${value.length}.`);
      else if (rule.min !== undefined && value.length < rule.min) err(`must have at least ${rule.min} item(s).`);
      value.forEach((v, i) => check(rule.of, v, [...at, i], file, issues, opts));
      return;
    }
    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value)) return err(`must be a group of fields in {curly braces}, but is ${typeName(value)}.`);
      const v = value as Record<string, unknown>;
      for (const [key, r] of Object.entries(rule.fields)) check(r, v[key], [...at, key], file, issues, opts);
      for (const key of Object.keys(v)) {
        if (!(key in rule.fields) && !key.startsWith('_'))
          warn(`has an unexpected field "${key}" at ${fieldPath([...at, key])}. Check the spelling; this field is ignored.`);
      }
      return;
    }
    case 'record': {
      if (typeof value !== 'object' || Array.isArray(value)) return err(`must be a group of fields in {curly braces}, but is ${typeName(value)}.`);
      const v = value as Record<string, unknown>;
      for (const key of Object.keys(v)) {
        if (key.startsWith('_')) continue;
        if (!rule.keys.includes(key)) err(`"${key}" is not a known id here. Use one of: ${rule.keys.join(', ')}.`);
        else check(rule.of, v[key], [...at, key], file, issues, opts);
      }
      if (rule.exact) for (const key of rule.keys) if (!(key in v)) issues.push({ severity: 'error', file, field: fieldPath([...at, key]), message: 'is required but is missing.' });
      return;
    }
  }
}

const dupes = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i);

/** Validates all editable files. Pass already-parsed JSON. */
export function validateContent(raw: Partial<RawContent>, opts: ValidateOptions = {}): Issue[] {
  const issues: Issue[] = [];
  for (const file of EDITABLE_FILES) {
    if (raw[file] === undefined) {
      issues.push({ severity: 'error', file, field: '(whole file)', message: 'is missing.' });
      continue;
    }
    check(RULES[file], raw[file], [], file, issues, opts);
  }
  if (issues.some((i) => i.severity === 'error')) return issues; // cross-checks need well-formed data

  const p = raw['presentation.json'] as {
    scenes: Record<string, { plannedSeconds: number; stepSpeakers?: string[] }>;
  };
  const chapters = (raw['chapters.json'] as { chapters: { id: string; number: string }[] }).chapters;
  const members = (raw['team.json'] as { members: { id: string; name: string }[] }).members;

  // Duplicate ids
  for (const d of new Set(dupes(members.map((m) => m.id))))
    issues.push({ severity: 'error', file: 'team.json', field: 'members[].id', message: `the id "${d}" is used more than once. Each person needs a unique id.` });
  for (const d of new Set(dupes(chapters.map((c) => c.id))))
    issues.push({ severity: 'error', file: 'chapters.json', field: 'chapters[].id', message: `the chapter id "${d}" is used more than once.` });
  for (const d of new Set(dupes(chapters.map((c) => c.number))))
    issues.push({ severity: 'error', file: 'chapters.json', field: 'chapters[].number', message: `the chapter number "${d}" is used more than once.` });

  // Missing chapters / speakers
  chapters.forEach((c, i) => {
    if (!CHAPTER_IDS.includes(c.id as ChapterId))
      issues.push({ severity: 'error', file: 'chapters.json', field: `chapters[${i}].id`, message: `"${c.id}" is not a known chapter. Use one of: ${CHAPTER_IDS.join(', ')}.` });
  });
  for (const id of CHAPTER_IDS)
    if (!chapters.some((c) => c.id === id))
      issues.push({ severity: 'error', file: 'chapters.json', field: 'chapters', message: `chapter "${id}" is missing. All four chapters are required.` });
  for (const id of SPEAKER_IDS)
    if (!members.some((m) => m.id === id))
      issues.push({ severity: 'error', file: 'team.json', field: 'members', message: `the team member "${id}" is missing. All five speakers are required.` });

  // Builds and timing
  for (const s of SCENE_STRUCTURE) {
    const sp = p.scenes[s.id]?.stepSpeakers;
    if (sp && sp.length !== s.steps)
      issues.push({
        severity: 'error',
        file: 'presentation.json',
        field: `scenes.${s.id}.stepSpeakers`,
        message: `this scene has ${s.steps} build(s), so it needs exactly ${s.steps} speaker(s); found ${sp.length}.`,
      });
  }
  const total = Object.values(p.scenes).reduce((a, s) => a + s.plannedSeconds, 0);
  if (total !== PLANNED_TOTAL_SECONDS)
    issues.push({
      severity: 'error',
      file: 'presentation.json',
      field: 'scenes.*.plannedSeconds',
      message: `scene timings add up to ${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}, but must total ${PLANNED_TOTAL_SECONDS / 60}:00. Take time from one scene when adding it to another.`,
    });

  return issues;
}

export function formatIssues(issues: Issue[]): string {
  if (!issues.length) return 'Content is valid.';
  return issues
    .map((i) => `${i.severity === 'error' ? '✖ ERROR' : '⚠ WARNING'}  ${i.file} → ${i.field}: ${i.message}`)
    .join('\n');
}

/** Turns a JSON.parse failure into a message that points at the line and column. */
export function describeJsonError(file: string, source: string, error: unknown): Issue {
  const msg = error instanceof Error ? error.message : String(error);
  const pos = /position (\d+)/.exec(msg);
  let where = '';
  if (pos) {
    const upto = source.slice(0, Number(pos[1]));
    const line = upto.split('\n').length;
    const col = upto.length - upto.lastIndexOf('\n');
    where = ` near line ${line}, column ${col}`;
  }
  return {
    severity: 'error',
    file,
    field: '(whole file)',
    message: `is not valid JSON${where}. Common causes: a missing comma between items, a missing closing quote or bracket, or a trailing comma before } or ]. (${msg})`,
  };
}
