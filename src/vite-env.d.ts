/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "false" disables the offline service worker for this build (see DEPLOYMENT_GUIDE.md). */
  readonly VITE_OFFLINE?: string;
}
