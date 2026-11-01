const { test, expect } = require('@playwright/test');

test('V515 preserves accomplishment status ribbons after repeated Pass tab switches', async ({ page }) => {
  await page.route('**/npm/**', route => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srAccomplishmentsCanonicalV139 === true &&
    window.__srAccomplishmentsStabilityV138 === true &&
    typeof ACT !== 'undefined' &&
    typeof ACT.accomplishments === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.evaluate(() => {
    S.forge = S.forge || {};
    S.forge.level = 15;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = { forge10: true };
    S.accomplishments.premiumClaimed = {};
    ACT.accomplishments();
  });
  for (let i = 0; i < 3; i++) {
    await page.locator('#overlay [data-ach-tab="defis"]').click();
    const row = page.locator('#overlay [data-ach-id="forge15"]');
    await expect(row).toHaveAttribute('data-ach-state', 'claimable');
    await expect(row.locator('.srAchStatus481')).toHaveText('À réclamer');
    await expect(row.locator('.srRewardLane481')).toHaveCount(2);
    await page.locator('#overlay [data-ach-tab="etages"]').click();
  }
  const claimed = await page.evaluate(() => !!S.accomplishments.claimed.forge15);
  expect(claimed).toBe(false);
});
