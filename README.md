# Meridian Telecom: A New Prime Meridian

*One brand, one platform, and every customer carried across by June 2027*, presented by **Meridian Wizards**.

This is an interactive web presentation for an executive client conversation, and it replaces a conventional slide deck. It has:

- ten full-screen scenes with continuous ambient motion;
- presenter notes, a timer and rehearsal mode;
- optional syncing between an audience window and a presenter window;
- keyboard control.

It runs entirely offline once built.

> Hypothetical scenarios, figures and dates for illustrative discussion.

## Technology

- React 19, TypeScript and Vite
- Tailwind CSS v4
- Framer Motion for all scene transitions and animation
- Lucide React icons
- The Manrope variable font, bundled locally (no font CDN)
- **Editable content in JSON** (`src/content/editable/`), validated at build time
- Local static data only: no backend, no external APIs, no external images
- Vitest + Testing Library for unit and component tests, and Playwright for end-to-end tests

## Install and run

Requires Node.js **22.18 or newer**.

```bash
npm install
npm run dev        # development server → http://localhost:5173
npm run build      # content validation + type-check + production build into dist/
npm run preview    # serve the production build → http://localhost:4173
```

To present, use `npm run present`. It builds, then serves on the fixed port **4173** and opens the browser. See [PRESENTATION_GUIDE.md](PRESENTATION_GUIDE.md).

## Editing content

All frequently edited content lives in five JSON files. Team members edit them on the GitHub website through pull requests; see [TEAM_CONTENT_EDITING_GUIDE.md](TEAM_CONTENT_EDITING_GUIDE.md).

```text
src/content/editable/
  presentation.json   titles, on-screen statements, buttons, Q&A text, footer, settings, scene timings
  chapters.json       the four chapters
  team.json           names, roles, photos and crops
  metrics.json        every displayed figure
  speakerNotes.json   presenter-only notes and word-for-word speeches
```

How the content is checked and loaded:

- **Schema:** `src/content/schema.ts` defines what each file must contain and runs the validation. Validation runs:
  - in `npm run build`, which fails with readable errors;
  - in `npm run dev`, where errors appear in the browser overlay;
  - via `npm run validate:content`;
  - in CI.
- **Adapters:** `src/content/presentationContent.ts`, `src/content/speakerNotes.ts` and `src/data/team.ts` turn the JSON into the typed objects the components use. No component reads JSON directly.

## Quality commands

| Command | What it does |
| --- | --- |
| `npm run validate:content` | Checks the editable JSON. It catches invalid JSON, missing fields, unknown speakers or scenes, duplicate ids, missing images, over-long text, unknown placeholders and timing totals |
| `npm run lint` | ESLint (TypeScript + React hooks rules) |
| `npm run typecheck` | `tsc -b` across app, config, scripts and tests |
| `npm test` | Vitest: navigation, content fidelity and validation, roles, notes, overlays, sync, rehearsal, image fallback |
| `npm run test:e2e` | Playwright against the production build: every scene, wheel, touch, refresh, fullscreen, photos, team layout, continuous animation, window sync, offline |
| `npm run check` | validate:content + lint + typecheck + unit tests + build |

Playwright uses the locally installed Chrome by default. For Edge, set `PW_CHANNEL=msedge`. For bundled Chromium (as in CI), run `npx playwright install chromium` and then `PW_CHANNEL=chromium npm run test:e2e`. `PW_SOAK=1` adds a two-minute stability test.

## Deployment

The supported route is a **private GitHub repository connected to Vercel**:

- every pull request gets a protected **preview**;
- merges to `main` update **production**;
- **Vercel Authentication** protects all deployments.

Step-by-step: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

- `.github/workflows/ci.yml` validates every pull request: content, types, lint, unit tests, build and end-to-end tests.
- `vercel.json` sets the build and output directory, `noindex`, security headers and caching.
- URL hashes (`#value`, `#june-28`…) keep refreshes on the same scene. No rewrites are needed.
- The previous GitHub Pages workflow is disabled and kept in `docs/optional/`, because Pages sites from private repositories are publicly reachable on most plans. See DEPLOYMENT_GUIDE §9.
- Set `VITE_OFFLINE=false` to build without offline caching (recommended consideration for hosted copies; see DEPLOYMENT_GUIDE §5).

## Project structure

```text
source-assets/              Original speech document and photographs (inputs, not served)
scripts/
  extract_docx.py           DOCX → text extraction (stdlib XML parsing)
  build_speaker_notes.py    Refreshes the verbatim speeches in speakerNotes.json from the DOCX
  optimize-team-images.mjs  Resizes/re-encodes photos into public/team/ (npm run images)
  extract-opening-artwork.mjs  Crops the opening globe artwork to WebP (npm run images:opening)
  validate-content.ts       npm run validate:content
  content-plugin.ts         Build/dev-time content validation (Vite plugin)
  offline-sw-plugin.ts      Generates the offline service worker at build time
public/
  team/                     Optimized, URL-safe team photographs
  images/                   Opening artwork (original mock-up + extracted WebP)
src/
  content/
    editable/*.json         Editable content (see above)
    schema.ts               Schema, placeholders, validation
    presentationContent.ts  Adapter: audience copy, settings, scenes, timing
    speakerNotes.ts         Adapter: presenter-only notes
    contentWarnings.md      Source inconsistencies and how each was handled
  data/team.ts              Adapter: team members
  theme/tokens.ts           Colours, easing, durations, navigation tuning
  scenes/                   One component per scene + registry
  components/               Rail, dialogs, notes, toolbar, rehearsal, portraits, ambient motion
  hooks/  lib/              Deck state, gestures, timers, sync, motion helpers
  test/                     Vitest suites
tests/e2e/                  Playwright suites
.github/                    CI workflow and pull-request template
```

## Further reading

- [PRESENTATION_GUIDE.md](PRESENTATION_GUIDE.md): running the session
- [TEAM_CONTENT_EDITING_GUIDE.md](TEAM_CONTENT_EDITING_GUIDE.md): editing content on GitHub (non-technical)
- [CONTENT_EDITING_GUIDE.md](CONTENT_EDITING_GUIDE.md): developer reference for content, photos and theme
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md): GitHub + Vercel setup, access protection, publishing
- [SOURCE_VERIFICATION.md](SOURCE_VERIFICATION.md): every on-screen claim traced to the source
- [src/content/contentWarnings.md](src/content/contentWarnings.md): open content decisions
