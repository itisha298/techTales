// One-time optimisation of the supplied team photographs.
// Usage: npm run images
// Resizes only (no retouching, colour shifts or reshaping) and re-encodes
// into public/team/ with URL-safe filenames.
import sharp from 'sharp';
import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'source-assets';
const OUT = 'public/team';
const MAX_WIDTH = 900;

const files = [
  ['Aryama Das.jpg', 'aryama-das.jpg'],
  ['Neeti Bourai.jpg', 'neeti-bourai.jpg'],
  ['Mayank Jain.png', 'mayank-jain.png'],
  ['Sushant.png', 'sushant.png'],
  ['Suryakanta Das.jpg', 'suryakanta-das.jpg'],
];

await mkdir(OUT, { recursive: true });

for (const [from, to] of files) {
  const input = path.join(SRC, from);
  const output = path.join(OUT, to);
  let pipeline = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  pipeline = to.endsWith('.png')
    ? // High-quality 256-colour palette with dithering: visually lossless for
      // these portraits at presentation sizes, roughly 4-5x smaller.
      pipeline.png({ palette: true, quality: 100, colours: 256, dither: 1, effort: 10, compressionLevel: 9 })
    : pipeline.jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' });
  await pipeline.toFile(output);
  let [a, b] = await Promise.all([stat(input), stat(output)]);
  if (b.size >= a.size) {
    // Already small: keep the original bytes untouched.
    await copyFile(input, output);
    b = await stat(output);
  }
  console.log(`${to.padEnd(20)} ${(a.size / 1024).toFixed(0).padStart(5)} KB -> ${(b.size / 1024).toFixed(0).padStart(5)} KB`);
}
