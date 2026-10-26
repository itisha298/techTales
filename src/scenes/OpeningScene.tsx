import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { opening } from '../content/presentationContent';
import { useMotionPreset } from '../lib/motion';
import { Eyebrow, Reveal } from '../components/primitives';
import type { SceneProps } from './types';

/**
 * Opening artwork: the purple connected-globe image, extracted from the
 * supplied mock-up by scripts/extract-opening-artwork.mjs. It is static: no
 * rotation, zoom, parallax or pulsing. It fades in once and then stays still.
 */
const ARTWORK = `${import.meta.env.BASE_URL}images/meridian-opening-globe.webp`;

function OpeningArtwork() {
  const m = useMotionPreset();
  const feather =
    'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 16%, #000 36%), linear-gradient(to bottom, transparent 0%, #000 22%, #000 93%, transparent 100%)';
  const featherMobile = 'linear-gradient(to bottom, #000 0%, #000 52%, transparent 100%)';
  return (
    <>
      {/* Desktop / large screens: right-hand side */}
      <motion.div
        data-testid="opening-artwork"
        className="pointer-events-none absolute bottom-0 right-0 hidden aspect-[712/530] max-h-[94%] w-[62%] lg:block"
        style={{ maskImage: feather, WebkitMaskImage: feather, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={m.t(1.2, 0.15)}
      >
        <img src={ARTWORK} alt="" decoding="async" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      </motion.div>
      {/* Small screens: banner above the text */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-[36%] lg:hidden"
        style={{ maskImage: featherMobile, WebkitMaskImage: featherMobile }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={m.t(1.0, 0.1)}
      >
        <img src={ARTWORK} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[35%_40%]" />
      </motion.div>
    </>
  );
}

/** "A New Prime Meridian" -> "A New" / "Prime Meridian" with the last word in purple. */
function Title({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  const breakAt = words.length >= 4 ? 2 : 0;
  const first = words.slice(0, breakAt).join(' ');
  const rest = words.slice(breakAt);
  const last = rest.pop();
  return (
    <>
      {first && (
        <>
          {first}{' '}
          <br />
        </>
      )}
      {rest.length > 0 && `${rest.join(' ')} `}
      <span className="text-purple">{last}</span>
    </>
  );
}

export default function OpeningScene({ next }: SceneProps) {
  return (
    <div className="relative h-full overflow-hidden">
      <OpeningArtwork />

      <div className="scene-pad relative flex h-full flex-col justify-end lg:justify-center">
        <div className="lg:max-w-[calc(58*var(--u))]">
          <Reveal delay={0.3}>
            <Eyebrow>{opening.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.45} y={26}>
            <h2 className="t-display mt-[clamp(16px,calc(2.2*var(--u)),44px)] text-ink">
              <Title text={opening.title} />
            </h2>
          </Reveal>
          <Reveal delay={0.65}>
            <p className="t-lead mt-[clamp(16px,calc(2*var(--u)),40px)] max-w-[34ch] text-muted">{opening.subtitle}</p>
          </Reveal>
          <Reveal delay={0.9} className="mt-[clamp(24px,calc(3.6*var(--u)),72px)] flex flex-wrap items-center gap-x-8 gap-y-4">
            <button
              type="button"
              onClick={next}
              className="group cut-br inline-flex items-center gap-4 bg-ink py-[clamp(14px,calc(1.05*var(--u)),22px)] pl-[clamp(20px,calc(1.6*var(--u)),32px)] pr-[clamp(26px,calc(2.1*var(--u)),42px)] text-white transition-colors duration-200 hover:bg-deep [--cut:14px]"
            >
              <span className="t-body font-semibold">{opening.cta}</span>
              <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <span className="t-eyebrow text-muted">{opening.label}</span>
          </Reveal>
          <Reveal delay={1.3}>
            <p className="t-small mt-[clamp(18px,calc(2*var(--u)),40px)] text-muted">
              <span className="hidden [@media(hover:hover)]:inline">{opening.hint}</span>
              <span className="[@media(hover:hover)]:hidden">{opening.hintTouch}</span>
            </p>
          </Reveal>
          <Reveal delay={1.5}>
            <p data-testid="team-identifier" className="t-eyebrow mt-[clamp(14px,calc(1.6*var(--u)),32px)] flex flex-wrap items-center gap-x-3 gap-y-1 whitespace-nowrap text-muted">
              <span aria-hidden className="inline-block h-[7px] w-[7px] rotate-45 bg-purple" />
              {opening.teamLabel}
              <span className="text-deep">{opening.teamName}</span>
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
