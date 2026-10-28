import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { pendingConfirmations, partAt, scenes, totalPlannedSeconds, ui } from '../content/presentationContent';
import { speakerFor } from '../lib/speaker';
import { getMember } from '../data/team';
import { usePresenterTimer } from '../hooks/presenterTimer';
import { formatClock, useMotionPreset } from '../lib/motion';
import { getSceneNotes, splitStageDirections } from '../lib/notes';
import { Portrait } from './Portrait';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line px-6 py-5">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.16em] text-deep">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Clock() {
  const t = usePresenterTimer();
  const remaining = totalPlannedSeconds - t.elapsed;
  return (
    <span className="tabular-nums">
      {formatClock(remaining)} <span className="text-muted">of {formatClock(totalPlannedSeconds)}</span>
      {!t.running && <span className="ml-2 text-[13px] font-semibold text-muted">(timer paused, press T)</span>}
    </span>
  );
}

/** N — presenter notes. Never rendered unless the presenter opens it. */
export function NotesPanel({ index, step = 0, onClose }: { index: number; step?: number; onClose: () => void }) {
  const m = useMotionPreset();
  const scene = scenes[index];
  const part = partAt(index, step);
  const notes = useMemo(() => getSceneNotes(part), [part]);
  const speaker = getMember(speakerFor(scene, step));
  const next = notes.nextSpeakerId ? getMember(notes.nextSpeakerId) : null;
  const nextScene = scenes[index + 1];
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstCurrent = useRef<HTMLParagraphElement>(null);

  // Bring the current scene's script into view when the scene changes.
  useEffect(() => {
    const el = firstCurrent.current;
    const box = scrollRef.current;
    if (el && box) box.scrollTo({ top: Math.max(0, el.offsetTop - 120), behavior: m.reduced ? 'auto' : 'smooth' });
  }, [part, m.reduced]);

  const firstIndex = notes.paragraphs.findIndex((p) => p.current);

  return (
    <motion.aside
      aria-label="Presenter notes"
      className="fixed inset-y-0 right-0 z-40 flex w-[min(560px,100vw)] flex-col border-l border-line bg-white shadow-[-24px_0_60px_-40px_rgba(70,0,115,0.45)]"
      initial={{ x: m.reduced ? 0 : 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: m.reduced ? 0 : 40, opacity: 0 }}
      transition={m.t(0.35)}
    >
      <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <Portrait member={speaker} tight decorative className="h-12 w-12 rounded-[6px]" />
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-purple">
              Scene {index + 1} / {scenes.length} · {scene.navLabel}
            </p>
            <p className="text-[18px] font-bold">{speaker.name}</p>
            <p className="text-[14px] text-muted">
              {speaker.role} · speech {notes.speechDuration}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close presenter notes (N)" className="flex h-10 w-10 shrink-0 items-center justify-center hover:bg-lavender">
          <X aria-hidden className="h-5 w-5" />
        </button>
      </header>

      <div ref={scrollRef} data-native-keys className="thin-scroll relative flex-1 overflow-y-auto pb-10">
        <Section title="Timing">
          <p className="text-[16px] font-semibold">{notes.timingGuidance}</p>
          <p className="mt-1 text-[15px] text-ink">
            Scene planned {formatClock(scene.plannedSeconds)} · Remaining presentation <Clock />
          </p>
          {scene.steps > 1 && (
            <p data-testid="notes-build" className="mt-2 inline-flex items-center gap-2 bg-lavender px-2 py-1 text-[14px] font-semibold text-deep">
              {ui.build(step + 1, scene.steps)} ·{' '}
              {step < scene.steps - 1 ? `${ui.buildHint}, not the scene` : 'next arrow changes scene'}
            </p>
          )}
        </Section>

        {notes.cues.length > 0 && (
          <Section title="On this scene">
            <ul className="grid gap-2">
              {notes.cues.map((c) => (
                <li key={c} className="text-[15px] leading-snug text-ink">
                  {c}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title={notes.scriptSpeakerId && notes.scriptSpeakerId !== notes.speakerId ? `Script · spoken by ${getMember(notes.scriptSpeakerId).name}` : 'Full speech'}>
          {notes.paragraphs.length === 0 ? (
            <p className="text-[15px] text-muted">No scripted speech for this scene in the source document.</p>
          ) : (
            <div className="grid gap-3">
              {notes.paragraphs.map((p, i) => {
                const isFirst = i === firstIndex;
                return (
                  <p
                    key={i}
                    ref={isFirst ? firstCurrent : undefined}
                    className={`text-[17px] leading-[1.55] ${p.current ? 'border-l-2 border-purple pl-3 text-ink' : 'pl-3 text-muted'}`}
                  >
                    {splitStageDirections(p.text).map((part, j) =>
                      part.direction ? (
                        <span key={j} className="mx-1 inline-block bg-lavender px-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-deep">
                          {part.text.replace(/[()]/g, '')}
                        </span>
                      ) : (
                        <span key={j}>{part.text}</span>
                      ),
                    )}
                  </p>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-[13px] text-muted">Highlighted paragraphs belong to this scene. Text is verbatim from the source.</p>
        </Section>

        {notes.pauses.length > 0 && (
          <Section title="Important pauses">
            <ul className="grid gap-1.5">
              {notes.pauses.map((p) => (
                <li key={p} className="text-[15px]">
                  {p}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {notes.deliveryTips.length > 0 && (
          <Section title="Delivery tips">
            <ul className="grid gap-2">
              {notes.deliveryTips.map((t) => (
                <li key={t} className="text-[15px] leading-snug">
                  {t}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Handover">
          {notes.handoverLine ? <p className="text-[16px] font-semibold">“{notes.handoverLine}”</p> : <p className="text-[15px] text-muted">No scripted handover line in the source.</p>}
          <p className="mt-2 text-[15px]">
            Next speaker: <strong>{next ? `${next.name}, ${next.role}` : '—'}</strong>
          </p>
          <p className="mt-1 text-[15px] text-muted">Next scene: {nextScene ? nextScene.navLabel : 'End of presentation'}</p>
        </Section>

        <Section title="Awaiting confirmation">
          <ul className="grid gap-2">
            {pendingConfirmations.map((p) => (
              <li key={p.topic} className="text-[14px] leading-snug">
                <strong>{p.topic}:</strong> {p.current}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </motion.aside>
  );
}
