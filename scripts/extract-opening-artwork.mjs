// One-time extraction of the opening artwork (npm run images:opening).
//
// Source (kept untouched): public/images/meridian-opening.png.png, a full
// slide mock-up with baked-in headings, buttons, navigation and footer.
// Only the clean globe-and-network region is used, so no duplicate or
// partially cropped text appears on screen:
//   x 960–1672, y 306–836 (right of the "Meridian" headline, below the
//   "A connected tomorrow" label, above the footer band).
// The region is upscaled 2x with Lanczos and lightly sharpened, then saved as WebP.
import sharp from 'sharp';
import { existsSync, statSync } from 'node:fs';

const candidates = ['public/images/meridian-opening.png', 'public/images/meridian-opening.png.png'];
const SRC = candidates.find((p) => existsSync(p));
if (!SRC) throw new Error(`Opening image not found. Expected one of: ${candidates.join(', ')}`);
const OUT = 'public/images/meridian-opening-globe.webp';
export const REGION = { left: 960, top: 306, width: 712, height: 530 };

await sharp(SRC)
  .extract(REGION)
  .resize({ width: REGION.width * 2, kernel: 'lanczos3' })
  .sharpen({ sigma: 0.8, m1: 0.6, m2: 1.2 })
  .webp({ quality: 84, effort: 6, smartSubsample: true })
  .toFile(OUT);

console.log(`${SRC} (${(statSync(SRC).size / 1024).toFixed(0)} KB) -> ${OUT} (${(statSync(OUT).size / 1024).toFixed(0)} KB)`);
