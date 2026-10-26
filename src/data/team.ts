import teamJson from '../content/editable/team.json';
import type { SpeakerId, TeamMember } from '../types/presentation';

/**
 * Team data adapter. Edit names, roles, photographs and crops in
 * src/content/editable/team.json; every component reads from here.
 *
 * - `image` is a path inside public/ (e.g. team/mayank-jain.png).
 * - `imageAlt` is optional; by default it is "Portrait of {name}, {role}".
 * - The speech document spells "Suryakant"; the UI uses the name in team.json.
 */
interface TeamFileMember extends Omit<TeamMember, 'imageAlt'> {
  imageAlt?: string;
}

const img = (file: string) => `${import.meta.env.BASE_URL}${file.replace(/^\/+/, '')}`;

export const team: TeamMember[] = (teamJson as { members: TeamFileMember[] }).members.map((m) => ({
  id: m.id,
  name: m.name,
  shortName: m.shortName,
  role: m.role,
  chapter: m.chapter,
  image: img(m.image),
  imageAlt: m.imageAlt ?? `Portrait of ${m.name}, ${m.role}`,
  objectPosition: m.objectPosition,
  objectPositionTight: m.objectPositionTight,
  shortIntroduction: m.shortIntroduction,
}));

export const teamById = Object.fromEntries(team.map((m) => [m.id, m])) as Record<SpeakerId, TeamMember>;

export const getMember = (id: SpeakerId): TeamMember => teamById[id];
