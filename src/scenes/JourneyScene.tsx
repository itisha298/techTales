import { motion } from 'framer-motion';
import { chapters, journey } from '../content/presentationContent';
import { getMember } from '../data/team';
import { useMotionPreset } from '../lib/motion';
import { Portrait } from '../components/Portrait';
import { Chevron, Eyebrow, Reveal } from '../components/primitives';
import { PulseRing, TravelGlow } from '../components/ambient';

const LINE_START = 0.35;
const LINE_DURATION = 1.6;

export default function JourneyScene() {
  const m = useMotionPreset();
  const qa = getMember('aryama');
  const nodeDelay = (i: number) => LINE_START + (LINE_DURATION * (i + 0.15)) / 5;

  return (
    <div className="scene-pad flex min-h-full flex-col">
      <header className="max-w-[calc(70*var(--u))]">
        <Reveal>
          <Eyebrow>{journey.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.12} y={24}>
          <h2 className="t-headline mt-[clamp(12px,calc(1.6*var(--u)),32px)]">{journey.headline}</h2>
        </Reveal>
      </header>

      <div className="mt-[clamp(28px,calc(4*var(--u)),80px)] flex-1 lg:flex lg:flex-col lg:justify-center">
       <div className="relative">
        {/* The journey line (horizontal on desktop, vertical on small screens) */}
        <motion.span
          aria-hidden
          className="absolute left-[11px] top-0 h-full w-[2px] bg-purple lg:left-0 lg:top-[calc(7.6*var(--u))] lg:h-[2px] lg:w-full"
          style={{ transformOrigin: 'left top' }}
          initial={m.reduced ? false : { scaleX: 0, scaleY: 0 }}
          animate={{ scaleX: 1, scaleY: 1 }}
          transition={m.t(LINE_DURATION, LINE_START)}
        />
        {/* Continuous highlight travelling along the journey line */}
        <div aria-hidden className="absolute left-0 top-[calc(7.6*var(--u)-2px)] hidden h-[6px] w-full overflow-hidden lg:block">
          <TravelGlow duration={7} delay={LINE_START + LINE_DURATION} fraction={0.12} className="via-violet/70" repeatDelay={1} />
        </div>
        <ol className="relative grid gap-[clamp(28px,calc(2.4*var(--u)),48px)] lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,0.72fr)] lg:gap-[clamp(20px,calc(2.2*var(--u)),44px)]">
          {chapters.map((c, i) => {
            const member = getMember(c.speakerId);
            return (
              <motion.li
                key={c.id}
                className="relative pl-10 lg:pl-0"
                initial={{ opacity: 0, y: m.y(16) }}
                animate={{ opacity: 1, y: 0 }}
                transition={m.t(0.6, nodeDelay(i))}
              >
                <p aria-hidden className="t-chapter-num text-deep/90 lg:h-[calc(7.6*var(--u))] lg:pb-[calc(1.2*var(--u))] lg:flex lg:items-end">
                  {c.number}
                </p>
                <span className="sr-only">Chapter {c.number}</span>
                {/* Node marker sits on the line */}
                <PulseRing
                  className="left-[5px] top-[calc(2.6*var(--u))] h-[14px] w-[14px] rotate-45 lg:left-0 lg:top-[calc(7.6*var(--u)-6px)]"
                  delay={LINE_START + LINE_DURATION + i * 0.9}
                  duration={4}
                />
                <span
                  aria-hidden
                  className="absolute left-[5px] top-[calc(2.6*var(--u))] h-[14px] w-[14px] rotate-45 border-2 border-purple bg-white lg:left-0 lg:top-[calc(7.6*var(--u)-6px)]"
                />
                <div data-testid="journey-speaker" className="mt-[clamp(10px,calc(2*var(--u)),40px)] flex min-h-[calc(4.2*clamp(14px,calc(0.95*var(--u)),20px))] items-center gap-3">
                  <Portrait
                    member={member}
                    tight
                    eager
                    decorative
                    className="h-[clamp(44px,calc(3.6*var(--u)),72px)] w-[clamp(44px,calc(3.6*var(--u)),72px)] rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="t-small font-bold">{member.name}</p>
                    <p className="t-small leading-snug text-muted [text-wrap:balance]">{member.role}</p>
                  </div>
                </div>
                <h3 className="mt-[clamp(10px,calc(1.3*var(--u)),26px)] text-[clamp(20px,calc(1.75*var(--u)),36px)] font-bold leading-[1.12] tracking-[-0.02em]">
                  {c.title}
                </h3>
                <p className="t-body mt-2 max-w-[28ch] text-muted">{c.outcome}</p>
              </motion.li>
            );
          })}
          <motion.li
            className="relative pl-10 lg:pl-0"
            initial={{ opacity: 0, y: m.y(16) }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.t(0.6, nodeDelay(4))}
          >
            <p className="t-eyebrow text-muted lg:flex lg:h-[calc(7.6*var(--u))] lg:items-end lg:pb-[calc(1.4*var(--u))]">
              {journey.closing.label}
            </p>
            <span aria-hidden className="absolute left-[3px] top-[calc(0.4*var(--u))] text-purple lg:left-auto lg:right-0 lg:top-[calc(7.6*var(--u)-13px)]">
              <Chevron className="h-[28px] w-[18px]" strokeWidth={2.5} />
            </span>
            <div data-testid="journey-speaker" className="mt-[clamp(10px,calc(2*var(--u)),40px)] flex min-h-[calc(4.2*clamp(14px,calc(0.95*var(--u)),20px))] items-center gap-3">
              <Portrait
                member={qa}
                tight
                eager
                decorative
                className="h-[clamp(44px,calc(3.6*var(--u)),72px)] w-[clamp(44px,calc(3.6*var(--u)),72px)] rounded-full"
              />
              <div className="min-w-0">
                <p className="t-small font-bold">{qa.name}</p>
                <p className="t-small leading-snug text-muted [text-wrap:balance]">{qa.role}</p>
              </div>
            </div>
            <h3 className="mt-[clamp(10px,calc(1.3*var(--u)),26px)] text-[clamp(20px,calc(1.75*var(--u)),36px)] font-bold leading-[1.12] tracking-[-0.02em]">
              {journey.closing.title}
            </h3>
            <p className="t-body mt-2 max-w-[28ch] text-muted">{journey.closing.detail}</p>
          </motion.li>
        </ol>
       </div>
      </div>

      <Reveal delay={LINE_START + LINE_DURATION} className="mt-[clamp(24px,calc(3*var(--u)),60px)]">
        <p className="t-lead flex items-start gap-4 font-semibold text-ink">
          <Chevron className="mt-[0.3em] h-[0.9em] w-[0.55em] shrink-0 text-purple" strokeWidth={2.5} />
          {journey.nextStep}
        </p>
      </Reveal>
    </div>
  );
}
