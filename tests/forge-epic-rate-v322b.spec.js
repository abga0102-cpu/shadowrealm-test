const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await page.waitForFunction(() => window.__srForgeEpicRateV322B === true);
}

test('V322B fixes the real Forge Epic rate at 0.25% once Epic is unlocked', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const locked = gateForgeRates(getRates('forge', 5, S.ascension, starsOf(S, 'forge')), 5);
    const lv8 = gateForgeRates(getRates('forge', 8, S.ascension, starsOf(S, 'forge')), 8);
    const lv50 = gateForgeRates(getRates('forge', 50, S.ascension, starsOf(S, 'forge')), 50);
    return {
      lockedEpic: locked.EPIQUE,
      lv8Epic: lv8.EPIQUE,
      lv50Epic: lv50.EPIQUE,
      sum8: Object.values(lv8).reduce((a, b) => a + Number(b || 0), 0),
      config: window.__srForgeEpicRateConfigV322B,
    };
  });

  expect(result.lockedEpic).toBe(0);
  expect(result.lv8Epic).toBe(0.25);
  expect(result.lv50Epic).toBe(0.25);
  expect(result.sum8).toBeCloseTo(100, 8);
  expect(result.config).toEqual({ unlockForgeLevel: 6, epicRate: 0.25, redistributeTo: 'COMMUN' });
});

test('V322B is used by actual Forge rolls, not only the rarity-info display', async ({ page }) => {
  await openCleanGame(page);

  const captured = await page.evaluate(() => {
    update((st) => { st.forge.level = 8; st.minerai = 1000000; });
    let seen = null;
    const oldRoll = rollRarity;
    rollRarity = function(rates) {
      seen = Object.assign({}, rates);
      return 'COMMUN';
    };
    try { forgeSummon(1); } finally { rollRarity = oldRoll; }
    return seen;
  });

  expect(captured).toBeTruthy();
  expect(captured.EPIQUE).toBe(0.25);
  expect(Object.values(captured).reduce((a, b) => a + Number(b || 0), 0)).toBeCloseTo(100, 8);
});

test('V322B rarity modal displays the exact French 0,25 % value', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    update((st) => { st.forge.level = 8; });
    showRarityInfo();
  });

  const epicRow = page.locator('.itemRow').filter({ hasText: 'Épique' }).filter({ hasText: 'Forge 6+' }).first();
  await expect(epicRow).toContainText('0,25 %');
  await expect(epicRow).toContainText('0,25 % par forge');
});
