const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof itemUpgradeCost === 'function' &&
    typeof itemUpgradeChance === 'function' &&
    window.__srEquipmentDisplayV450 &&
    window.__srV283DustCost &&
    window.__srDustChanceFloorV301 &&
    window.__srProgressionAuditV307
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('Published build halves the live Dust upgrade cost without changing upgrade power', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => ({
    level0: itemUpgradeCost({ level: 24, upgradeLevel: 0 }),
    level1: itemUpgradeCost({ level: 24, upgradeLevel: 1 }),
    level10: itemUpgradeCost({ level: 24, upgradeLevel: 10 }),
    authority0: window.__srV283DustCost(0),
    authority1: window.__srV283DustCost(1),
    authority10: window.__srV283DustCost(10)
  }));
  expect(result).toEqual({
    level0: 30, level1: 48, level10: 210,
    authority0: 30, authority1: 48, authority10: 210
  });
});

test('Published build keeps the +25 risk threshold and historical 5 percent floor', async ({ page }) => {
  await openCleanGame(page);
  const chances = await page.evaluate(() => ({
    l24: itemUpgradeChance({ level: 24, upgradeLevel: 24 }),
    l25: itemUpgradeChance({ level: 24, upgradeLevel: 25 }),
    l26: itemUpgradeChance({ level: 24, upgradeLevel: 26 }),
    l27: itemUpgradeChance({ level: 24, upgradeLevel: 27 }),
    l100: itemUpgradeChance({ level: 24, upgradeLevel: 100 })
  }));
  expect(chances).toEqual({ l24: 100, l25: 95, l26: 95, l27: 90, l100: 5 });
});

test('Published build loads fresh Roman-level, Sanctuary and Dust authorities', async ({ page }) => {
  await openCleanGame(page);
  const loaded = await page.evaluate(() => performance.getEntriesByType('resource').map(e => e.name));
  expect(loaded.some(u => u.includes('equipment-stats-collapse-v176.js?v=2026.09.26.455f'))).toBe(true);
  expect(loaded.some(u => u.includes('sanctuary-endgame-v130.js?v=2026.09.26.454e'))).toBe(true);
  expect(loaded.some(u => u.includes('progression-overhaul-v283.js?v=2026.09.26.455h'))).toBe(true);
  expect(loaded.some(u => u.includes('dust-chance-floor-v301.js?v=2026.09.26.455j'))).toBe(true);
  expect(await page.evaluate(() => window.__srEquipmentDisplayV450.name({ name:'Casque', level:3 }))).toBe('Casque | III');
});

test('Published source keeps the four validated V452 Sanctuary rewards', async () => {
  const src = fs.readFileSync('sanctuary-endgame-v130.js', 'utf8');
  expect(src).toContain('EPIQUE_I:{accel:1,qty:1}');
  expect(src).toContain('EPIQUE_II:{accel:5,qty:1}');
  expect(src).toContain('MYTHIQUE_II:{dust:100}');
  expect(src).toContain('MYTHIQUE_III:{accel:30,qty:1,mineral:1500}');
  expect(src).toContain('if(r.dust)S.poussiere=(S.poussiere||0)+r.dust');
});

test('Published index build stamp is unique and cache-busts every changed runtime owner', async () => {
  const index = fs.readFileSync('index.html', 'utf8');
  expect(index).toContain('shadowreach-build" content="2026.09.26.455"');
  expect(index).toContain('game-2.js?v=2026.09.26.455b');
  expect(index).toContain('sanctuary-endgame-v130.js?v=2026.09.26.454e');
  expect(index).toContain('equipment-stats-collapse-v176.js?v=2026.09.26.455f');
  expect(index).toContain('progression-overhaul-v283.js?v=2026.09.26.455h');
  expect(index).toContain('dust-chance-floor-v301.js?v=2026.09.26.455j');
  expect(index).toContain('progression-stability-authority-v304.js?v=2026.09.26.454i');
  expect(index).toContain('progression-batch-qa-v307.js?v=2026.09.26.455k');
  expect(index).toContain('forge-comparison-authority-v146.js?v=2026.09.26.455e');
  expect(index).toContain('power-source-integrity-v256.js?v=2026.09.26.455g');
  expect(index).toContain("var V='2026.09.26.455'");
});
