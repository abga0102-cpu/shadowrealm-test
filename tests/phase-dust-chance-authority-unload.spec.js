const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const exists = name => fs.existsSync(path.join(root, name));

const index = read('index.html');
const v301 = read('dust-chance-floor-v301.js');

test('V301 is the sole Dust chance authority and superseded V292/V300 sources are retired', async ({ page }) => {
  expect(index).not.toContain('src="dust-chance-floor-v292.js');
  expect(index).not.toContain('src="dust-chance-authority-v300.js');
  expect(index).toContain('src="dust-chance-floor-v301.js');

  expect(exists('dust-chance-floor-v292.js')).toBe(false);
  expect(exists('dust-chance-authority-v300.js')).toBe(false);
  expect(v301).toContain('window.__srV301UpgradeChance=chance');
  expect(v301).toMatch(/return Math\.max\(5,95-5\*Math\.floor\(\(level-70\)\/2\)\)/);

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
