import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { experience, opening, teamScene } from '../content/presentationContent';
import { team } from '../data/team';

describe('Meridian Wizards team identity', () => {
  it('uses the team name on the team screen without changing the client name', () => {
    expect(teamScene.headline).toBe('Meet the Meridian Wizards');
    expect(teamScene.subtitle).toBe('The minds behind the transformation.');
    expect(experience.brand).toBe('Meridian Telecom');
  });

  it('shows the team heading, subtitle and all five members with names and roles', () => {
    window.location.hash = '#team';
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: 'Meet the Meridian Wizards' })).toBeInTheDocument();
    expect(screen.getByText('The minds behind the transformation.')).toBeInTheDocument();
    const members = screen.getAllByTestId('team-member');
    expect(members).toHaveLength(5);
    members.forEach((fig, i) => {
      expect(within(fig).getByText(team[i].name)).toBeInTheDocument();
      expect(within(fig).getByText(team[i].role)).toBeInTheDocument();
      expect(within(fig).getByRole('img', { name: team[i].imageAlt })).toBeInTheDocument();
    });
  });

  it('gives every photograph the same 4:5 frame', () => {
    window.location.hash = '#team';
    render(<App />);
    const frames = screen.getAllByTestId('team-member').map((fig) => fig.querySelector('img')!.closest('div.relative.overflow-hidden')!);
    frames.forEach((f) => expect(f.className).toContain('aspect-[4/5]'));
    expect(new Set(frames.map((f) => f.className)).size).toBe(1);
  });

  it('shows MERIDIAN WIZARDS as a subtle identifier on the opening', () => {
    window.location.hash = '#opening';
    render(<App />);
    const id = screen.getByTestId('team-identifier');
    expect(id).toHaveTextContent(`${opening.teamLabel}${opening.teamName}`);
    expect(screen.getByText('Meridian Telecom')).toBeInTheDocument();
  });

  it('renders no continuous loops under reduced motion (static alternative)', () => {
    window.location.hash = '#innovation-challenge';
    const { container } = render(<App />);
    expect(container.querySelectorAll('[data-ambient]')).toHaveLength(0);
  });
});
