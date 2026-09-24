const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
}

test('V447 new-player defaults start with 100 Minerai while migration preserves saved Minerai', async ({ page }) => {
  await openCleanGame(page);
  const state = await page.evaluate(() => {
    const fresh = defaultState('QA');
    const legacy = defaultState('QA');
    legacy.minerai = 158;
    const migrated = migrate(legacy, 'QA');
    return {
      freshMinerai: fresh.minerai,
      migratedMinerai: migrated.minerai,
      forgeCost: forgeCost(1),
      config: window.__srNewPlayerStarterConfigV447 || null,
    };
  });
  expect(state.freshMinerai).toBe(100);
  expect(state.migratedMinerai).toBe(158);
  expect(state.forgeCost).toBe(10);
  expect(state.config).toMatchObject({ minerai: 100, baseForgeCrafts: 10 });
});

test('V446 contextual info is available without changing screen scroll', async ({ page }) => {
  await openCleanGame(page);
  await expect(page.locator('#srSystemInfoBtn')).toBeVisible({ timeout: 5000 });
  const before = await page.evaluate(() => window.scrollY);
  await page.locator('#srSystemInfoBtn').click();
  await expect(page.locator('#srSystemInfoOverlay')).toBeVisible();
  await expect(page.locator('#srSystemInfoTitle')).toContainText('Campagne & Forge');
  await page.locator('#srSystemInfoClose').click();
  await expect(page.locator('#srSystemInfoOverlay')).toHaveCount(0);
  const after = await page.evaluate(() => window.scrollY);
  expect(after).toBe(before);
});
