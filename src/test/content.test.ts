import { describe, expect, it } from 'vitest';
import * as content from '../content/presentationContent';
import { speeches } from '../content/speakerNotes';
import { team } from '../data/team';

const audienceText = JSON.stringify(content);

describe('content fidelity guards', () => {
  it('reads the assessment length from the single setting', () => {
    expect(content.settings.assessmentDuration).toBe('two-week');
    expect(content.assessment.routeTitle).toContain(content.settings.assessmentDuration);
    expect(content.ask.detail.title.toLowerCase()).toContain(content.settings.assessmentDuration);
  });

  it('keeps the proof of concept distinct from the assessment', () => {
    expect(content.proofOfConceptName).toMatch(/proof of concept/);
    expect(content.assessmentName).toMatch(/initial assessment/);
  });

  it('shows June 2027, never the ambiguous "June-27"', () => {
    expect(audienceText).toContain('June 2027');
    expect(audienceText).not.toMatch(/June-27/);
  });

  it('labels the $3.54 billion as potential exposure', () => {
    expect(content.context.exposure.label.toLowerCase()).toContain('potential');
    expect(content.context.exposure.value).toBe(3.54);
  });

  it('carries the disclaimer', () => {
    expect(content.experience.disclaimer).toBe('Hypothetical scenarios, figures and dates for illustrative discussion.');
  });

  it('never places full speech paragraphs in audience-facing content', () => {
    for (const speech of Object.values(speeches)) {
      for (const p of speech!.paragraphs) {
        if (p.text.length > 60) expect(audienceText).not.toContain(p.text);
      }
    }
  });

  it('keeps every audience statement short (no paragraph over 40 words)', () => {
    const strings: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === 'string') strings.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(content);
    for (const s of strings) expect(s.split(/\s+/).length, s).toBeLessThanOrEqual(40);
  });

  it('has five team members with images and crops', () => {
    expect(team.map((m) => m.name)).toEqual(['Mayank Jain', 'Sushant', 'Neeti Bourai', 'Suryakanta Das', 'Aryama Das']);
    for (const m of team) {
      expect(m.image).toMatch(/team\/[a-z-]+\.(png|jpg)$/);
      expect(m.objectPosition).toMatch(/%/);
      expect(m.imageAlt).toContain(m.name);
    }
  });

  it('plans exactly a 20-minute slot', () => {
    expect(content.totalPlannedSeconds).toBe(20 * 60);
  });
});
