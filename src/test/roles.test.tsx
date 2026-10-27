import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { chapters } from '../content/presentationContent';
import { speakerPlans } from '../content/speakerNotes';
import { team } from '../data/team';

const ROLES = {
  'Mayank Jain': 'Meridian CAL',
  Sushant: 'ATCI Delivery and Innovation Lead',
  'Neeti Bourai': 'Delivery Manager',
  'Suryakanta Das': 'CMT Market Lead',
  'Aryama Dey': 'Senior Delivery Manager',
};

describe('speaker roles', () => {
  it('reads the five updated roles from the central team data', () => {
    expect(Object.fromEntries(team.map((m) => [m.name, m.role]))).toEqual(ROLES);
  });

  it('shows roles, not durations, under each speaker in the chapter overview', () => {
    window.location.hash = '#journey';
    render(<App />);
    const rows = screen.getAllByTestId('journey-speaker');
    expect(rows).toHaveLength(5);
    Object.entries(ROLES).forEach(([name, role], i) => {
      expect(within(rows[i]).getByText(name)).toBeInTheDocument();
      expect(within(rows[i]).getByText(role)).toBeInTheDocument();
    });
    const scene = document.querySelector('section[data-scene="journey"]')!;
    for (const c of chapters) expect(scene).not.toHaveTextContent(c.duration);
    // Four chapters, unchanged
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([...chapters.map((c) => c.title), 'Your questions']);
  });

  it('uses the same roles on the team screen', () => {
    window.location.hash = '#team';
    render(<App />);
    for (const role of Object.values(ROLES)) expect(screen.getByText(role)).toBeInTheDocument();
  });

  it('keeps speaking durations in the presenter notes and timing data', async () => {
    window.location.hash = '#context';
    render(<App />);
    await act(() => void fireEvent.keyDown(window, { key: 'n' }));
    const notes = screen.getByRole('complementary', { name: /presenter notes/i });
    expect(notes).toHaveTextContent('Meridian CAL · speech about 3 min 25 sec');
    expect(chapters.map((c) => c.durationSeconds)).toEqual([205, 180, 240, 150]);
    expect(speakerPlans.neeti.duration).toBe('about 4 min');
  });

  it('keeps the word-for-word transcript (old role wording inside speeches is untouched)', async () => {
    const { speeches } = await import('../content/speakerNotes');
    expect(speeches.mayank!.paragraphs.some((p) => p.text.includes('Sushant, our Delivery & Innovation Lead'))).toBe(true);
  });
});

describe('opening artwork', () => {
  it('uses the extracted WebP artwork and keeps all text as real HTML', () => {
    window.location.hash = '#opening';
    const { container } = render(<App />);
    const img = container.querySelector('[data-testid="opening-artwork"] img') as HTMLImageElement;
    expect(img.getAttribute('src')).toMatch(/images\/meridian-opening-globe\.webp$/);
    expect(img.alt).toBe(''); // decorative; text lives in HTML
    expect(screen.getByText('Meridian Telecom')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('A New Prime Meridian');
    expect(screen.getByText('One brand, one platform, and every customer carried across by June 2027')).toBeInTheDocument();
    expect(screen.getByTestId('team-identifier')).toHaveTextContent('Meridian Wizards');
    expect(screen.getByRole('button', { name: 'Enter experience' })).toBeInTheDocument();
  });

  it('has no continuous animation layers, and the artwork has no transform or scale', () => {
    window.location.hash = '#opening';
    const { container } = render(<App />);
    expect(container.querySelectorAll('[data-ambient]')).toHaveLength(0);
    const artwork = screen.getByTestId('opening-artwork') as HTMLElement;
    expect(artwork.style.transform).toBe('');
  });
});
