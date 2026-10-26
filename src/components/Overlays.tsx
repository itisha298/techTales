import { Check } from 'lucide-react';
import { ask, chapterById, chapters, experience, scenes, ui } from '../content/presentationContent';
import { getMember } from '../data/team';
import { formatClock } from '../lib/motion';
import { Dialog } from './Dialog';
import { Portrait } from './Portrait';
import { Chevron, Eyebrow } from './primitives';

/** O — every scene at a glance. */
export function OverviewOverlay({ current, onSelect, onClose }: { current: number; onSelect: (i: number) => void; onClose: () => void }) {
  return (
    <Dialog title={ui.overview} onClose={onClose} labelledBy="overview-title">
      <div className="mx-auto max-w-[1600px] px-[var(--pad-x)] py-[clamp(24px,4vw,72px)]">
        <Eyebrow>{experience.title}</Eyebrow>
        <h2 id="overview-title" className="t-headline-sm mt-4">
          {ui.overview}
        </h2>
        <ol className="mt-[clamp(20px,3vw,48px)] grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-5">
          {scenes.map((s, i) => {
            const member = getMember(s.speakerId);
            const chapter = s.chapterId ? chapterById[s.chapterId] : null;
            const active = i === current;
            return (
              <li key={s.id} className="border-b border-r border-line">
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-current={active ? 'step' : undefined}
                  className={`group relative flex h-full w-full flex-col p-[clamp(14px,1.4vw,28px)] text-left transition-colors duration-200 hover:bg-lavender ${
                    active ? 'bg-lavender' : ''
                  }`}
                >
                  {active && <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-purple" />}
                  <span className="text-[clamp(28px,2.6vw,52px)] font-light leading-none tracking-[-0.04em] text-deep tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="t-eyebrow mt-4 text-muted">{chapter ? `${chapter.number} · ${chapter.navLabel}` : s.railLabel}</span>
                  <span className="mt-1 text-[clamp(17px,1.25vw,24px)] font-bold leading-snug">{s.navLabel}</span>
                  <span className="mt-auto flex items-center gap-2 pt-5">
                    <Portrait member={member} tight decorative className="h-8 w-8 rounded-full" />
                    <span className="t-small text-muted">
                      {member.shortName} · {formatClock(s.plannedSeconds)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </Dialog>
  );
}

/** M — chapter menu, grouped by the four source chapters. */
export function ChapterMenu({ current, onSelect, onClose }: { current: number; onSelect: (i: number) => void; onClose: () => void }) {
  const groups: { key: string; label: string; number?: string; items: number[] }[] = [];
  scenes.forEach((s, i) => {
    const key = s.chapterId ?? s.id;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(i);
    else {
      const c = s.chapterId ? chapterById[s.chapterId] : null;
      groups.push({ key, label: c ? c.title : (s.railLabel ?? s.navLabel), number: c?.number, items: [i] });
    }
  });
  return (
    <Dialog title={ui.menu} onClose={onClose} variant="left" labelledBy="menu-title">
      <nav aria-labelledby="menu-title" className="px-8 py-10">
        <Eyebrow>{experience.brand}</Eyebrow>
        <h2 id="menu-title" className="mt-3 text-[28px] font-bold tracking-[-0.02em]">
          {ui.menu}
        </h2>
        <ol className="mt-8 grid gap-6">
          {groups.map((g) => (
            <li key={g.key}>
              <p className="t-eyebrow text-muted">
                {g.number && <span className="mr-2 text-purple">{g.number}</span>}
                {g.label}
              </p>
              <ul className="mt-2 border-l border-line">
                {g.items.map((i) => (
                  <li key={scenes[i].id}>
                    <button
                      type="button"
                      onClick={() => onSelect(i)}
                      aria-current={i === current ? 'step' : undefined}
                      className={`flex w-full items-center gap-3 py-2.5 pl-4 pr-2 text-left text-[17px] font-semibold transition-colors duration-200 hover:bg-lavender ${
                        i === current ? '-ml-px border-l-2 border-purple text-deep' : 'text-ink'
                      }`}
                    >
                      <span className="w-6 text-[14px] font-medium tabular-nums text-muted">{String(i + 1).padStart(2, '0')}</span>
                      {scenes[i].navLabel}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="t-small mt-10 text-muted">
          {chapters.length} chapters · {scenes.length} scenes
        </p>
      </nav>
    </Dialog>
  );
}

/** "Explore the assessment" detail panel. */
export function AssessmentPanel({ onClose }: { onClose: () => void }) {
  const d = ask.detail;
  return (
    <Dialog title={d.title} onClose={onClose} variant="right" labelledBy="assessment-title">
      <div className="px-[clamp(24px,3vw,56px)] py-[clamp(28px,4vw,64px)]">
        <Eyebrow>{ask.eyebrow}</Eyebrow>
        <h2 id="assessment-title" className="mt-4 text-[clamp(30px,2.6vw,48px)] font-bold leading-[1.05] tracking-[-0.03em]">
          {d.title}
        </h2>
        <p className="t-body mt-4 max-w-[48ch] text-muted">{d.purpose}</p>

        <section className="mt-10 border-t-2 border-ink pt-5">
          <h3 className="t-eyebrow text-deep">{d.participants.label}</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {d.participants.items.map((p) => (
              <li key={p} className="t-small border border-line px-3 py-1.5 font-semibold">
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 border-t-2 border-ink pt-5">
          <h3 className="t-eyebrow text-deep">{d.outputs.label}</h3>
          <ul className="mt-4 grid gap-3">
            {d.outputs.items.map((o) => (
              <li key={o} className="t-body flex items-start gap-3 font-semibold">
                <Check aria-hidden className="mt-1 h-5 w-5 shrink-0 text-success" />
                {o}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 border-t-2 border-ink pt-5">
          <h3 className="t-eyebrow text-deep">{d.nextSteps.label}</h3>
          <ol className="mt-4 grid gap-3">
            {d.nextSteps.items.map((s, i) => (
              <li key={s} className="t-body flex items-start gap-3">
                <span className="w-7 shrink-0 font-bold tabular-nums text-purple">{String(i + 1).padStart(2, '0')}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        <p className="t-small mt-12 flex items-center gap-2 text-muted">
          <Chevron className="h-3 w-2 text-purple" strokeWidth={2.5} />
          {experience.disclaimer}
        </p>
      </div>
    </Dialog>
  );
}
