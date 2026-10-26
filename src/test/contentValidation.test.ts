import { describe, expect, it } from 'vitest';
import presentation from '../content/editable/presentation.json';
import chapters from '../content/editable/chapters.json';
import team from '../content/editable/team.json';
import metrics from '../content/editable/metrics.json';
import speakerNotes from '../content/editable/speakerNotes.json';
import { describeJsonError, formatIssues, resolvePlaceholders, validateContent, type RawContent } from '../content/schema';

/** A fresh, deep copy of the real editable content for each test. */
const fresh = (): RawContent =>
  structuredClone({
    'presentation.json': presentation,
    'chapters.json': chapters,
    'team.json': team,
    'metrics.json': metrics,
    'speakerNotes.json': speakerNotes,
  }) as RawContent;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const errorsOf = (raw: RawContent, opts = {}) => validateContent(raw, opts).filter((i) => i.severity === 'error');

describe('editable content validation', () => {
  it('accepts the current content', () => {
    expect(validateContent(fresh(), { fileExists: () => true })).toEqual([]);
  });

  it('reports a missing required field with its exact location', () => {
    const raw = fresh();
    (raw['team.json'] as Any).members[1].role = '';
    const [e] = errorsOf(raw);
    expect(e).toMatchObject({ file: 'team.json', field: 'members[1].role' });
    expect(e.message).toMatch(/empty/);
  });

  it('rejects unsupported speaker identifiers', () => {
    const raw = fresh();
    (raw['chapters.json'] as Any).chapters[0].speakerId = 'mayankj';
    const [e] = errorsOf(raw);
    expect(e).toMatchObject({ file: 'chapters.json', field: 'chapters[0].speakerId' });
    expect(e.message).toMatch(/not a known speaker.*mayank, sushant/);
  });

  it('rejects invalid scene references in speaker notes', () => {
    const raw = fresh();
    (raw['speakerNotes.json'] as Any).speeches.sushant.paragraphs[0].scene = 'innovation';
    const [e] = errorsOf(raw);
    expect(e).toMatchObject({ file: 'speakerNotes.json', field: 'speeches.sushant.paragraphs[0].scene' });
    expect(e.message).toMatch(/not a known scene/);
  });

  it('rejects unknown scene ids in the scenes list', () => {
    const raw = fresh();
    const p = raw['presentation.json'] as Any;
    p.scenes['june-29'] = p.scenes['june-28'];
    delete p.scenes['june-28'];
    const errs = errorsOf(raw);
    expect(errs.some((e) => e.field === 'scenes' && /"june-29" is not a known id/.test(e.message))).toBe(true);
    expect(errs.some((e) => e.field === 'scenes.june-28' && /required/.test(e.message))).toBe(true);
  });

  it('detects duplicate ids', () => {
    const raw = fresh();
    (raw['team.json'] as Any).members[4].id = 'neeti';
    const errs = errorsOf(raw);
    expect(errs.some((e) => e.file === 'team.json' && /"neeti" is used more than once/.test(e.message))).toBe(true);
    expect(errs.some((e) => /"aryama" is missing/.test(e.message))).toBe(true);
  });

  it('detects missing chapter content', () => {
    const raw = fresh();
    (raw['chapters.json'] as Any).chapters.pop();
    const [e] = errorsOf(raw);
    expect(e).toMatchObject({ file: 'chapters.json', field: 'chapters' });
    expect(e.message).toMatch(/exactly 4 items/);
  });

  it('flags audience text that is too long for the screen', () => {
    const raw = fresh();
    (raw['presentation.json'] as Any).screens.context.headline = 'Protect the trust already earned '.repeat(4).trim();
    const [e] = errorsOf(raw);
    expect(e).toMatchObject({ file: 'presentation.json', field: 'screens.context.headline' });
    expect(e.message).toMatch(/too long.*maximum 16/);
  });

  it('flags unknown placeholders', () => {
    const raw = fresh();
    (raw['presentation.json'] as Any).screens.june28.setup = 'Go live by {golive-date}.';
    (raw['presentation.json'] as Any).screens.june28.closing = 'Let us meet {deadline}.';
    const errs = errorsOf(raw);
    expect(errs.some((e) => e.field === 'screens.june28.closing' && /unknown placeholder \{deadline\}/.test(e.message))).toBe(true);
  });

  it('checks that team images exist and paths are valid', () => {
    const raw = fresh();
    (raw['team.json'] as Any).members[0].image = 'team/mayank.png';
    const [missing] = errorsOf(raw, { fileExists: (p: string) => p !== 'team/mayank.png' });
    expect(missing).toMatchObject({ file: 'team.json', field: 'members[0].image' });
    expect(missing.message).toMatch(/does not exist/);

    const raw2 = fresh();
    (raw2['team.json'] as Any).members[0].image = 'C:\\Users\\me\\photo.jpg';
    expect(errorsOf(raw2, { fileExists: () => true })[0].message).toMatch(/not a valid image path/);
  });

  it('requires numbers to be numbers and timings to total 20:00', () => {
    const raw = fresh();
    (raw['metrics.json'] as Any).revenueExposure.value = '3.54';
    expect(errorsOf(raw)[0]).toMatchObject({ file: 'metrics.json', field: 'revenueExposure.value' });

    const raw2 = fresh();
    (raw2['presentation.json'] as Any).scenes.opening.plannedSeconds += 30;
    expect(errorsOf(raw2)[0].message).toMatch(/add up to 20:30, but must total 20:00/);
  });

  it('warns about misspelt field names without failing', () => {
    const raw = fresh();
    (raw['presentation.json'] as Any).screens.team.subtitel = 'typo';
    const issues = validateContent(raw, { fileExists: () => true });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ severity: 'warning', field: 'screens.team' });
    expect(issues[0].message).toMatch(/unexpected field "subtitel"/);
  });

  it('explains JSON syntax errors with a line number', () => {
    const source = '{\n  "a": "one",\n  "b": "two"\n  "c": 3\n}';
    let error: unknown;
    try {
      JSON.parse(source);
    } catch (e) {
      error = e;
    }
    const issue = describeJsonError('chapters.json', source, error);
    expect(issue.message).toMatch(/not valid JSON near line 4/);
    expect(issue.message).toMatch(/missing comma/);
  });

  it('formats issues for people, naming file and field', () => {
    const raw = fresh();
    (raw['team.json'] as Any).members[2].name = '';
    expect(formatIssues(errorsOf(raw))).toMatch(/✖ ERROR {2}team\.json → members\[2\]\.name: is empty/);
  });
});

describe('placeholders', () => {
  it('fills values and capitalises when the placeholder is capitalised', () => {
    const v = { goLive: 'June 2027', proofOfConceptDuration: 'two-week' };
    expect(resolvePlaceholders('Live by {goLive}', v)).toBe('Live by June 2027');
    expect(resolvePlaceholders('{ProofOfConceptDuration} proof', v)).toBe('Two-week proof');
    expect(resolvePlaceholders({ a: ['{goLive}'] }, v)).toEqual({ a: ['June 2027'] });
  });
});
