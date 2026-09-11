const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('retired equipment refund V238 stays absent while loaded V239 reconstructs investment independently', async ({ page }) => {
  const index = source('index.html');
  const loader = source('familiars-noscr-v231.js');
  const v239 = source('equipment-recycle-infusion-v239.js');

  expect(fs.existsSync(path.join(root, 'equipment-dust-refund-v238.js'))).toBe(false);
  expect(index).not.toContain('equipment-dust-refund-v238.js');
  expect(loader).toContain('equipment-recycle-infusion-v239.js');
  expect(loader).not.toContain('equipment-dust-refund-v238.js');
  expect(v239).toContain('successfulInvestmentEstimate');
  expect(v239).toContain('it.dustInvested=successfulInvestmentEstimate(it)');
  expect(v239).toContain('return baseRecycleValue(s,it)+Math.floor(investmentOf(it)*0.50)');
  expect(v239).toContain('return baseRecycleValue(s,it)+Math.floor(investmentOf(it))');

  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srEquipmentRecycleInfusionV239 === true && window.__srInfusionV239 && typeof window.__srInfusionV239.investment === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const result = await page.evaluate(() => {
    const item = {
      id: 'lean-v238-retirement-item',
      rarity: 'COMMUN',
      level: 3,
      upgradeBaseLevel: 0,
      originalPower: 1000,
      power: 1000,
      baseDamage: 1000,
      damage: 1000,
      baseHp: 0,
      hp: 0,
    };
    const investment = window.__srInfusionV239.investment(item);
    const normal = window.__srInfusionV239.normalValue(item);
    const infused = window.__srInfusionV239.infusedValue(item);
    return {
      retiredGuard: typeof window.__srEquipmentDustRefundV238,
      v239Guard: window.__srEquipmentRecycleInfusionV239 === true,
      migrationMarker: S.equipmentRecycleInfusionV239 === true,
      investment,
      normal,
      infused,
      refundDelta: infused - normal,
    };
  });

  // Successful levels 0→1, 1→2 and 2→3 cost 20 + 32 + 44 = 96.
  expect(result.retiredGuard).toBe('undefined');
  expect(result.v239Guard).toBe(true);
  expect(result.migrationMarker).toBe(true);
  expect(result.investment).toBe(96);
  expect(result.infused).toBeGreaterThan(result.normal);
  expect(result.refundDelta).toBe(48);
});
