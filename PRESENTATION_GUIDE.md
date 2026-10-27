# Presentation guide

This guide is for the five presenters and whoever drives the laptop on the day.

## Before the session

1. On the presenting laptop, open a terminal in this folder and run the command below. It builds the deck, serves it at **http://localhost:4173** and opens your default browser.

   ```bash
   npm run present
   ```

2. Use **Chrome or Edge**. If a different browser opened, paste `http://localhost:4173` into Chrome or Edge.
3. Press **F** to go fullscreen.
4. Press **T** to show the timer. The timer starts on the first press.
5. To run presenter notes on a second screen, see [Presenter mode](#presenter-mode).

### No internet? No problem

After the production build has been opened once, the deck also survives a **refresh without network**: it caches itself for offline use. Hosted copies may have this turned off; see `DEPLOYMENT_GUIDE.md` §5.

After `npm install` has been run once, the deck needs no internet at all. Fonts, icons, photographs and code are all local. To prepare a laptop for an offline room:

- run `npm install` and `npm run build` while you still have a connection;
- in the room, run `npm run serve`. This serves the existing build without rebuilding.

Do not open `dist/index.html` by double-clicking it. Browsers block the app's scripts on `file://` pages. Always serve it with `npm run serve` (or `npm run present`).

## Keyboard controls

| Key | Action |
| --- | --- |
| **→**, **Space**, **Page Down**, **↓** | Next scene (or next build within a scene) |
| **←**, **Page Up**, **↑** | Previous scene (or previous build) |
| **Home** | First scene |
| **End** | Final scene |
| **O** | Chapter overview: all ten scenes; click one to jump |
| **M** | Chapter menu: grouped by the four chapters |
| **N** | Presenter notes on or off |
| **T** | Timer panel on or off (starts the timer the first time) |
| **F** | Fullscreen on or off |
| **P** | Open a linked presenter window (notes and timer) that follows this window |
| **S** | Link or unlink this window with other open windows |
| **R** | Rehearsal mode on or off (window-local timing; never affects other windows) |
| **Esc** | Close the open overlay, then notes, then timer |

Browser shortcuts (refresh, zoom, developer tools, tab switching) are never intercepted. The mouse wheel or trackpad moves one scene per gesture. On a tablet or phone, swipe left or right.

The deck **never advances on its own**.

### Two scenes have a build step

- **June 28 (scene 8):** the first **→** runs the purple diagonal wipe into "The next chapter". The next **→** moves on. Trigger the wipe as Neeti asks the second question.
- **Executive ask (scene 10):** the first **→** (or the **Open Q&A** button) switches to Aryama's Q&A screen.

Scenes with a build step show two small diamonds in the bottom-right of the rail: ◆◇ means the next arrow **completes the animation**; ◆◆ means the next arrow changes scene. The presenter notes and toolbar say the same thing.

When the speaker changes, the bottom rail briefly shows **Now speaking: name and role**. The audience screen always shows each speaker's role; durations appear only in presenter tools.

## Suggested 20-minute running order

| # | Scene | Speaker | Planned |
| --- | --- | --- | --- |
| 1 | Opening | Mayank Jain | 0:45 |
| 2 | The journey | Mayank Jain | 0:50 |
| 3 | Context and stakes | Mayank Jain | 1:50 |
|   | **Mayank total** | | **≈ 3 min 25 sec** |
| 4 | Meet the Meridian Wizards (team introduction) | Mayank Jain introduces | 0:15 |
| 5 | The hidden-rule challenge | Sushant | 1:35 |
| 6 | AI-led discovery | Sushant | 1:25 |
|   | **Sushant total** | | **≈ 3 min** |
| 7 | The value story | Neeti Bourai | 2:30 |
| 8 | June 28 | Neeti Bourai | 1:30 |
|   | **Neeti total** | | **≈ 4 min** |
| 9 | Why Accenture and the initial assessment | Suryakanta Das | 2:00 |
|   | **Suryakanta total** | | **≈ 2 min 30 sec** |
| 10 | Executive ask and Q&A (the final scene) | Suryakanta asks, Aryama Dey leads | ≈ 7 min |
|   | **Total** | | **20:00** |

Scene times are planning estimates derived from the speech lengths in the source document.

## Speaker handover sequence

1. **Mayank → team introduction → Sushant.** Mayank finishes the context scene, then advances to scene 4, the Meet the Meridian Wizards introduction (about 15 seconds, no scripted speech). He then hands over: "With that, let me hand over to Sushant to talk about innovation." Advance to scene 5.
2. **Sushant → Neeti.** At the end of scene 6: "Neeti will now share a different kind of story: what happens when business and IT look at the same customer." Advance to scene 7.
3. **Neeti → Suryakanta.** At the end of scene 8: "Let's prove what matters most, early." The source has no scripted handover line, so pass over naturally. Advance to scene 9.
4. **Suryakanta → Aryama.** On scene 10, Suryakanta asks: "Would you be comfortable sponsoring this initial assessment…?" Then Suryakanta **stops talking and lets Tom answer**. Press **→** or **Open Q&A** to hand to Aryama.

Mayank's agenda paragraph ("Here is how we will use the time…") is placed on scene 2, although the source speech delivers it after the context. The notes mark which paragraph belongs to which scene. Either order works.

## Presenter mode

The audience view stays clean. Presenter tools only appear when you ask for them.

- **Presenter toolbar.** Move the mouse (or Tab to it) and a slim toolbar appears at the top. It hides again after about three seconds of no movement. It shows:
  - the current and next scene
  - the speaker
  - elapsed time, and time on this scene against plan (▲ means over time)
  - total planned time and progress percentage
  - buttons for notes, overview, timer, fullscreen and **Restart** (goes to the opening and resets the timer)
- **Presenter notes (N).** A panel on the right shows:
  - the speaker and the scene's timing guidance
  - the remaining presentation time
  - cues for operating the scene
  - the **full speech**, verbatim from the source, with this scene's paragraphs highlighted and *PAUSE* markers
  - important pauses, delivery tips, the handover line, and the next speaker and scene

  The panel scrolls on its own and stays open while you change scenes.

### Notes on a second screen (linked windows)

The notes panel is part of the same window, so the audience sees it if you mirror your display. Use an **extended display** instead:

1. Open the deck at `http://localhost:4173` and move that window to the projector.
2. Press **P**. A **presenter window** opens with the notes panel and the toolbar always visible. Both windows are now **linked**: navigating in either one moves the other. No server or internet is needed; the link works between windows of the same browser on the same laptop.
3. Put the presenter window on your laptop screen, and press **F** in the audience window for fullscreen.
4. The toolbar shows **Sync: Linked · 1 window**. Press **S** in a window to unlink it; it then works independently. If the browser doesn't support linking, each window simply works on its own.

**Mirrored display:** don't open notes on the shared screen. Use the printed speeches, or the notes on a separate device.

### Rehearsal mode (R)

Press **R** to open a **Chapter timing** panel. It records how long each scene and each speaker actually takes, against the plan (▲ over, ▼ under, ● on plan). Pause, resume or reset the run from the panel. Timings are kept in this browser, so you can review them after a practice run.

A rehearsing window shows a **Rehearsal · not live** badge, never syncs with other windows, and never changes what the audience window shows. The panel also lists the content decisions that are still awaiting confirmation.

### Continuous motion

Every scene has subtle ambient motion that keeps running while you talk; it never advances the deck. If the laptop or browser has **reduce motion** turned on, the scenes appear without it, with all content intact.

## Backup plans

| Problem | What to do |
| --- | --- |
| Fullscreen (F) does nothing | Press **F11** (Windows) or **Ctrl+Cmd+F** (Mac) for browser fullscreen. Some managed browsers or embedded views block the fullscreen API. |
| Browser bars still visible | Use F11, or hide the toolbar with the browser's presentation or kiosk mode. The deck still scales to the window. |
| Wrong scene after a mistake | Press **O** and click the right scene, or press **Home**. |
| Projector resolution is low (1280×720, 1024×768) | No action needed. Layouts are checked down to 1024×768. |
| A photograph fails to load | The portrait shows the person's initials automatically. |
| Laptop fails | Any laptop with Node 20+ and this folder can run `npm install` (with internet) and then `npm run present`. A hosted copy (see README → Deployment) can also be opened from any browser. |
| Clicker or remote | Most presentation clickers send Page Down, Page Up or arrow keys. All of these work. |

## Restarting

Use **Restart** in the presenter toolbar, or press **Home**. Restart also resets the timer. Home does not.
