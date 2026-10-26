# Content editing guide (developer reference)

Team members who don't code should use **[TEAM_CONTENT_EDITING_GUIDE.md](TEAM_CONTENT_EDITING_GUIDE.md)**, which covers editing on the GitHub website. This page is the technical reference.

## Where content lives

| What | File |
| --- | --- |
| Titles, on-screen statements, buttons, Q&A text, footer, settings, scene labels and timings | `src/content/editable/presentation.json` |
| The four chapters | `src/content/editable/chapters.json` |
| Names, roles, photos, crops, introductions | `src/content/editable/team.json` |
| Every displayed figure | `src/content/editable/metrics.json` |
| Speeches (verbatim), delivery tips, pauses, handovers, scene cues | `src/content/editable/speakerNotes.json` |
| Schema, placeholders, validation rules, fixed scene structure | `src/content/schema.ts` |
| Colours, motion timing, wheel/swipe sensitivity | `src/theme/tokens.ts` + `src/index.css` |
| Open source issues | `src/content/contentWarnings.md` |

Components never import JSON. Three adapters read the JSON and keep the original typed exports:

- `src/content/presentationContent.ts`
- `src/content/speakerNotes.ts`
- `src/data/team.ts`

**Validation.** `src/content/schema.ts` runs during `npm run build` and `npm run dev` (through `scripts/content-plugin.ts`), via `npm run validate:content`, and in CI. It checks:

- valid JSON, required fields and value types;
- speaker ids (`mayank`, `sushant`, `neeti`, `suryakanta`, `aryama`), scene ids and chapter ids;
- duplicate ids;
- that image files exist under `public/`;
- list lengths the layouts depend on;
- unknown placeholders;
- text length: headlines up to 16 words, other audience text up to 40 words or 260 characters;
- that scene timings total 20:00.

Misspelt field names produce warnings. Fields starting with `_` (for example `_help`) are ignored.

After any change, run `npm run check` (and `npm run test:e2e` before presenting). Before changing a figure or claim, check it against `source-assets/Meridian_4_Topics_Speeches.docx` and update `SOURCE_VERIFICATION.md`.

## Placeholders

Strings may contain `{goLive}`, `{assessmentDuration}`, `{proofOfConceptDuration}`, `{teamName}`, `{brand}`, `{client}`, `{tom}` and `{john}`. Their values come from `settings`, `experience` and `client` in `presentation.json`. A capitalised placeholder (`{ProofOfConceptDuration}`) capitalises the value's first letter.

## Names and roles

Edit `team.json`. `id` is fixed and must stay one of the five speaker ids. `imageAlt` is optional; it defaults to "Portrait of {name}, {role}".

The roles currently shown were provided by the team, and differ from the wording in the speech document. The speeches themselves are untouched; see `SOURCE_VERIFICATION.md`.

The source spells "Suryakant"; the UI uses "Suryakanta Das" from `team.json`. The client stakeholders' first names are `client.tom` and `client.john` in `presentation.json`.

## Photographs

1. Put the original in `source-assets/`.
2. Add or adjust its line in `scripts/optimize-team-images.mjs`, then run `npm run images`. This resizes to 900 px and re-encodes into `public/team/`; it never retouches the photo.
3. Point `image` in `team.json` at the file, e.g. `team/neeti-bourai.jpg`.
4. Tune the crop:
   - `objectPosition` for the team screen's 4:5 frames;
   - `objectPositionTight` for the round and square thumbnails.

### Opening artwork

The source is `public/images/meridian-opening.png.png`, kept untouched. Note the double `.png` extension, which is the name it arrived with; the script also accepts `meridian-opening.png`.

`npm run images:opening` crops the clean globe region (no baked-in text) into `public/images/meridian-opening-globe.webp`. The crop rectangle and the overlay coordinates are documented in:

- `scripts/extract-opening-artwork.mjs`
- the static image is used as-is in `src/scenes/OpeningScene.tsx`; the homepage has no animation layers over it, by design

If you supply a new mock-up, update the crop rectangle and re-check the overlay alignment.

## Chapters and scenes

`chapters.json` holds four chapters. Their ids are fixed: `context`, `innovation`, `value`, `why-accenture`.

`presentation.json → scenes` gives each scene its:

- navigation and rail labels;
- speaker (and per-build `stepSpeakers` on two-build scenes);
- `plannedSeconds`.

Scene **order**, URL hashes, chapter grouping and build counts are tied to the components. They live in `SCENE_STRUCTURE` in `schema.ts`; changing them needs code changes.

## Metrics

`metrics.json` sections and where they appear:

| Section | Shown on |
| --- | --- |
| `revenueExposure` | Context (the $3.54 billion "Up to …" figure) |
| `comparableEstate`, `discoveryGap` | The hidden-rule challenge |
| `proofOfConcept`, `discoveryResult` | AI-led discovery |
| `comparableTransformation` | The value story |

Numeric `value`s count up on screen. Bar lengths follow the `weeks` values.

Keep the $3.54 billion labelled as *potential* exposure.

## Assessment duration

`presentation.json → settings.assessmentDuration` (currently `"two-week"`) feeds every on-screen mention of the assessment. Write it as it reads in a sentence, e.g. `"four-week"`.

The proof of concept has its own value, `proofOfConceptDuration`. The speeches are verbatim and will not update automatically, so brief the speakers.

## Speaker notes

`speakerNotes.json` has three sections:

- **`speeches`:** verbatim paragraphs, each tagged with the `scene` it is delivered on.
- **`speakerPlans`:** duration, pauses, handover line and next speaker.
- **`sceneCues`:** presenter-only operating cues and timing guidance.

`python -I scripts/build_speaker_notes.py` (after `npm run extract`) regenerates `speeches` from the DOCX. It keeps `speakerPlans` and `sceneCues`, and it reproduces the current file exactly.

## Disclaimer

`presentation.json → experience.disclaimer`. It appears in the bottom rail of every scene and in the assessment panel.

## Theme colours

Colours are defined twice, and the two must match:

1. `src/theme/tokens.ts`, used by TypeScript (SVG illustrations).
2. `src/index.css`, inside `@theme` (`--color-purple`, `--color-deep`…), used by Tailwind classes.

Change both together. `--color-warning-ink` is a darker amber used only for warning text, so that it passes contrast checks.

## Fonts and type size

Manrope is bundled from `@fontsource-variable/manrope`. The type scale is in `src/index.css` (`.t-display`, `.t-headline`, `.t-lead`, `.t-body`…). Sizes scale with the screen and are tuned for 1920×1080 down to 1366×768.
