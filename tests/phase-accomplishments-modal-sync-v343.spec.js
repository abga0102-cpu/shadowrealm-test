const { test, expect } = require('@playwright/test');

async function openGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof ACT !== 'undefined' && typeof ACT.accomplishments === 'function' && window.__srAccomplishmentsModalSyncConfigV343);
  await page.evaluate(() => ACT.accomplishments());
  await expect(page.locator('#overlay .srAch139')).toBeVisible();
}

test('V343 switches Accomplishments tabs inside the persistent modal and keeps one close control', async ({ page }) => {
  await openGame(page);

  await expect(page.locator('#overlay .srAch139 [data-ach-tab="etages"]')).toHaveClass(/on/);
  await page.locator('#overlay .srAch139 [data-ach-tab="defis"]').click();

  await expect(page.locator('#overlay .srAch139 [data-ach-tab="defis"]')).toHaveClass(/on/);
  await expect(page.locator('#overlay .srAch139 [data-ach="forge15"]')).toHaveCount(1);
  await expect(page.locator('#overlay .srAch139 [data-ach="fusion1"]')).toHaveCount(1);
  await expect(page.locator('#overlay .srAch139 [data-ach="raid1"]')).toHaveCount(1);

  await expect(page.locator('#overlay .srPassClose331')).toHaveCount(1);
  await expect.poll(async () => page.locator('#overlay .srAch139 > .mt10 [data-act="closeModal"]').count()).toBe(0);
});
