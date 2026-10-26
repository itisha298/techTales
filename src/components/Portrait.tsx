import { motion } from 'framer-motion';
import { useState } from 'react';
import type { TeamMember } from '../types/presentation';
import { diagonalHidden, diagonalShown, useMotionPreset } from '../lib/motion';
import { getMember } from '../data/team';
import type { SpeakerId } from '../types/presentation';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

interface PortraitProps {
  member: TeamMember;
  className?: string;
  /** Use the tighter crop for small circular / square thumbnails. */
  tight?: boolean;
  /** Diagonal mask reveal on mount. */
  reveal?: boolean;
  delay?: number;
  /** Load immediately (visible on first paint). Otherwise lazy-loaded. */
  eager?: boolean;
  /** Decorative when the name is printed beside it. */
  decorative?: boolean;
}

/**
 * Team photograph with natural colour, per-photo object-position and an
 * initials fallback if the file cannot load. No overlays on faces.
 */
export function Portrait({ member, className = '', tight, reveal, delay = 0, eager, decorative }: PortraitProps) {
  const [failed, setFailed] = useState(false);
  const m = useMotionPreset();
  const position = tight ? member.objectPositionTight : member.objectPosition;

  const content = failed ? (
    <div
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : member.imageAlt}
      aria-hidden={decorative || undefined}
      data-testid={`portrait-fallback-${member.id}`}
      className="flex h-full w-full items-center justify-center bg-lavender font-semibold tracking-tight text-deep"
      style={{ fontSize: 'clamp(14px, 38cqmin, 120px)' }}
    >
      {initials(member.name)}
    </div>
  ) : (
    <img
      src={member.image}
      alt={decorative ? '' : member.imageAlt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
      style={{ objectPosition: position }}
    />
  );

  return (
    <div className={`relative overflow-hidden bg-lavender [container-type:size] ${className}`}>
      {reveal ? (
        <motion.div
          className="h-full w-full"
          initial={{ clipPath: m.reduced ? diagonalShown : diagonalHidden }}
          animate={{ clipPath: diagonalShown }}
          transition={m.t(0.9, delay)}
        >
          {content}
        </motion.div>
      ) : (
        content
      )}
    </div>
  );
}

/** Active-speaker badge: softly squared portrait, name, role and chapter. */
export function SpeakerBadge({
  speakerId,
  label,
  tone = 'light',
  className = '',
}: {
  speakerId: SpeakerId;
  /** Overrides the chapter label (e.g. "Facilitator"). */
  label?: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const member = getMember(speakerId);
  const dark = tone === 'dark';
  return (
    <div className={`flex items-center gap-[clamp(10px,0.9vw,18px)] ${className}`}>
      <div className="relative shrink-0">
        <Portrait
          member={member}
          tight
          eager
          decorative
          reveal
          delay={0.3}
          className="h-[clamp(48px,calc(3.9*var(--u)),80px)] w-[clamp(48px,calc(3.9*var(--u)),80px)] rounded-[6px]"
        />
        <span aria-hidden className={`absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 ${dark ? 'border-white' : 'border-purple'}`} />
      </div>
      <div className="min-w-0">
        <p className={`t-eyebrow ${dark ? 'text-white/80' : 'text-purple'}`}>{label ?? member.chapter}</p>
        <p className={`t-small font-bold ${dark ? 'text-white' : 'text-ink'}`}>{member.name}</p>
        <p className={`t-small ${dark ? 'text-white/80' : 'text-muted'}`}>{member.role}</p>
      </div>
    </div>
  );
}
