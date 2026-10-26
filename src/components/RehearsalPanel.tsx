import { motion } from 'framer-motion';
import { Pause, Play, RotateCw, X } from 'lucide-react';
import { pendingConfirmations, scenes, totalPlannedSeconds, ui } from '../content/presentationContent';
import { getMember } from '../data/team';
import { useRehearsal, type RehearsalStore } from '../hooks/rehearsal';
import { formatClock, useMotionPreset } from '../lib/motion';
import type { SpeakerId } from '../types/presentation';

/** "+0:12 over" / "−0:20 under", with a symbol so meaning never relies on colour. */
function Delta({ actual, planned }: { actual: number; planned: number }) {
  if (actual === 0) return <span className="text-muted">—</span>;
  const d = actual - planned;
  if (Math.abs(d) < 5) return <span className="text-success">● on plan</span>;
  return d > 0 ? (
    <span className="font-bold text-warning-ink">▲ {formatClock(d)} over</span>
  ) : (
    <span className="text-muted">▼ {formatClock(-d)} under</span>
  );
}

/** Speaker groups in running order (consecutive scenes by the same speaker). */
const groups = scenes.reduce<{ speakerId: SpeakerId; items: number[] }[]>((acc, s, i) => {
  const last = acc[acc.length - 1];
  if (last && last.speakerId === s.speakerId) last.items.push(i);
  else acc.push({ speakerId: s.speakerId, items: [i] });
  return acc;
}, []);

/**
 * R — rehearsal mode. Window-local: it never syncs to, or follows, other
 * windows, and it does not alter the audience view in any other window.
 */
export function RehearsalPanel({ store, onClose }: { store: RehearsalStore; onClose: () => void }) {
  const m = useMotionPreset();
  const r = useRehearsal(store);
  const totalActual = r.perScene.reduce((a, b) => a + b, 0);

  return (
    <motion.aside
      aria-label="Rehearsal timing"
      data-native-keys
      className="thin-scroll fixed inset-y-0 left-0 z-40 flex w-[min(460px,100vw)] flex-col overflow-y-auto border-r border-line bg-white shadow-[24px_0_60px_-40px_rgba(70,0,115,0.45)]"
      initial={{ x: m.reduced ? 0 : -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: m.reduced ? 0 : -40, opacity: 0 }}
      transition={m.t(0.35)}
    >
      <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-purple">{ui.rehearsal} mode</p>
          <p className="mt-1 text-[22px] font-bold tracking-[-0.02em]">Chapter timing</p>
          <p className="mt-1 text-[14px] leading-snug text-muted">
            This window is isolated. It does not sync with other windows, and its timing is stored in this browser only.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="End rehearsal (R)" className="flex h-10 w-10 shrink-0 items-center justify-center hover:bg-lavender">
          <X aria-hidden className="h-5 w-5" />
        </button>
      </header>

      <div className="flex items-center gap-2 border-t border-line px-6 py-4">
        <button
          type="button"
          onClick={() => (r.running ? store.pause() : store.start(r.currentIndex))}
          className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-[14px] font-semibold text-white hover:bg-deep"
        >
          {r.running ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
          {r.running ? 'Pause' : 'Resume'}
        </button>
        <button type="button" onClick={store.reset} className="inline-flex items-center gap-2 border border-line px-4 py-2 text-[14px] font-semibold hover:bg-lavender">
          <RotateCw aria-hidden className="h-4 w-4" />
          Reset run
        </button>
        <p className="ml-auto text-right text-[13px] text-muted">
          This visit
          <br />
          <span className="text-[18px] font-bold tabular-nums text-ink">{formatClock(r.currentVisit)}</span>
        </p>
      </div>

      <table className="w-full border-t border-line text-[14px]">
        <caption className="sr-only">Planned and actual time per scene, grouped by speaker</caption>
        <thead>
          <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            <th scope="col" className="px-6 py-2 font-bold">Scene</th>
            <th scope="col" className="py-2 text-right font-bold">Plan</th>
            <th scope="col" className="py-2 text-right font-bold">Actual</th>
            <th scope="col" className="px-6 py-2 text-right font-bold">Δ</th>
          </tr>
        </thead>
        {groups.map((g) => {
          const member = getMember(g.speakerId);
          const planned = g.items.reduce((a, i) => a + scenes[i].plannedSeconds, 0);
          const actual = g.items.reduce((a, i) => a + r.perScene[i], 0);
          return (
            <tbody key={`${g.speakerId}-${g.items[0]}`} className="border-t border-line">
              <tr className="bg-lavender/60">
                <th scope="rowgroup" className="px-6 py-2 text-left font-bold">
                  {member.name}
                </th>
                <td className="py-2 text-right font-semibold tabular-nums">{formatClock(planned)}</td>
                <td className="py-2 text-right font-semibold tabular-nums">{formatClock(actual)}</td>
                <td className="px-6 py-2 text-right text-[13px]">
                  <Delta actual={actual} planned={planned} />
                </td>
              </tr>
              {g.items.map((i) => (
                <tr key={scenes[i].id} aria-current={i === r.currentIndex ? 'step' : undefined} className={i === r.currentIndex ? 'text-deep' : ''}>
                  <td className="py-1.5 pl-9 pr-2">
                    {i === r.currentIndex && <span aria-hidden className="-ml-4 mr-2 inline-block h-2 w-2 rotate-45 bg-purple" />}
                    {String(i + 1).padStart(2, '0')} · {scenes[i].navLabel}
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-muted">{formatClock(scenes[i].plannedSeconds)}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatClock(r.perScene[i])}</td>
                  <td className="px-6 py-1.5 text-right text-[13px]">
                    <Delta actual={r.perScene[i]} planned={scenes[i].plannedSeconds} />
                  </td>
                </tr>
              ))}
            </tbody>
          );
        })}
        <tfoot className="border-t-2 border-ink">
          <tr>
            <th scope="row" className="px-6 py-3 text-left font-bold">
              Total
            </th>
            <td className="py-3 text-right font-bold tabular-nums">{formatClock(totalPlannedSeconds)}</td>
            <td className="py-3 text-right font-bold tabular-nums">{formatClock(totalActual)}</td>
            <td className="px-6 py-3 text-right text-[13px]">
              <Delta actual={totalActual} planned={totalPlannedSeconds} />
            </td>
          </tr>
        </tfoot>
      </table>

      <section className="border-t border-line px-6 py-5">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.16em] text-deep">Awaiting confirmation</h3>
        <p className="mt-1 text-[13px] text-muted">Deliberately unresolved. Confirm with the team before presenting.</p>
        <ul className="mt-3 grid gap-2.5">
          {pendingConfirmations.map((p) => (
            <li key={p.topic} className="text-[14px] leading-snug">
              <strong>{p.topic}:</strong> {p.current}
              <br />
              <span className="text-[12px] text-muted">Configured in {p.where}</span>
            </li>
          ))}
        </ul>
      </section>
    </motion.aside>
  );
}
