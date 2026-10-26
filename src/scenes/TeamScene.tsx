import { motion } from 'framer-motion';
import { teamScene } from '../content/presentationContent';
import { team } from '../data/team';
import { useMotionPreset } from '../lib/motion';
import { Portrait } from '../components/Portrait';
import { Eyebrow, Reveal } from '../components/primitives';
import { AmbientLight, TravelGlow } from '../components/ambient';
import type { TeamMember } from '../types/presentation';

/**
 * Every photograph sits in an identical 4:5 frame: one shared grid track
 * width per breakpoint, the same aspect ratio, the same cut corner and the
 * same purple accent. Only object-position differs, per photo, so each face
 * stays centred without stretching.
 */
function Member({ member, i }: { member: TeamMember; i: number }) {
  return (
    <Reveal delay={0.3 + i * 0.12} y={0} className="min-w-0">
      <figure data-testid="team-member" className="group relative">
        <div className="relative">
          <Portrait
            member={member}
            reveal
            delay={0.35 + i * 0.12}
            className="cut-br aspect-[4/5] w-full [--cut:24px]"
          />
          {/* Uniform purple accent; extends gently on hover */}
          <span
            aria-hidden
            className="absolute -bottom-2 -right-2 h-10 w-10 border-b-2 border-r-2 border-purple transition-[width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:h-14 group-hover:w-14"
          />
          <span aria-hidden className="absolute -left-2 top-0 h-1/3 w-[2px] origin-top bg-purple/0 transition-colors duration-300 group-hover:bg-purple" />
        </div>
        <figcaption className="mt-[clamp(12px,calc(1.3*var(--u)),26px)]">
          <p className="t-eyebrow text-purple">{member.chapter}</p>
          <p className="mt-1.5 text-[clamp(18px,calc(1.55*var(--u)),32px)] font-bold leading-tight tracking-[-0.02em]">{member.name}</p>
          <p className="t-small text-muted">{member.role}</p>
          <p className="t-small mt-2 hidden max-w-[30ch] text-ink/80 [@media(min-width:1280px)_and_(min-height:900px)]:block">
            {member.shortIntroduction}
          </p>
        </figcaption>
      </figure>
    </Reveal>
  );
}

export default function TeamScene() {
  const m = useMotionPreset();
  return (
    <div className="relative min-h-full overflow-hidden">
      {/* Soft ambient background motion */}
      <AmbientLight className="-right-[12%] -top-[22%] h-[70vh] w-[70vh] bg-[radial-gradient(closest-side,rgba(161,0,255,0.07),transparent)]" duration={20} drift={50} />
      <AmbientLight className="-bottom-[30%] -left-[10%] h-[60vh] w-[60vh] bg-[radial-gradient(closest-side,rgba(124,58,237,0.06),transparent)]" duration={16} drift={36} />

      <div className="scene-pad relative flex min-h-full flex-col">
        <header>
          <Reveal>
            <Eyebrow>{teamScene.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1} y={24}>
            <h2 className="t-headline-sm mt-[clamp(12px,calc(1.4*var(--u)),28px)]">{teamScene.headline}</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="t-lead mt-[clamp(6px,calc(0.8*var(--u)),16px)] text-muted">{teamScene.subtitle}</p>
          </Reveal>
          {/* Animated purple line beneath the heading */}
          <div aria-hidden className="relative mt-[clamp(14px,calc(1.6*var(--u)),32px)] h-[2px] w-[min(100%,calc(34*var(--u)))] overflow-hidden bg-line">
            <motion.span
              className="absolute inset-y-0 left-0 w-1/3 bg-purple"
              style={{ transformOrigin: 'left' }}
              initial={{ scaleX: m.reduced ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={m.t(0.9, 0.3)}
            />
            <TravelGlow duration={6} delay={1.2} fraction={0.25} className="via-purple" repeatDelay={1.2} />
          </div>
        </header>

        <div className="my-auto grid grid-cols-2 gap-x-[clamp(16px,calc(2.2*var(--u)),44px)] gap-y-10 pt-[clamp(24px,calc(3*var(--u)),60px)] sm:grid-cols-3 lg:grid-cols-5">
          {team.map((member, i) => (
            <Member key={member.id} member={member} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
