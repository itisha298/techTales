import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import * as content from '../content/presentationContent';
import { scenes, sceneIndexById } from '../content/presentationContent';
import { speakerFor } from '../lib/speaker';
import { getMember } from '../data/team';

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));

describe('speaker handover', () => {
  it('Scene 10 is presented by Aryama in both builds; Scene 9 stays with Suryakanta', () => {
    const qa = scenes[sceneIndexById.qa];
    expect(speakerFor(qa, 0)).toBe('aryama');
    expect(speakerFor(qa, 1)).toBe('aryama');
    expect(speakerFor(scenes[sceneIndexById.assessment], 0)).toBe('suryakanta');
    expect(speakerFor(scenes[sceneIndexById.context], 0)).toBe('mayank');
  });

  it('shows "Now speaking" in the rail when the speaker changes', async () => {
    window.location.hash = '#context';
    render(<App />);
    expect(screen.queryByTestId('handover')).not.toBeInTheDocument();
    await key('ArrowRight'); // context (Mayank) → challenge (Sushant)
    const cue = await screen.findByTestId('handover');
    expect(cue).toHaveTextContent('Now speaking');
    expect(cue).toHaveTextContent('Sushant');
    expect(cue).toHaveTextContent(getMember('sushant').role);
  });

  it('does not repeat the handover when the same speaker continues', async () => {
    window.location.hash = '#innovation-challenge';
    render(<App />);
    await key('ArrowRight'); // Sushant → Sushant
    expect(screen.queryByTestId('handover')).not.toBeInTheDocument();
  });

  it('always names the current speaker in the rail', () => {
    window.location.hash = '#value';
    render(<App />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Neeti Bourai');
  });
});

describe('build indicator', () => {
  it('appears only on scenes with two builds and tracks progress', async () => {
    window.location.hash = '#value';
    render(<App />);
    expect(screen.queryByTestId('build-indicator')).not.toBeInTheDocument();
    await key('ArrowRight'); // → june-28, build 1
    const ind = screen.getByTestId('build-indicator');
    expect(ind).toHaveTextContent('Build 1 of 2');
    expect(ind).toHaveTextContent('Next arrow completes the animation');
    expect(screen.getByRole('button', { name: 'Next build' })).toBeInTheDocument();
    await key('ArrowRight'); // build 2
    expect(screen.getByTestId('build-indicator')).toHaveTextContent('Build 2 of 2');
    expect(screen.getByTestId('build-indicator')).not.toHaveTextContent('completes the animation');
    expect(screen.getByRole('button', { name: 'Next scene' })).toBeInTheDocument();
  });

  it('is explained in the presenter notes', async () => {
    window.location.hash = '#june-28';
    render(<App />);
    await key('n');
    expect(screen.getByTestId('notes-build')).toHaveTextContent('Build 1 of 2');
  });
});

describe('rehearsal mode', () => {
  it('R opens a window-local timing panel and a "not live" badge', async () => {
    render(<App />);
    expect(screen.queryByTestId('rehearsal-badge')).not.toBeInTheDocument();
    await key('r');
    const panel = screen.getByRole('complementary', { name: 'Rehearsal timing' });
    expect(screen.getByTestId('rehearsal-badge')).toHaveTextContent(/not live/i);
    expect(panel).toHaveTextContent('This window is isolated');
    // grouped by speaker with plan totals
    expect(within(panel).getAllByRole('rowheader', { name: 'Mayank Jain' }).length).toBeGreaterThan(0);
    expect(panel).toHaveTextContent('20:00');
    await key('r');
    await waitFor(() => expect(screen.queryByRole('complementary', { name: 'Rehearsal timing' })).not.toBeInTheDocument());
  });

  it('lists the unresolved confirmations without resolving them', async () => {
    render(<App />);
    await key('r');
    const panel = screen.getByRole('complementary', { name: 'Rehearsal timing' });
    for (const p of content.pendingConfirmations) expect(panel).toHaveTextContent(p.topic);
    expect(panel).toHaveTextContent(`"${content.settings.assessmentDuration}"`);
  });

  it('leaves the audience scene untouched', async () => {
    window.location.hash = '#context';
    render(<App />);
    const before = screen.getByRole('heading', { level: 2, name: /protect the trust already earned/i });
    await key('r');
    expect(before).toBeInTheDocument();
    expect(window.location.hash).toBe('#context');
  });
});

describe('content is unchanged by presenter features', () => {
  it('keeps the configurable ambiguities at their current values', () => {
    expect(content.settings.assessmentDuration).toBe('two-week');
    expect(content.client).toMatchObject({ tom: 'Tom', john: 'Jennie', marcus: 'Marcus' });
    expect(content.june28.question).toBe('The real question is what becomes possible the day after.');
  });
});
