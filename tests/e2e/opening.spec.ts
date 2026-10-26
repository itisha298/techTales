import { expect, test } from '@playwright/test';

test.describe('opening artwork', () => {
  test('desktop: the extracted artwork loads beside real HTML text', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/#opening');
    const art = page.getByTestId('opening-artwork').locator('img');
    await expect.poll(() => art.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    expect(await art.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/meridian-opening-globe\.webp$/);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(/A New\s*Prime Meridian/);
    await expect(page.getByRole('button', { name: 'Enter experience' })).toBeVisible();
    // The source mock-up (with baked-in text) is never displayed.
    expect(await page.locator('img[src*="meridian-opening.png"]').count()).toBe(0);
  });

  test('mobile: the artwork banner ends above the text', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#opening');
    await page.waitForTimeout(1500);
    const banner = page.locator('section[data-scene] img[src*="meridian-opening-globe"]').last();
    const bannerBox = (await banner.evaluate((el) => el.parentElement!.getBoundingClientRect().toJSON())) as DOMRect;
    const eyebrow = (await page.getByText('Meridian Telecom', { exact: true }).boundingBox())!;
    expect(bannerBox.bottom).toBeLessThanOrEqual(eyebrow.y);
  });

  test('Enter experience still advances to the journey', async ({ page }) => {
    await page.goto('/#opening');
    await page.getByRole('button', { name: 'Enter experience' }).click();
    await expect(page.locator('section[data-scene]')).toHaveAttribute('data-scene', 'journey');
  });
});
