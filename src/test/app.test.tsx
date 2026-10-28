import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { Portrait } from '../components/Portrait';
import { getMember } from '../data/team';

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const currentScene = () => document.querySelector('section[data-scene]')?.getAttribute('data-scene');

describe('presentation shell', () => {
  it('starts on the opening and moves with the keyboard', async () => {
    render(<App />);
    expect(currentScene()).toBe('opening');
    await key('ArrowRight');
    expect(window.location.hash).toBe('#journey');
    await key(' ');
    expect(window.location.hash).toBe('#context');
    await key('ArrowLeft');
    expect(window.location.hash).toBe('#journey');
    await key('End');
    expect(window.location.hash).toBe('#team');
    await key('Home');
    expect(window.location.hash).toBe('#opening');
  });

  it('restores the scene from the URL hash', () => {
    window.location.hash = '#assessment';
    render(<App />);
    expect(window.location.hash).toBe('#assessment');
    expect(screen.getByRole('heading', { level: 2, name: /chart the course before you sail/i })).toBeInTheDocument();
  });

  it('ignores browser shortcuts', async () => {
    render(<App />);
    await act(() => void fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }));
    await act(() => void fireEvent.keyDown(window, { key: 'r', ctrlKey: true }));
    expect(window.location.hash).toBe('#opening');
  });

  it('keeps notes hidden until N is pressed, and Escape closes them', async () => {
    render(<App />);
    expect(screen.queryByRole('complementary', { name: /presenter notes/i })).not.toBeInTheDocument();
    await key('n');
    const notes = screen.getByRole('complementary', { name: /presenter notes/i });
    expect(notes).toHaveTextContent('Warren Buffett');
    expect(notes).toHaveTextContent(/Delivery tips/i);
    await key('Escape');
    await waitFor(() => expect(screen.queryByRole('complementary', { name: /presenter notes/i })).not.toBeInTheDocument());
  });

  it('opens the overview with O and jumps to a scene', async () => {
    render(<App />);
    await key('o');
    expect(screen.getByRole('dialog', { name: /chapter overview/i })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /june 28/i })[0]);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(window.location.hash).toBe('#value');
  });

  it('opens the chapter menu with M and the timer with T', async () => {
    render(<App />);
    await key('m');
    expect(screen.getByRole('dialog', { name: /chapter menu/i })).toBeInTheDocument();
    await key('Escape');
    await key('t');
    expect(screen.getByRole('region', { name: /presentation timer/i })).toBeInTheDocument();
  });

  it('announces the current scene', async () => {
    render(<App />);
    await key('ArrowRight');
    expect(screen.getByText(/^Scene 2 of 6: The journey and context\. Speaker: Mayank Jain\./)).toBeInTheDocument();
  });

  it('opens Q&A and the assessment panel from the final ask', async () => {
    window.location.hash = '#qa';
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /explore the assessment/i }));
    expect(screen.getByRole('dialog', { name: /focused two-week initial assessment/i })).toBeInTheDocument();
    await key('Escape');
    fireEvent.click(screen.getByRole('button', { name: /open q&a/i }));
    expect(await screen.findByRole('heading', { name: /discuss what matters most to meridian/i })).toBeInTheDocument();
  });
});

describe('portrait fallback', () => {
  it('shows initials when the photograph fails to load', () => {
    const member = getMember('neeti');
    render(<Portrait member={member} />);
    fireEvent.error(screen.getByRole('img', { name: member.imageAlt }));
    expect(screen.getByTestId('portrait-fallback-neeti')).toHaveTextContent('NB');
  });
});
