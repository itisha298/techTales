import { defineConfig } from '@playwright/test';

/**
 * End-to-end checks against the production build.
 * Uses the locally installed Chrome by default (no browser download needed).
 * Set PW_CHANNEL=msedge for Edge, or PW_CHANNEL=chromium after `npx playwright install chromium`.
 */
const channel = process.env.PW_CHANNEL ?? 'chrome';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    ...(channel === 'chromium' ? {} : { channel }),
    viewport: { width: 1366, height: 768 },
    // Service workers are exercised in offline.spec.ts only; elsewhere they would
    // bypass page.route() and make network-dependent tests nondeterministic.
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
