# Source verification

**Source:** `source-assets/Meridian_4_Topics_Speeches.docx` (extracted with `scripts/extract_docx.py`)
**Scope:** every audience-visible title, figure, speaker, role and claim
**Review date:** 26 October 2026

The document itself says: *"All scenarios, figures and dates in the stories are hypothetical and illustrative."* The footer of every scene shows: **Hypothetical scenarios, figures and dates for illustrative discussion.**

## Global checks

| Check | Result |
| --- | --- |
| No metric, percentage, financial benefit, customer count or date added beyond the source | ✅ Every number on screen is listed below with its source sentence. |
| $3.54 billion described as potential exposure | ✅ Labelled "Potential revenue exposure" and "Up to …", with "At risk if any gap opens from prospect to cash. Based on the figures provided; not a forecast of loss." |
| AI remains human-governed | ✅ The flow ends at "07 · Experts decide / Human review". The scene also shows "Experts accepted, edited or rejected every draft" and "The AI decided nothing…". |
| Two-week proof of concept kept distinct from the initial assessment | ✅ The proof of concept appears only on the innovation scenes, labelled "comparable story" or "Proposed for Meridian". The assessment appears only on scenes 8 and 10. They use separate settings (`proofOfConceptDuration` and `assessmentDuration`). |
| Visible go-live date is June 2027 | ✅ "June-27" never appears on screen; a test enforces this. |
| June 28 presented as a future-state idea, not a contractual date | ✅ Shown as "The day after" and "The next chapter". It is never given as a date. |
| Disclaimer visible | ✅ Bottom rail on every scene, and in the assessment panel. |
| Team names and roles match the configured team data | ✅ Every portrait, badge and caption reads from `src/content/editable/team.json` (via `src/data/team.ts`). |
| Speaker roles | ⚠️ **Team-provided, not from the source.** The roles were supplied by the team (Meridian CAL; ATCI Delivery and Innovation Lead; Delivery Manager; CMT Market Lead; Senior Delivery Manager) and differ from the speech document's wording. The verbatim speeches still use the source wording. |
| Audience UI does not expose full speeches | ✅ Speeches appear only in the presenter notes panel (press N). A test checks that no speech paragraph appears in the audience content. |
| Visual consistency | ✅ All scenes share the same tokens, type scale, eyebrow, rail and speaker badge. Layout checked at 1920×1080, 1600×900, 1366×768, 1280×720, 1024×768, 768×1024 and 390×844. |

## Scene by scene

### 1 · Opening (`#opening`)
**Source section:** Titles and subtitles · Topic 1

| On screen | Source |
| --- | --- |
| "Meridian Telecom" | Document header "MERIDIAN TELECOM · A NEW PRIME MERIDIAN" |
| "A New Prime Meridian" | Topic 1 title (verbatim) |
| "One brand, one platform, and every customer carried across by June 2027" | Topic 1 subtitle (verbatim) |
| "Executive conversation", "Enter experience", "0° 00′ 00″" | Interface labels and decoration. These make no claims. |
| "Presented by · Meridian Wizards" | The team's own name (team-provided branding, not a source claim) |
| Globe-and-network artwork | Cropped from the supplied mock-up `public/images/meridian-opening.png.png`. Only the image region is used; none of the mock-up's baked-in text, buttons or labels ("A connected tomorrow", "People · Platform · Possibilities · Together", page counter) appears on screen. |

### 2 · The journey (`#journey`)
**Source section:** The plan at a glance; Mayank's agenda paragraph

| On screen | Source |
| --- | --- |
| "How we will use the time" | "Here is how we will use the time." |
| "Four chapters. One simple next step." | Four topics in the plan, and "one simple next step" |
| Chapter titles 01–04 | Plan at a glance (verbatim) |
| Speaker name and **role** under each chapter | Roles are team-provided (see Global checks). Speaking durations from the plan are no longer shown on this audience screen; they remain in the presenter notes, the overview, the rehearsal panel and the guide. |
| 01 outcome: "Why the next six months decide whether customer trust carries over." | *Shortened* from "Over the next six months … that trust either carries over or it is at risk." |
| 02 outcome: "The tools do the reading. Your experts do the judging." | Sushant (verbatim) |
| 03 outcome: "Validate early, learn quickly and scale with confidence." | Neeti (verbatim) |
| 04 outcome: "Expose the risks and validate the plan before committing to the detailed roadmap." | *Shortened* from the Topic 4 subtitle and "before we commit to the detailed execution roadmap" |
| "Then · Your questions · Aryama Dey · Q&A and discussion" | "Aryama … will make sure we leave plenty of room for your questions and concerns." |
| "The next step we hope to agree: an initial assessment with you and your key stakeholders." | *Shortened* from Mayank's closing paragraph |

### 3 · Context and stakes (`#context`) · Mayank Jain
**Source section:** Topic 1 speech

| On screen | Source |
| --- | --- |
| "Protect the trust already earned." | Headline from the brief. It condenses "Meridian has spent years earning its customers' trust … that trust either carries over or it is at risk." |
| "Over the next six months, as mobility moves into the EGW sub-brand, that trust either carries over or it is at risk." | Verbatim |
| "Roughly six months", "June 2027", "Go-live · contractual commitment" | "roughly six months, with a contractual commitment to be live by June-27" (normalized to June 2027) |
| "Corporate mobile brand retires / All mobility moves into the EGW sub-brand" | "retiring its corporate mobile brand and moving all mobility into the EGW sub-brand" |
| "A new Salesforce platform / CRM, assisted ordering and self-service, built from the ground up" | "a brand-new Salesforce platform for CRM, assisted ordering and self-service has to be built from the ground up" |
| "Integrated with the estate / Siebel · Oracle · BRM" | "integrated with Siebel, Oracle and BRM" |
| "Up to $3.54 billion · Potential revenue exposure" | "up to $3.54 billion of revenue at risk" (Mayank); "Based on the figures provided, up to $3.54 billion in revenue is exposed" (Neeti) |
| "At risk if any gap opens from prospect to cash. Based on the figures provided; not a forecast of loss." | "Any gap from prospect to cash means … up to $3.54 billion of revenue at risk." "Not a forecast of loss" was **added as a qualifier**, as the brief required, so the figure is not read as a guaranteed loss. |
| "John's priority · Zero disruption · Green SLAs across every vendor" | "John, I know your priority is a transformation with zero disruption and green SLAs across every vendor." |
| "Tom's priority · A next-gen platform · Aligned to Meridian's future business model" | "Tom, yours is a next-gen platform that is aligned to Meridian's future business model." |

The timeline has unlabelled monthly ticks only. No interim dates or milestones are implied.

### 4 · Meet the Meridian Wizards (`#team`)
**Source section:** Mayank's agenda paragraph; plan at a glance

| On screen | Source |
| --- | --- |
| Heading "Meet the Meridian Wizards" and subtitle "The minds behind the transformation." | Team-provided branding (not a source claim) |
| Mayank Jain, Meridian CAL | Source: "Mayank, Client Account Lead (CAL)"; displayed role team-provided |
| Sushant, ATCI Delivery and Innovation Lead (role team-provided); "Shows how AI-led delivery with GenWizard and myWizard can de-risk and accelerate the program." | "Sushant, our Delivery & Innovation Lead, who will show how AI-led delivery with GenWizard and myWizard can de-risk and accelerate this program" |
| Neeti Bourai, Delivery Manager (role team-provided); "Leads a peer telco program and shares how a very similar challenge was solved." | "Neeti, who leads a peer telco program, will share a real story of how we solved a very similar challenge" |
| Suryakanta Das, CMT Market Lead (role team-provided); "Brings it together: why Accenture, and why now." | "Suryakant, our Market Lead, will then bring it together: why Accenture, and why now" |
| Aryama Dey, Senior Delivery Manager (role team-provided); "Facilitates the discussion and makes room for your questions and concerns." | "Aryama, our Client Engagement Lead, will make sure we leave plenty of room for your questions and concerns" |
| Mayank: "Opens the conversation: what is at stake, and what matters most to Meridian." | Topic 1 sub-topics ("the $3.54 billion at stake", "What matters to Tom and John") |
| Surnames | From the supplied photograph filenames (not in the speech document) |

### 5 · The hidden-rule challenge (`#innovation-challenge`) · Sushant
**Source section:** Topic 2 speech, Daniel's story

| On screen | Source |
| --- | --- |
| "Every legacy estate has rules no one remembers writing." | Headline from the brief. Adapted from "Every Siebel estate has a ghost: a rule nobody remembers writing". |
| "Every week spent working out what the old system does is a week taken from building and testing the new one." | Verbatim |
| "A comparable story · Large Asia-Pacific mobile operator" | "a large Asia-Pacific mobile operator". Daniel is not named on screen. |
| "1,400 order workflows", "600 pricing rules" | "His estate held 1,400 order workflows and 600 pricing rules" |
| "26 weeks to replace Siebel ordering and care with Salesforce. Three vendors." | "26 weeks to replace his Siebel-based ordering and care front end with Salesforce", "run by three vendors" |
| "Weeks the workshops needed · 12", "Weeks planned for requirements · 5", "7 weeks that did not exist" | "The plan allowed five weeks for requirements; the workshops needed twelve … seven weeks that did not exist." |
| "An undocumented discount, found by accident in week three / Would have mispriced 50,000 customers" | "in week three, a billing analyst found, by accident, an undocumented discount that would have mispriced 50,000 customers" |
| Code fragment and faint labels (`DISC_07`, `wf_order_validate_v3` …) | **Illustrative only**, labelled "Illustrative fragment". They make no claims. |

### 6 · AI-led discovery (`#innovation-solution`) · Sushant
**Source section:** Topic 2 speech, the innovation and the result

| On screen | Source |
| --- | --- |
| "GenWizard · myWizard" | Topic 2 subtitle |
| "The tools do the reading. Your experts do the judging." | Verbatim |
| Flow: Siebel and BRM configuration → GenWizard analysis → Plain-language rule → Source traceability → Proposed Salesforce configuration → Test case → Human review | "GenWizard read the Siebel and BRM configuration and drafted each rule in plain business language, linked to its exact source, with a proposed Salesforce configuration and test cases. His experts accepted, edited or rejected every draft." |
| "Accept · Edit · Reject", "Experts accepted, edited or rejected every draft." | As above |
| "The AI decided nothing. The operator's own Siebel architect chose which rules to keep, change or retire." | "The AI decided nothing: Daniel's own Siebel architect chose which rules to keep, change or retire." |
| "Two-week proof of concept · comparable story", "150 workflows", "60 rate plans" | "a two-week proof of concept, inside his secure environment, on 150 workflows and 60 rate plans" |
| "8 in 10 drafts accepted with light edits" | "Eight in ten drafts were accepted with light edits." |
| "Five weeks, not twelve." with 12 wk and 5 wk bars | "Discovery took five weeks, not twelve" |
| "Hidden rules surfaced in month one instead of at user testing." | Verbatim |
| "myWizard · One control tower across all three vendors" | "myWizard put all three vendors on one control tower" |
| "Proposed for Meridian: a two-week proof of concept on a sample of the estate, inside your environment." | "start with a two-week proof of concept on a sample of Meridian's estate, inside your environment" |

### 7 · The value story (`#value`) · Neeti Bourai
**Source section:** Topic 3 speech

| On screen | Source |
| --- | --- |
| "Do not make customers choose between continuity and progress." | Headline from the brief. Condenses "without asking customers to choose between continuity today and a better digital experience tomorrow". |
| "One digitally enabled prospect-to-cash experience" | Verbatim |
| Layers: Customer journeys, Releases, Dependencies, Migration, Quality, SLA risk | "a common view across customer journeys, releases, dependencies, migration, quality and SLA risk" |
| "One transformation control tower · a common view" | "a transformation control tower that provides a common view" |
| "A comparable Salesforce transformation · 1,000+ users · APAC · EMEA · US · 16-week progressive releases · 18-month rollout" | "more than 1,000 users across APAC, EMEA and the US, using 16-week progressive releases across an 18-month rollout" |
| "Validate early, learn quickly and scale with confidence." | Verbatim |
| Value 360: Client Value · Technology and Innovation · Talent and People · Sustainability | "Value 360 across Client Value, Technology & Innovation, Talent/People and Sustainability" (punctuation normalized) |

### 8 · June 28 (`#june-28`) · Neeti Bourai
**Source section:** Topic 3 speech, the second question

| On screen | Source |
| --- | --- |
| "The Real Question Is June 28" | Topic 3 title (verbatim) |
| "June 2027 · Go-live" | "go live by June-27" (normalized) |
| "The question is not only whether Meridian can go live by June 2027." | Wording from the brief. Source: "The question isn't whether Meridian can go live by June-27." |
| "The real question is what becomes possible the day after." | Wording from the brief. Source: "can Meridian use June-27 to change what becomes possible on June-28?" |
| Customers protected · Employees empowered · Risks controlled | "reaching June-28 with customers protected, employees empowered, risks under control" ("under control" shortened to "controlled") |
| Digital self-service expanded · A scalable platform · Future innovation enabled | "expanding digital self-service, and establishing a scalable platform for future innovation" |
| "The next chapter" | "Meridian's next chapter of growth" |
| "Let's prove what matters most, early." | Verbatim |

### 9 · Why Accenture and the initial assessment (`#assessment`) · Suryakanta Das
**Source section:** Topic 4 speech, plus Neeti's recommendation

| On screen | Source |
| --- | --- |
| "Why Accenture, and why now" | Topic 4 name |
| "Chart the course before you sail." | Topic 4 title |
| "Transition all mobility operations into the EGW brand within six months, while protecting customer relationships, maintaining service continuity and building a platform for future growth." | *Lightly shortened* from "our commitment is simple: help you on transition of all mobility operations into the EGW … brand within six months, while protecting customer relationships, maintaining service continuity, and building a platform for future growth" |
| Execution discipline · Structured governance · Integration focus · Collaborative delivery | "the execution discipline, structured governance, integration focus, and collaborative delivery approach" |
| "A focused two-week initial assessment" | "focused initial assessment" (Suryakant) plus "focused two-week assessment" (Neeti). Length comes from `settings.assessmentDuration`. |
| 1 Align the scope · 2 Nominate stakeholders | "align on the assessment scope, nominate the right business and technology stakeholders" |
| 3 Identify critical journeys | Neeti: "Identify the critical journeys and dependencies" |
| 4 Validate assumptions · 5 Expose dependencies and risks | "validate the critical assumptions, expose the key risks early"; "a prioritized view of the risks and dependencies" |
| 6 Define the early-validation release | Neeti: "select the first early-validation release" |
| 7 Produce the high-level roadmap | "a high-level delivery roadmap" |
| "A controlled, evidence-based path to the six-month ambition." | "a realistic, evidence-based path to achieving the six-month ambition"; "a controlled and measurable transformation" |

### 10 · Executive ask and Q&A (`#qa`) · Suryakanta Das asks; Aryama Dey facilitates
**Source section:** Topic 4 speech, the ask and the assessment outputs

| On screen | Source |
| --- | --- |
| "Would you be comfortable sponsoring the initial assessment?" | *Shortened* from "Would you be comfortable sponsoring this initial assessment so that we can validate the critical assumptions, expose the key risks early, and establish the strongest possible foundation…?" |
| Prioritized risks and dependencies · Validated planning assumptions | "a prioritized view of the risks and dependencies, a validated set of planning assumptions" |
| A clear immediate roadmap | *Merged and shortened* (wording from the brief) from "a high-level delivery roadmap, and clear recommendations on the immediate next steps" |
| Q&A: "Let's discuss what matters most to Meridian." | Wording from the brief. It reflects Aryama's role in the source. |
| Assessment panel: purpose | "identify the critical risks early, validate the key assumptions, and give you a realistic, evidence-based path" |
| Assessment panel: Business · Architecture · Security · Data · Operations · Delivery · Key vendors | Neeti: "Bring together business, architecture, security, data, operations, delivery and key vendors." |
| Assessment panel: the four outputs | Suryakant, verbatim list |
| Assessment panel: Align scope · Nominate stakeholders · Agree the assessment window with clearly defined outputs | "align on the assessment scope, nominate the right business and technology stakeholders, and agree on a short assessment window with clearly defined outputs" |

## Unresolved source inconsistencies

These need a human decision. Details are in `src/content/contentWarnings.md`.

1. **Assessment length.** Neeti says two weeks, Suryakant says "a short assessment window", and earlier plans assumed four weeks. The screen uses `assessmentDuration: "two-week"`.
2. **Name spelling.** The document says "Suryakant"; the photograph filename and name badge say "Suryakanta Das". The UI uses Suryakanta Das.
3. **"June-28" meaning.** If "June-27" means June 2027, "June-28" may mean June 2028 rather than the day after go-live. The screen treats it as a future-state idea only.
4. **Client names.** The document notes that Tom and John replaced "Sachin" and "Jennie" in two speeches. Confirm the right names.
5. **Aryama** has no scripted speech in the source.
6. **Agenda placement.** Mayank's agenda paragraph is delivered on scene 2, ahead of the context paragraphs, whereas the source speech has it after them.
