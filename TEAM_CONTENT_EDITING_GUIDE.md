# Editing the presentation content: a guide for Meridian Wizards

This guide is for team members who want to change wording, roles, figures or photographs in the Meridian Telecom presentation. You only need a web browser and access to the private GitHub repository. You don't need to install anything, know React, or use Git commands.

> **The golden rule:** every change goes through a *pull request*. Nothing you edit reaches the live presentation until a teammate has reviewed it and it has been merged. If something goes wrong, the change can always be undone.

---

## 1. Before you start

You need:

1. **A GitHub account**, added to the private repository with **Write** access. Ask the repository owner if you can't see the repository.
2. **Access to the Vercel preview**, if you want to see your change before it goes live. The owner invites you; see `DEPLOYMENT_GUIDE.md` §6.

The repository is private and the presentation contains client material. Do not share screenshots, preview links or files outside the approved team.

---

## 2. Where the content lives

All editable content is in one folder:

```text
src/content/editable/
  presentation.json   ← titles, statements, buttons, Q&A text, settings, scene timings
  chapters.json       ← the four chapters: titles, descriptions, speakers
  team.json           ← names, roles, photos and photo crops
  metrics.json        ← every number shown on screen
  speakerNotes.json   ← presenter-only notes and the word-for-word speeches
```

Photographs are in `public/team/`.

**Don't edit any other folder.** Those files control how the presentation works, not what it says.

### What to edit, and where

| I want to change… | File | Field |
| --- | --- | --- |
| The presentation title on the first screen | `presentation.json` | `experience.title` (and `experience.documentTitle`, the browser tab) |
| The subtitle on the first screen | `presentation.json` | `experience.subtitle` |
| The team name (Meridian Wizards) | `presentation.json` | `experience.teamName` |
| The footer disclaimer | `presentation.json` | `experience.disclaimer` |
| A chapter title (journey screen and bottom bar) | `chapters.json` | `chapters[…].title` |
| A chapter's one-line description on the journey screen | `chapters.json` | `chapters[…].outcome` |
| The small purple label at the top of a chapter's scenes | `presentation.json` | `screens.challenge.eyebrow`, `screens.value.eyebrow`, `screens.june28.eyebrow`… |
| A scene's big headline | `presentation.json` | `screens.<scene>.headline` |
| A person's name or role | `team.json` | `members[…].name` / `members[…].role` |
| A team member's short introduction (team screen, large screens) | `team.json` | `members[…].shortIntroduction` |
| A number (e.g. 1,400 workflows) | `metrics.json` | the matching section, e.g. `comparableEstate` |
| The Q&A message | `presentation.json` | `screens.ask.qa.message` |
| The assessment length ("two-week") | `presentation.json` | `settings.assessmentDuration` |
| Presenter notes or delivery tips | `speakerNotes.json` | `sceneCues`, `speakerPlans`, `speeches` |
| How long a scene is planned to take | `presentation.json` | `scenes.<scene>.plannedSeconds` (all scenes must add up to 20:00) |

**Chapter titles appear in more than one place.** For example, "The Ghost in the Siebel Estate" is the chapter title in `chapters.json`, and it is also the small purple label on that chapter's scenes (`screens.challenge.eyebrow`). Search for the old text in both files and update each place you want changed.

---

## 3. Reading and editing JSON safely

The content files use a simple format called JSON. Text always sits inside "double quotes":

```json
{
  "id": "innovation",
  "number": "02",
  "title": "The Ghost in the Siebel Estate",
  "durationSeconds": 180
}
```

When editing:

- ✅ **Change only the text between the quotes on the right-hand side.**
- ✅ Keep the commas at the end of lines exactly as they are.
- ✅ Numbers have no quotes (`180`, not `"180"`).
- ❌ Don't change the names on the left (`"title"`, `"role"`…) or any `"id"` value.
- ❌ Don't delete brackets `{ } [ ]`.
- To put a quotation mark *inside* text, use curly quotes (“ ”) or the apostrophe ’ instead of a straight `"`.
- Fields called `"_help"` are notes for editors. They never appear on screen.

**Text in {curly braces} is filled in automatically.** For example, `{goLive}` becomes "June 2027" everywhere, and `{assessmentDuration}` becomes "two-week". Leave these as they are. If you need a different value, change the setting itself in `presentation.json` → `settings`.

**Keep it short.** Headlines can be at most **16 words** and other on-screen text at most **40 words**. The automatic check rejects anything longer, because it would be unreadable on a projector.

**Stay faithful to the source.** Figures and claims come from the speech document (see `SOURCE_VERIFICATION.md`). Don't change a number or a claim unless the content owner has approved it. The speeches in `speakerNotes.json` are word-for-word transcripts; don't reword them.

---

## 4. Worked example: change a chapter title

Say we want to rename chapter 2 from **"The Ghost in the Siebel Estate"** to **"The Ghost in the Legacy Estate"**.

### Step 1: Open the file

1. Go to the repository on **github.com**.
2. Click the folders in turn: **`src`** → **`content`** → **`editable`** → **`chapters.json`**.
3. Click the **pencil icon** (✏️ *Edit this file*) near the top-right of the file.

### Step 2: Make the change

4. Find the chapter: press **Ctrl+F** (Windows) or **Cmd+F** (Mac) inside the editor and search for `Siebel Estate`.
5. Change only the text inside the quotes:

   ```diff
   -    "title": "The Ghost in the Siebel Estate",
   +    "title": "The Ghost in the Legacy Estate",
   ```

6. To change the matching purple label on the chapter's scenes, also open `presentation.json` and update `screens.challenge.eyebrow` the same way (search for `Siebel Estate` again).

### Step 3: Propose the change on a new branch

7. Click the green **Commit changes…** button (top-right).
8. In the window that opens:
   - **Commit message:** describe the change, e.g. `Rename chapter 2 to "The Ghost in the Legacy Estate"`.
   - Choose **"Create a new branch for this commit and start a pull request"**.
   - Give the branch a short name, e.g. `chapter-2-title`.
9. Click **Propose changes**.

### Step 4: Open the pull request

10. GitHub shows the **Open a pull request** page. The description is pre-filled with a short checklist; fill it in.
11. If you have a second file to change (like `presentation.json` in step 6), edit it **on the same branch**: switch the branch selector (top-left, it says `main`) to `chapter-2-title`, open the file, and commit directly to that branch.
12. Click **Create pull request**.

### Step 5: Wait for the checks and the preview

13. Within a minute or two, two things appear on the pull request:
    - **Validate presentation**: an automatic check of your content. ✅ green means all good. ❌ red means something needs fixing (see §6).
    - **A comment from Vercel with a "Preview" link.** This is a private copy of the presentation with your change in it.
14. Open the **Preview** link (you may need to sign in to Vercel). Go to the scene you changed: press **O** for the overview, or use the arrow keys. Check it looks right.

### Step 6: Ask for review

15. On the right of the pull request, under **Reviewers**, pick a teammate.
16. The reviewer opens the preview, checks the change, and clicks **Review changes → Approve**.

### Step 7: Merge (publish)

17. Once approved and green, click **Merge pull request** → **Confirm merge**.
18. The live presentation updates automatically within a few minutes. Done!

---

## 5. Replacing a team photograph

Photos live in `public/team/`, with these exact file names:

| Person | File |
| --- | --- |
| Mayank Jain | `public/team/mayank-jain.png` |
| Sushant | `public/team/sushant.png` |
| Neeti Bourai | `public/team/neeti-bourai.jpg` |
| Suryakanta Das | `public/team/suryakanta-das.jpg` |
| Aryama Das | `public/team/aryama-das.jpg` |

**Prepare the photo first:**

- A head-and-shoulders portrait, ideally **portrait orientation** (taller than wide).
- About **900 pixels wide**, and under **500 KB** if possible.
- Use the **same file type** as the existing photo (`.png` or `.jpg`), or see "Using a new file name" below.
- Use the original photo. Don't use AI-altered or heavily filtered images.

**Upload it:**

1. In the repository, open **`public`** → **`team`**.
2. Click **Add file** → **Upload files**.
3. Rename your photo on your computer to the **exact** file name above (e.g. `neeti-bourai.jpg`), then drag it into the upload area. A file with the same name replaces the old one.
4. Under **Commit changes**, choose **"Create a new branch for this commit and start a pull request"**, name it (e.g. `new-photo-neeti`), and click **Propose changes**.
5. Continue from **Step 4** of the worked example above.

**Check the crop in the preview.** If the face is too high, low or off-centre, edit `team.json` for that person:

- `objectPosition`: the crop on the team screen, e.g. `"52% 18%"`. The first number moves the crop left or right; the second moves it up or down. A smaller second number shows more of the top of the photo.
- `objectPositionTight`: the crop for small round thumbnails.

Commit those edits to the same branch.

**Using a new file name** (e.g. a `.webp`): upload it to `public/team/`, then change that person's `"image"` in `team.json` to match, e.g. `"image": "team/neeti-bourai-2026.webp"`. The automatic check reports an error if the file can't be found.

---

## 6. If the check fails (red ❌)

1. On the pull request, click **Details** next to **Validate presentation**.
2. Open the failed step, for example **Validate editable content**. You'll see messages like:

   ```text
   ✖ ERROR  team.json → members[2].role: is empty. Please enter the text.
   ✖ ERROR  chapters.json → chapters[1].speakerId: "sushanth" is not a known speaker. Use one of: mayank, sushant, neeti, suryakanta, aryama.
   ✖ ERROR  chapters.json → (whole file): is not valid JSON near line 19, column 7. Common causes: a missing comma between items…
   ```

3. Each message gives the **file**, the **field**, and **what to fix**. `members[2]` means the third person in the list, because counting starts at 0.
4. Open that file **on your branch**: use the branch selector, or open the **Files changed** tab and use the **⋯ → Edit file** menu. Fix it and commit again. The check re-runs automatically.

**Common fixes:**

| Message | Fix |
| --- | --- |
| *is not valid JSON near line …* | Look just before that line for a missing comma, or a missing closing `"`, `}` or `]` |
| *is too long for the screen* | Shorten the text (16 words for headlines, 40 for other text) |
| *is not a known speaker* | Use one of the listed ids exactly (lower case) |
| *must have exactly N items* | Keep the same number of entries as before; the screen layout depends on it |
| *timings add up to …* | Scene timings must total 20:00. Take time from one scene when adding it to another |
| *image … does not exist* | Upload the photo to `public/team/`, or correct the path in `team.json` |
| ⚠ *unexpected field* (warning) | A field name is misspelt. Fix the spelling on the left of the colon |

If you're stuck, add a comment on the pull request and ask a teammate. Nothing is published until it's merged.

---

## 7. Undoing a change

- **Before merging:** click **Close pull request**. Nothing was published.
- **After merging:** open the merged pull request and click **Revert**. This creates a new pull request that undoes it; merge that. (The repository owner can also roll back instantly in Vercel; see `DEPLOYMENT_GUIDE.md` §8.)

---

## 8. Things that need a developer

Ask a developer, rather than editing JSON, if you want to:

- add, remove or reorder scenes or chapters, or change how many items a list has;
- change animations, colours or the layout;
- add a new kind of content that isn't in the files.

Some content decisions are still open and are deliberately not resolved in the presentation. These are the assessment length, the client names, the spelling of Suryakanta's name, and the meaning of "June 28". They're listed in `src/content/contentWarnings.md` and in the presenter notes. Agree them with the team before changing those values.
