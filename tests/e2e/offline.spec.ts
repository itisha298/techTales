import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('after one visit, the production build reloads and runs with no network', async ({ page, context }) => {
  await page.goto('/#context');
  await expect(page.locator('section[data-scene]')).toHaveAttribute('data-scene', 'context');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload(); // now controlled by the service worker
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('section[data-scene]')).toHaveAttribute('data-scene', 'context');
  await page.keyboard.press('End');
  await expect(page.locator('section[data-scene]')).toHaveAttribute('data-scene', 'qa');
  await page.goto('/#team');
  const imgs = page.locator('[data-testid=team-member] img');
  await expect(imgs).toHaveCount(5);
  for (const img of await imgs.all()) {
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await context.setOffline(false);
});
