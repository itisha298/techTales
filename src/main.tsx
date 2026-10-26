import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import './index.css';

// Offline resilience for the production build: a generated service worker
// precaches the whole app. Only on secure origins (https or localhost).
// Set VITE_OFFLINE=false at build time (e.g. as a Vercel environment variable)
// to disable it for a hosted copy: existing registrations and caches are then
// removed from viewers' devices, so revoking someone's access also stops
// offline viewing of a previously cached copy.
const offlineEnabled = import.meta.env.VITE_OFFLINE !== 'false';
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    if (offlineEnabled) {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // Registration can be blocked by policy; the deck still works normally.
      });
    } else {
      void navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => void r.unregister()));
      void caches?.keys().then((keys) => keys.filter((k) => k.startsWith('meridian-')).forEach((k) => void caches.delete(k)));
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
