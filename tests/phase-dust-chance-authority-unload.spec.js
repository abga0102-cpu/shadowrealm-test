const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

const index = read('index.html');
const v292 = read('dust-chance-floor-v292.js');
const v300 = read('dust-chance-authority-v300.js');
const v301 = read('dust-chance-floor-v301.js');

test('V301 is the sole loaded Dust chance authority while superseded sources remain preserved', async ({ page }) => {
  expect(index).not.toContain('src="dust-chance-floor-v292.js');
  expect(index).not.toContain('src="dust-chance-authority-v300.js');
  expect(index).toContain('src="dust-chance-floor-v301.js');

  // Preserve source history until the unload has survived the full regression gate.
  expect(v292).toContain('window.__srV292UpgradeChance=chance');
  expect(v300).toContain('window.__srV300UpgradeChance=chance');
  expect(v301).toContain('window.__srV301UpgradeChance=chance');

  // V301 restores the same approved 5% floor semantics originally introduced
  // by V292, while V300's temporary 0% authority is intentionally not loaded.
  expect(v292).toMatch(/return Math\.max\(5,95-5\*Math\.floor\(\(level-70\)\/2\)\)/);
  expect(v301).toMatch(/return Math\.max\(5,95-5\*Math\.floor\(\(level-70\)\/2\)\)/);
  expect(v300).toMatch(/return Math\.max\(0,95-5\*Math\.floor\(\(level-70\)\/2\)\)/);

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof itemUpgradeChance === 'function' && window.__srDustChanceFloorV301 === true);

  const state = await page.evaluate(() => ({
    v292: !!window.__srDustChanceFloorV292,
    v300: !!window.__srDustChanceAuthorityV300,
    v301: !!window.__srDustChanceFloorV301,
    l0: itemUpgradeChance({ level: 0 }),
    l69: itemUpgradeChance({ level: 69 }),
    l70: itemUpgradeChance({ level: 70 }),
    l72: itemUpgradeChance({ level: 72 }),
    l200: itemUpgradeChance({ level: 200 })
  }));

  expect(state).toEqual({
    v292: false,
    v300: false,
    v301: true,
    l0: 100,
    l69: 100,
    l70: 95,
    l72: 90,
    l200: 5
  });
});
