import { expect, test, type Page } from '@playwright/test';

const SCENES = [
  'opening',
  'journey',
  'context',
  'team',
  'innovation-challenge',
  'innovation-solution',
  'value',
  'june-28',
  'assessment',
  'qa',
];

const scene = (page: Page) => page.locator('section[data-scene]');
const expectScene = (page: Page, id: string) => expect(scene(page)).toHaveAttribute('data-scene', id);

test.describe('navigation', () => {
  test('keyboard reaches every scene and build, forwards and backwards', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/');
    await expectScene(page, 'opening');
    // 10 scenes + 1 extra build each on june-28 and qa
    for (const id of SCENES.slice(1)) {
      await page.keyboard.press('ArrowRight');
      await expectScene(page, id);
      if (id === 'june-28' || id === 'qa') await page.keyboard.press('Space');
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
    }
    await expect(page.getByRole('heading', { name: /discuss what matters most/i })).toBeVisible();
    // Backwards from the Q&A build: builds unwind before scenes change.
    const back = ['qa', 'assessment', 'june-28', 'june-28', 'value', 'innovation-solution', 'innovation-challenge', 'team', 'context', 'journey', 'opening'];
    for (const id of back) {
      await page.keyboard.press('ArrowLeft');
      await expectScene(page, id);
    }
    await page.keyboard.press('Home');
    await expectScene(page, 'opening');
    await page.keyboard.press('End');
    await expectScene(page, 'qa');
    await page.keyboard.press('PageUp');
    await expectScene(page, 'assessment');
    await page.keyboard.press('PageDown');
    await expectScene(page, 'qa');
    expect(errors).toEqual([]);
  });

  test('refresh restores the current scene from the hash', async ({ page }) => {
    await page.goto('/#value');
    await expectScene(page, 'value');
    await page.reload();
    await expectScene(page, 'value');
    await page.keyboard.press('ArrowRight');
    await page.reload();
    await expectScene(page, 'june-28');
  });

  test('one wheel gesture with trackpad inertia moves exactly one scene', async ({ page }) => {
    await page.goto('/#journey');
    await expectScene(page, 'journey');
    await page.mouse.move(600, 400);
    // ~1.2 s of continuous inertia events
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 60);
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(400);
    await expectScene(page, 'context');
    // a fresh, separate gesture moves again
    await page.mouse.wheel(0, 120);
    await expectScene(page, 'team');
  });

  test('touch swipes navigate', async ({ page }) => {
    await page.goto('/#journey');
    const swipe = (dx: number) =>
      page.evaluate((dx) => {
        const el = document.querySelector('main')!;
        const t = (x: number) => new Touch({ identifier: 1, target: el, clientX: x, clientY: 400 });
        el.dispatchEvent(new TouchEvent('touchstart', { touches: [t(600)], changedTouches: [t(600)], bubbles: true }));
        el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(600 + dx)], bubbles: true }));
      }, dx);
    await swipe(-200);
    await expectScene(page, 'context');
    await swipe(200);
    await expectScene(page, 'journey');
  });

  test('on-screen controls and chapter menu work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Enter experience' }).click();
    await expectScene(page, 'journey');
    await page.getByRole('button', { name: 'Next scene' }).click();
    await expectScene(page, 'context');
    await page.getByRole('button', { name: 'Previous scene' }).click();
    await expectScene(page, 'journey');
    await page.getByRole('button', { name: /chapter menu/i }).click();
    await page.getByRole('dialog', { name: /chapter menu/i }).getByRole('button', { name: 'Meet the team' }).click();
    await expectScene(page, 'team');
  });
});

test.describe('presenter tools', () => {
  test('notes, overview, timer and escape', async ({ page }) => {
    await page.goto('/#innovation-challenge');
    await expect(page.getByLabel('Presenter notes')).toHaveCount(0);
    await page.keyboard.press('n');
    const notes = page.getByRole('complementary', { name: 'Presenter notes' });
    await expect(notes).toContainText('Grace Hopper');
    await expect(notes).toContainText('Next speaker');
    // notes stay open while navigating
    await page.keyboard.press('ArrowRight');
    await expect(notes).toContainText('AI-led discovery');
    await page.keyboard.press('Escape');
    await expect(notes).toHaveCount(0);

    await page.keyboard.press('o');
    await expect(page.getByRole('dialog', { name: /chapter overview/i })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.keyboard.press('t');
    const timer = page.getByRole('region', { name: 'Presentation timer' });
    await expect(timer).toBeVisible();
    await expect(timer).toContainText('0:01', { timeout: 4000 });
  });

  test('presenter toolbar is hidden until the pointer moves', async ({ page }) => {
    await page.goto('/#context');
    await expect(page.getByRole('toolbar', { name: 'Presenter tools' })).toHaveCount(0);
    await page.mouse.move(400, 300);
    await page.mouse.move(420, 320);
    await expect(page.getByRole('toolbar', { name: 'Presenter tools' })).toBeVisible();
    await expect(page.getByRole('toolbar')).toContainText('Context and stakes');
  });

  test('fullscreen toggles with F', async ({ page }) => {
    await page.goto('/');
    await expectScene(page, 'opening'); // listeners attached
    await page.keyboard.press('f');
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
    await page.keyboard.press('f');
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  });
});

test.describe('photographs', () => {
  test('every team photograph loads', async ({ page }) => {
    await page.goto('/#team');
    const imgs = page.locator('section[data-scene] img');
    await expect(imgs).toHaveCount(5);
    for (const img of await imgs.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });

  test('a missing photograph falls back to initials', async ({ page }) => {
    await page.route('**/team/neeti-bourai.jpg', (r) => r.abort());
    await page.goto('/#team');
    await expect(page.getByTestId('portrait-fallback-neeti')).toHaveText('NB');
  });
});

test.describe('scene sequence', () => {
  // Scene order as presented: the team introduction follows Mayank's context scene.
  const ORDER = ['opening', 'journey', 'context', 'team', 'innovation-challenge', 'innovation-solution', 'value', 'june-28', 'assessment', 'qa'];

  test('forward and reverse walks visit every scene once, with 01/10 to 10/10', async ({ page }) => {
    await page.goto('/#opening');
    await expectScene(page, 'opening');
    const counter = (n: number) => `${String(n).padStart(2, '0')} / 10`;
    await expect(page.getByText(counter(1), { exact: true })).toBeVisible();
    const forward: string[] = [];
    for (let n = 2; n <= 10; n++) {
      // june-28 and qa have a second build; step through it with the same arrow.
      const id = ORDER[n - 1];
      await page.keyboard.press('ArrowRight');
      await expectScene(page, id);
      forward.push(id);
      await expect(page.getByText(counter(n), { exact: true })).toBeVisible();
      if (id === 'june-28' || id === 'qa') await page.keyboard.press('ArrowRight');
    }
    expect(forward).toEqual(ORDER.slice(1));

    // Reverse: unwind the Q&A build, then go back scene by scene. Two-build
    // scenes (june-28) need one extra back-press to unwind their build.
    await page.keyboard.press('ArrowLeft');
    await expectScene(page, 'qa');
    for (let n = 9; n >= 1; n--) {
      await page.keyboard.press('ArrowLeft');
      await expectScene(page, ORDER[n - 1]);
      await expect(page.getByText(counter(n), { exact: true })).toBeVisible();
      if (ORDER[n - 1] === 'june-28') await page.keyboard.press('ArrowLeft');
    }
    await expectScene(page, 'opening');
  });

  test('the team introduction appears only once, straight after Mayank', async ({ page }) => {
    await page.goto('/#context');
    await page.keyboard.press('ArrowRight');
    await expectScene(page, 'team');
    await expect(page.locator('section[data-scene]')).toContainText('Meet the Meridian Wizards');
    await expect(page.locator('[data-testid=team-member]')).toHaveCount(5);
    await page.keyboard.press('ArrowRight');
    await expectScene(page, 'innovation-challenge');
    // Walk to the end and confirm the team screen is not repeated there.
    await page.keyboard.press('End');
    await expectScene(page, 'qa');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expectScene(page, 'assessment');
  });
});
