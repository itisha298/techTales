import { expect, test, type Page } from '@playwright/test';

const SCENES = ['opening', 'journey', 'context', 'innovation-challenge', 'innovation-solution', 'value', 'june-28', 'assessment', 'qa', 'team'];

/** Snapshot of every continuous-animation element in the active scene. */
const sampleLoops = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('section[data-scene] [data-ambient]')].map((e) => {
      const cs = getComputedStyle(e);
      return [cs.transform, cs.opacity, e.getAttribute('cx'), e.getAttribute('cy'), cs.strokeDashoffset].join(',');
    }),
  );

test.describe('team screen: Meridian Wizards', () => {
  for (const [w, h, perRow] of [
    [1920, 1080, 5],
    [1366, 768, 5],
    [390, 844, 2],
  ] as const) {
    test(`five identical 4:5 photographs at ${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/#team');
      await expect(page.getByRole('heading', { name: 'Meet the Meridian Wizards' })).toBeVisible();
      await expect(page.getByText('The minds behind the transformation.')).toBeVisible();
      const imgs = page.locator('[data-testid=team-member] img');
      await expect(imgs).toHaveCount(5);
      // Let the diagonal reveal and entrance settle before measuring.
      await page.waitForTimeout(2500);
      const boxes: { x: number; y: number; width: number; height: number }[] = [];
      for (const img of await imgs.all()) {
        await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
        boxes.push(await img.evaluate((el) => el.getBoundingClientRect().toJSON()));
      }
      for (const b of boxes) {
        expect(Math.abs(b.width - boxes[0].width)).toBeLessThan(0.5);
        expect(Math.abs(b.height - boxes[0].height)).toBeLessThan(0.5);
        expect(b.height / b.width).toBeCloseTo(1.25, 2);
      }
      expect(boxes.filter((b) => Math.abs(b.y - boxes[0].y) < 1)).toHaveLength(perRow);
    });
  }

  test('team identity appears on the opening without replacing the client', async ({ page }) => {
    await page.goto('/#opening');
    await expect(page.getByTestId('team-identifier')).toContainText(/Presented by\s*Meridian Wizards/i);
    await expect(page.getByText('Meridian Telecom', { exact: true })).toBeVisible();
  });
});

test.describe('continuous animation', () => {
  test('every scene except the opening stays alive, including after a fresh load', async ({ page }) => {
    test.setTimeout(180_000);
    for (const id of SCENES.filter((s) => s !== 'opening')) {
      await page.goto(`/#${id}`);
      await page.reload(); // fresh load: the hardest case for looping animations
      await page.waitForTimeout(7000);
      const a = await sampleLoops(page);
      expect(a.length, `${id} has continuous animation`).toBeGreaterThan(0);
      await expect
        .poll(async () => {
          const b = await sampleLoops(page);
          return b.some((v, i) => v !== a[i]);
        }, { message: `${id} is still moving`, timeout: 6000 })
        .toBe(true);
    }
  });

  test('the opening artwork is static: no loops, no movement', async ({ page }) => {
    await page.goto('/#opening');
    await page.waitForTimeout(2500); // let the entrance fade finish
    expect(await page.locator('section[data-scene] [data-ambient]').count()).toBe(0);
    const snap = () => page.evaluate(() => {
      const img = document.querySelector('[data-testid="opening-artwork"]') as HTMLElement;
      const cs = getComputedStyle(img);
      return [cs.transform, cs.opacity, img.getBoundingClientRect().toJSON().x, img.getBoundingClientRect().toJSON().width].join('|');
    });
    const a = await snap();
    await page.waitForTimeout(3000);
    expect(await snap()).toBe(a);
  });

  test('loops never auto-advance the presentation', async ({ page }) => {
    await page.goto('/#value');
    await page.waitForTimeout(12_000);
    await expect(page.locator('section[data-scene]')).toHaveAttribute('data-scene', 'value');
  });

  test('reduced motion shows a static scene with all content', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await ctx.newPage();
    for (const id of SCENES) {
      await page.goto(`http://localhost:4173/#${id}`);
      await page.waitForTimeout(400);
      expect(await page.locator('section[data-scene] [data-ambient]').count(), id).toBe(0);
      await expect(page.locator('section[data-scene] h2').first()).toBeVisible();
    }
    await ctx.close();
  });

  test('long stay on a scene stays stable (set PW_SOAK=1 to run)', async ({ page }) => {
    test.skip(!process.env.PW_SOAK, 'Soak test runs only with PW_SOAK=1');
    test.setTimeout(240_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/#innovation-challenge');
    await page.evaluate(() => {
      const w = window as unknown as { __cls: number };
      w.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
          if (!e.hadRecentInput) w.__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: false });
    });
    await page.waitForTimeout(130_000);
    const fps = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let frames = 0;
          const start = performance.now();
          const tick = () => {
            frames++;
            if (performance.now() - start < 2000) requestAnimationFrame(tick);
            else resolve(frames / 2);
          };
          requestAnimationFrame(tick);
        }),
    );
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    const a = await sampleLoops(page);
    await page.waitForTimeout(1500);
    const b = await sampleLoops(page);
    console.log(`soak: fps=${fps} cls=${cls.toFixed(4)} loops=${a.length}`);
    expect(errors).toEqual([]);
    expect(cls).toBeLessThan(0.01);
    expect(fps).toBeGreaterThan(40);
    expect(b.some((v, i) => v !== a[i])).toBe(true);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('section[data-scene]')).toHaveAttribute('data-scene', 'innovation-solution');
  });
});

test.describe('presenter features', () => {
  test('linked windows stay in sync over BroadcastChannel', async ({ context }) => {
    const audience = await context.newPage();
    await audience.goto('/?sync=1#context');
    await expect(audience.locator('section[data-scene]')).toHaveAttribute('data-scene', 'context');
    const presenter = await context.newPage();
    await presenter.goto('/?view=presenter#opening');
    // The newcomer adopts the audience position.
    await expect(presenter.locator('section[data-scene]')).toHaveAttribute('data-scene', 'context');
    await presenter.keyboard.press('ArrowRight');
    await expect(audience.locator('section[data-scene]')).toHaveAttribute('data-scene', 'innovation-challenge');
    await audience.keyboard.press('ArrowLeft');
    await expect(presenter.locator('section[data-scene]')).toHaveAttribute('data-scene', 'context');
  });

  test('unlinked windows stay independent', async ({ context }) => {
    const a = await context.newPage();
    await a.goto('/#value');
    const b = await context.newPage();
    await b.goto('/#journey');
    await expect(b.locator('section[data-scene]')).toHaveAttribute('data-scene', 'journey');
    await b.keyboard.press('ArrowRight');
    await expect(b.locator('section[data-scene]')).toHaveAttribute('data-scene', 'context');
    await expect(a.locator('section[data-scene]')).toHaveAttribute('data-scene', 'value');
  });

  test('a rehearsing window never moves the audience window', async ({ context }) => {
    const audience = await context.newPage();
    await audience.goto('/?sync=1#context');
    const rehearse = await context.newPage();
    await rehearse.goto('/?sync=1&rehearsal=1#context');
    await expect(rehearse.getByTestId('rehearsal-badge')).toBeVisible();
    await rehearse.keyboard.press('ArrowRight');
    await expect(rehearse.locator('section[data-scene]')).toHaveAttribute('data-scene', 'innovation-challenge');
    await audience.waitForTimeout(800);
    await expect(audience.locator('section[data-scene]')).toHaveAttribute('data-scene', 'context');
    await expect(audience.getByTestId('rehearsal-badge')).toHaveCount(0);
  });
});
