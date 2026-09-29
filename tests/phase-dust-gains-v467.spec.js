const { test, expect } = require('@playwright/test');

async function clean(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srDustGainsV467 &&
    window.__srDustEconomyConfigV293 &&
    window.__srForgeDustIntegrityV467 &&
    window.__srInfusionV239 &&
    typeof itemUpgradeCost === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V467 doubles new Dust gains while V469 halves equipment upgrade costs', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    S.poussiere = 321;
    S.forge.dustEconomyVersion = 429;
    const migration = window.__srDustEconomyConfigV293.migrateStockV429();
    const item = { rarity:'RARE', level:1, upgradeLevel:0 };
    return {
      multiplier: window.__srDustGainsV467.multiplier,
      owned: S.poussiere,
      migrationChanged: migration.changed,
      recycle: dustValue(S,item),
      infused: window.__srInfusionV239.infusedValue(item),
      cost0: itemUpgradeCost(item),
      cost10: itemUpgradeCost({ rarity:'RARE', level:1, upgradeLevel:10 })
    };
  });
  expect(out).toEqual({
    multiplier:2,
    owned:321,
    migrationChanged:false,
    recycle:8,
    infused:16,
    cost0:15,
    cost10:105
  });
});

test('V467 doubles direct Dust reward tables while keeping Roman thresholds unchanged', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => ({
    thresholds:EQUIPMENT_MASTERY_TIERS.map(t=>t.need),
    rewards:EQUIPMENT_MASTERY_TIERS.map(t=>t.rewardDust),
    rankII:equipmentMasteryInfoFromCount(300)
  }));
  expect(out.thresholds).toEqual([0,100,300,600,1000,1500,2500,4000,6500,10000]);
  expect(out.rewards).toEqual([0,100,200,300,400,500,600,700,800,900]);
  expect(out.rankII).toMatchObject({rank:2,roman:'II',bonusPct:20,rewardDust:200});
});
