# Content warnings: source issues that were normalized or remain open

Source: `source-assets/Meridian_4_Topics_Speeches.docx`

Nothing in the source was silently rewritten. Each normalization is listed here, and each open item needs a decision from the team.

## 1. Assessment length is inconsistent (open, needs a decision)

- Neeti's speech recommends "a focused **two-week** assessment".
- Suryakant's speech says "agree on **a short assessment window**".
- The document's own notes say that earlier plans assumed **four weeks**, and ask the team to "agree one length so all four speakers match".

**Handling:** every on-screen reference reads `settings.assessmentDuration` in `src/content/editable/presentation.json`, which is currently `"two-week"`. To change the length, edit that one value. The speeches in `speakerNotes.json` are verbatim, so if the length changes, brief the speakers too.

**Related:** the **two-week proof of concept** (Sushant: Daniel's story, and the proposed PoC on a sample of Meridian's estate) is a different activity from the **initial assessment**. It has its own setting, `settings.proofOfConceptDuration`.

## 2. Name spelling: "Suryakant" or "Suryakanta Das" (open)

- The speech document says "Suryakant".
- The supplied photograph is named "Suryakanta Das", and the name badge in the photo reads "SURYAKANTA".

**Handling:** the UI shows **Suryakanta Das**, set once in `src/content/editable/team.json`. The presenter notes keep the source spelling "Suryakant" verbatim.

## 3. "June-27" is shown as "June 2027" (normalized)

The source writes the go-live as "June-27", which could be read as 27 June. The subtitle and Sushant's speech both say "June 2027", so the screen uses **June 2027** (`settings.goLive`). The speeches in the presenter notes keep "June-27" verbatim.

## 4. "June 28" is ambiguous (open)

Neeti asks: "can Meridian use June-27 to change what becomes possible on June-28?" If "June-27" means June 2027, then "June-28" could mean June 2028 rather than the day after go-live.

**Handling:** the chapter title stays "The Real Question Is June 28". The June 28 scene presents it as a **future-state idea** ("what becomes possible the day after"), as the brief asked. It is not shown as a contractual or planned date. Confirm the intended meaning with Neeti.

## 5. Client stakeholder names (open)

The document's notes say the names were aligned to **Tom and John**, and that Neeti's and Suryakant's original speeches used "Sachin" and "Jennie". The UI shows Tom and John only in the context scene. To change them, edit `client.tom` and `client.john` in `src/content/editable/presentation.json`.

## 6. Aryama has no scripted speech (open)

The source gives Aryama a role (Mayank: "make sure we leave plenty of room for your questions and concerns") but no speech. The Q&A notes do not invent a script; they only include operating cues.

## 7. Team scene has no source speech

The "Meet the team" scene was requested in the build brief and has no speech in the source. Its introductions come from how each person is introduced in Mayank's agenda paragraph.

## 8. Agenda order

Mayank's speech gives the context first and the agenda second. The scene order shows the journey (agenda) first. The notes tag each paragraph with the scene it belongs to. Either delivery order works.

## 9. All scenarios, figures and dates are hypothetical

The document states: "All scenarios, figures and dates in the stories are hypothetical and illustrative." The footer shows the disclaimer on every scene: *Hypothetical scenarios, figures and dates for illustrative discussion.*

## 10. Illustrative code fragments

The hidden-rule scene shows short, deliberately unreadable code-like fragments to suggest a legacy estate. They are labelled "Illustrative fragment" and make no claims. The one rule that is decoded on screen, the undocumented discount that would have mispriced 50,000 customers, comes from Sushant's speech.

## 11. Speaker roles are team-provided

The roles shown on screen (Meridian CAL; ATCI Delivery and Innovation Lead; Delivery Manager; CMT Market Lead; Senior Delivery Manager) were supplied by the team. They differ from the speech document, which says "Client Account Lead (CAL)", "Delivery & Innovation Lead", "leads a peer telco program", "Market Lead" and "Client Engagement Lead". The verbatim speeches in the presenter notes keep the source wording, so speakers may want to align what they say aloud with the roles on screen. Roles are edited in `src/content/editable/team.json`.

## 12. Where these settings now live

Editable content moved to `src/content/editable/*.json`:

- assessment duration: `presentation.json → settings`
- client names: `presentation.json → client`
- speaker name spelling: `team.json`
- June 28 copy: `presentation.json → screens.june28`
