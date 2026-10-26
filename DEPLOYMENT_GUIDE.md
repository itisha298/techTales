# Deployment guide: private GitHub repository + protected Vercel hosting

This guide is for the project owner. It takes the presentation from this folder to:

- a **private GitHub repository**, where teammates propose content changes through pull requests;
- **Vercel**, which builds a private **preview** for every pull request and updates **production** when changes are merged into `main`;
- **Vercel Authentication**, which protects **every** deployment, including the production address.

Nothing in this guide has been done yet. Each step changes an external system, so do it yourself, or approve it explicitly, after the checks in §0.

---

## 0. Before you start: approvals and accounts

### Approvals

This deck contains **client material and team photographs**. Before you upload it to GitHub or Vercel, confirm the following with your engagement lead or security contact:

1. **Hosting client material on external services is allowed** for this engagement. Many organisations require an approved company-managed GitHub organisation and Vercel team rather than personal accounts.
2. **Everyone pictured agrees** to their photo being stored in the repository and shown in the hosted deck.
3. **Who may view it.** Agree an explicit list of people.

### Accounts you'll need

| Service | What you need | Notes |
| --- | --- | --- |
| GitHub | An account that can create **private** repositories, preferably inside your company's GitHub organisation | Teammates need GitHub accounts with **Write** access to propose changes |
| Vercel | A Vercel **team** that you own or administer | Check the plan, below |

**Choosing a Vercel plan.** Vercel's free **Hobby** plan is for personal, non-commercial use. Client work normally needs a **Pro** (or Enterprise) team.

Plans also differ in what they can protect:

- **Standard Protection** covers preview deployments and generated deployment URLs.
- **All Deployments** also protects the production domain. This is the setting you need.

Which plans offer *All Deployments* has changed over time. Confirm it on Vercel's current [Deployment Protection documentation](https://vercel.com/docs/deployment-protection) before you choose a plan.

**Viewers must sign in.** With Vercel Authentication, viewers log in with a Vercel account and must be members of your Vercel team, or be granted access. Check how your plan counts and bills team members.

### Things that are deliberately **not** in this project

- **No password screen or stored passwords.** Any password inside a frontend app can be read by anyone who loads it. Access is enforced by Vercel before the app is served.
- **No secrets or API keys.** The app has no backend. It needs no environment variables, except the optional `VITE_OFFLINE` in §5.
- **No public admin or editing page.** Content changes go through GitHub pull requests only.

---

## 1. Check the project locally

Requires Node.js **22.18 or newer**. Open a terminal in this folder and run:

```bash
npm install
npm run check        # content validation, lint, type check, unit tests, production build
npm run test:e2e     # end-to-end tests in Chrome (about 2–3 minutes)
```

All of these must pass. `npm run present` opens the presentation locally at http://localhost:4173.

---

## 2. Create the local Git repository and first commit

This folder isn't a Git repository yet. From this folder:

```bash
git init -b main
git add .
git status            # review the list before committing (see below)
git commit -m "Meridian Telecom presentation: initial commit"
```

**What `git status` should show:**

- **Included:** `src/`, `public/`, `scripts/`, `tests/`, `source-assets/`, `.github/`, the `*.md` guides and the config files.
- **Excluded by `.gitignore`:** `node_modules/`, `dist/`, `test-results/`, `playwright-report/`, `.sf/` (local Salesforce CLI data) and `scripts/extracted.txt`.

`source-assets/` contains the original speech document and the full-size photos. That's appropriate for a **private** repository. If your organisation prefers not to store them, add `source-assets/` to `.gitignore` before committing. The app doesn't need them at runtime.

---

## 3. Create the private GitHub repository and push

1. Go to **github.com → New repository** (choose your company organisation as owner, if you have one).
2. **Repository name:** e.g. `meridian-prime-meridian`.
3. **Visibility: Private.** ⚠️ Double-check this.
4. **Don't** add a README, `.gitignore` or licence; the project already has them.
5. Click **Create repository**, then copy the repository URL GitHub shows (HTTPS).
6. In the terminal:

   ```bash
   git remote add origin https://github.com/<your-org-or-user>/meridian-prime-meridian.git
   git push -u origin main
   ```

7. On GitHub, open **Actions**. The **Validate presentation** workflow runs on the push and should turn green within a few minutes.

### Protect the `main` branch

Go to **Settings → Branches → Add branch ruleset** (or **Add rule**) for `main` and enable:

- **Require a pull request before merging**, with **Require approvals: 1**.
- **Require status checks to pass**, adding:
  - `Content, types, lint, unit tests and build`
  - `End-to-end tests (Chromium)`
- **Block force pushes.**

This makes every change go through review and the automatic checks.

### Invite teammates (only after approval)

Go to **Settings → Collaborators and teams → Add people**, and give content editors **Write** access. Share `TEAM_CONTENT_EDITING_GUIDE.md` with them.

---

## 4. Connect Vercel

1. Sign in to **vercel.com** and switch to your **team** (not a personal Hobby scope, if this is client work).
2. Click **Add New… → Project → Import Git Repository**, and authorise Vercel's GitHub app **only for this repository**.
3. Configure the project. Most of these are pre-filled from `vercel.json`:

   | Setting | Value |
   | --- | --- |
   | Framework Preset | **Vite** |
   | Install Command | `npm ci` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Node.js Version | 22.x or 24.x (Settings → General, after import) |

4. Click **Deploy**.
   ⚠️ The first production deployment starts immediately. **Do step 5 straight away**, so the production address is protected within minutes of going live.
5. Confirm, in **Settings → Git**:
   - **Production Branch** is `main`;
   - **pull requests get preview deployments** (Vercel's default for connected repositories).

How this works afterwards:

- Every pull request gets a **Preview** deployment, and Vercel comments the link on the PR.
- Every merge into `main` updates **Production** automatically.

Hosting details already handled in the project:

- **Scene links** use URL hashes (`#value`, `#june-28`…), so refreshing a page keeps the scene and no rewrite rules are needed.
- **Headers:** `vercel.json` adds `noindex` (keeps search engines out), basic security headers, long-term caching for built assets, and no caching for `sw.js`.
- **Fullscreen** works as normal; it's a browser feature and needs no server support.

---

## 5. Protect all deployments with Vercel Authentication

1. In the Vercel project, open **Settings → Deployment Protection**.
2. Under **Vercel Authentication**, turn it **On**.
3. Set the scope to **All Deployments**. This includes the production domain. **Standard Protection** alone would leave production public.
   If *All Deployments* isn't available on your plan, **stop here and don't share the production URL**. Either upgrade, or keep using previews only. See §0.
4. Click **Save**. Protection applies to existing deployments straight away.
5. **Leave these off** unless your security contact approves them:
   - **Protection Bypass for Automation**
   - **Shareable Links**

   Either one creates links that skip the sign-in.
6. **Verify:** open the production URL in a private or incognito window. You should see Vercel's sign-in page, not the presentation. Do the same for a preview URL.

### Optional: turn off offline caching for the hosted copy

The presentation includes an offline mode (a service worker). After one visit, it keeps working without a network, which is useful in a conference room.

The trade-off: once a viewer has opened it, a **copy stays cached on their device**, even if you later remove their access. If that matters, turn offline mode off for the hosted copy:

1. **Settings → Environment Variables → Add**: name `VITE_OFFLINE`, value `false`, environments **Production** and **Preview**.
2. **Deployments → ⋯ → Redeploy** the latest production deployment.

On the next visit, viewers' devices remove the service worker and its cached copy.

Local presenting with `npm run present` is unaffected and keeps offline mode.

---

## 6. Share with approved team members

With Vercel Authentication on, only signed-in members of your Vercel team, or people you grant access, can open the deck.

1. In Vercel, go to **Team Settings → Members → Invite**, and invite each approved person by email, with the lowest role that works for them. Some plans have a view-only role; check your plan.
2. Alternatively, when someone outside the team opens the link, Vercel lets them **request access**. You approve or deny each request in the dashboard.
3. Send the production URL, e.g. `https://<project>.vercel.app` or your custom domain, **only** to approved people. Ask them to open it in Chrome or Edge.
4. To remove someone, remove them from the Vercel team (and from the GitHub repository, if they had access). If offline mode is on, see the note in §5.

**Custom domain (optional):** go to **Settings → Domains → Add**. With **All Deployments** protection, custom domains are protected too. Verify in a private window.

---

## 7. Publishing future content changes

Every change, however small, follows the same path:

1. A teammate edits the files in `src/content/editable/` (or a photo in `public/team/`) on the GitHub website, on a **new branch**, and opens a **pull request**. Step-by-step instructions are in `TEAM_CONTENT_EDITING_GUIDE.md`.
2. **GitHub Actions** runs *Validate presentation*:
   - content validation
   - TypeScript
   - ESLint
   - unit tests
   - production build
   - end-to-end tests
3. **Vercel** posts a protected **Preview** link on the pull request.
4. A reviewer checks the preview and **approves**.
5. **Merge** into `main`. Vercel deploys to production automatically, usually in 1–3 minutes.

Developers can do the same from the command line:

```bash
git checkout -b my-change
# edit files
npm run check
git commit -am "Describe the change"
git push -u origin my-change
# then open the pull request on GitHub
```

---

## 8. Rolling back

- **Fastest:** in Vercel, go to **Deployments**, find the last good production deployment, and choose **⋯ → Instant Rollback** (or **Promote to Production**).
- **Permanent:** on GitHub, open the merged pull request, click **Revert**, and merge the revert pull request.

---

## 9. About the old GitHub Pages workflow

An earlier version of this project had a GitHub Pages deployment workflow. It has been **moved out of `.github/workflows/`** to `docs/optional/github-pages-deploy.yml`, so it no longer runs.

The reason: a Pages site built from a *private* repository is still **publicly reachable** on most GitHub plans. Access control for Pages requires GitHub Enterprise Cloud. Running it alongside Vercel would have published the deck at an unprotected `github.io` address.

`netlify.toml` is also still in the project, but nothing deploys to Netlify unless someone connects it. You can delete it if you won't use Netlify.

---

## 10. Checklist

**Before going live:**

- [ ] Hosting approved, photo consent confirmed, viewer list agreed (§0)
- [ ] `npm run check` and `npm run test:e2e` pass locally (§1)
- [ ] GitHub repository is **Private**; `main` is protected with required checks (§3)
- [ ] Vercel project builds from `main`, and PRs get previews (§4)
- [ ] Vercel Authentication is on with **All Deployments**; bypass and shareable links are off (§5)
- [ ] The production URL shows a sign-in page in a private window (§5)
- [ ] Offline mode decision made (`VITE_OFFLINE`) (§5)
- [ ] Only approved people invited; URL shared privately (§6)
