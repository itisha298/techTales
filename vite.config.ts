/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { offlineServiceWorker } from './scripts/offline-sw-plugin.ts';
import { contentValidation } from './scripts/content-plugin.ts';

// Relative base so the build works from any sub-path (GitHub Pages project
// sites), from Vercel/Netlify roots, and when opened from a local server.
// Scenes use URL hashes, so no server-side rewrites are required.
export default defineConfig({
  base: './',
  plugins: [contentValidation(), react(), tailwindcss(), offlineServiceWorker()],
  // One self-contained deck (~155 kB gzipped), served locally and cached offline:
  // a single chunk is intentional, so the default 500 kB advisory is raised.
  build: { chunkSizeWarningLimit: 700 },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    // Worker threads start reliably on locked-down Windows laptops (forks can time out).
    pool: 'threads',
  },
});
