const { test, expect } = require('@playwright/test');

test('V381 halves current enemy damage again while preserving V380 HP nerf', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srAdditionalEnemyDamageNerfV381 && window.__srEnemyDamageConfigV289);

  const cfg = await page.evaluate(() => window.__srEnemyDamageConfigV289);
  expect(cfg.globalEnemyNerfV380.hpMul).toBeCloseTo(0.90, 8);
  expect(cfg.globalEnemyNerfV380.damageMul).toBeCloseTo(0.60, 8);
  expect(cfg.additionalDamageNerfV381.currentDamageMul).toBeCloseTo(0.50, 8);
  expect(cfg.additionalDamageNerfV381.effectiveVsV379).toBeCloseTo(0.30, 8);
  expect(cfg.additionalDamageNerfV381.totalReductionVsV379Pct).toBe(70);
  expect(cfg.campaignDamageMulV380).toBeCloseTo(0.36, 8);
  expect(cfg.campaignDamageMulV381).toBeCloseTo(0.18, 8);
  expect(cfg.raidPowerV324.damageMul).toBeCloseTo(0.75, 8);
  expect(cfg.raidPowerV324.effectiveDamageMulV381).toBeCloseTo(0.375, 8);

  expect(await page.evaluate(() => window.__srEnemyAbilityDamageV380(100))).toBe(60);
  expect(await page.evaluate(() => window.__srEnemyAbilityDamageV381(100))).toBe(30);
});
