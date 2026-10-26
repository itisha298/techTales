import { createHash } from 'node:crypto';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/** Lists files under public/ as URL paths relative to the site root. */
function publicFiles(dir: string, base = ''): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    return statSync(full).isDirectory() ? publicFiles(full, rel) : [rel];
  });
}

/**
 * Emits dist/sw.js at build time: precaches the whole built app (HTML, JS,
 * CSS, fonts, photographs) so the presentation keeps working, including on
 * refresh, without a network or after the local server has stopped.
 *
 * - Navigations are network-first (edits show immediately when online),
 *   falling back to the cached app shell when offline.
 * - Everything else is cache-first.
 * - The cache name is a hash of the file list, so every build replaces the
 *   previous cache cleanly.
 */
export function offlineServiceWorker(): Plugin {
  return {
    name: 'meridian-offline-sw',
    apply: 'build',
    generateBundle(_options, bundle) {
      const built = Object.keys(bundle).filter((f) => f !== 'sw.js');
      // Skip dotfiles, the worker itself, and original source images that are never displayed
      // (e.g. the 1.9 MB opening mock-up; only its extracted WebP is used).
      const statics = publicFiles(path.resolve('public')).filter(
        (f) => !f.startsWith('.') && f !== 'sw.js' && !/^images\/meridian-opening\.png(\.png)?$/.test(f),
      );
      const files = ['./', ...[...new Set([...built, ...statics])].sort().map((f) => `./${f}`)];
      const version = createHash('sha256').update(files.join('|')).digest('hex').slice(0, 12);
      const source = `/* Generated at build time by scripts/offline-sw-plugin.ts. Do not edit. */
const CACHE = 'meridian-${version}';
const PRECACHE = ${JSON.stringify(files, null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('meridian-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Only cache a real page: never a login screen, redirect or error
          // (e.g. Vercel Authentication challenges unauthenticated visitors).
          if (res.ok && !res.redirected && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put('./', copy));
          }
          return res;
        })
        .catch(() => caches.match('./', { ignoreSearch: true })),
    );
    return;
  }
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}
