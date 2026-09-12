const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const index = read('index.html');
const v274 = read('familiars-stock-v274.js');
const v275 = read('familiars-stock-authority-v275.js');

test('V274 is unloaded while V275 remains the sole loaded Familiar stock authority', async ({ page }) => {
  expect(index).not.toContain('src="familiars-stock-v274.js');
  expect(index).toContain('src="familiars-stock-authority-v275.js');

  // Preserve V274 source history until this staged unload survives the full gate.
  expect(v274).toContain('window.__srFamiliarsStockV274=true');
  expect(v274).toContain('new MutationObserver(sortDom)');
  expect(v275).toContain('window.__srFamStockAuthorityV275=true');
  expect(v275).toContain('window.__srFamScrollLayoutV240');
  expect(v275).toContain('window.__srFamTabsMergeV241');

  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  await page.waitForFunction(() => (
    window.__srFamScrollLayoutV240 === true &&
    window.__srFamTabsMergeV241 === true &&
    window.__srFamStockAuthorityV275 === true &&
    window.__srFamiliarFlatUIV309 === true &&
    typeof SCREENS === 'object' &&
    typeof SCREENS.familiers === 'function' &&
    SCREENS.familiers.__srV309 === true
  ), null, { timeout: 15000 });

  const ownership = await page.evaluate(() => ({
    v274: !!window.__srFamiliarsStockV274,
    v274Observer: !!window.__srFamStockObserverV274,
    v275: !!window.__srFamStockAuthorityV275,
    v240: !!window.__srFamScrollLayoutV240,
    v241: !!window.__srFamTabsMergeV241,
    v309: !!window.__srFamiliarFlatUIV309,
  }));

  expect(ownership).toEqual({
    v274: false,
    v274Observer: false,
    v275: true,
    v240: true,
    v241: true,
    v309: true,
  });

  await page.evaluate(() => {
    if (typeof nav === 'function') nav('familiers');
    if (typeof render === 'function') render();
  });

  await expect(page.locator('.famScroll240')).toHaveCount(1);
  await page.locator('[data-fam240-tab="eggs"]').click();
  await expect(page.locator('.fam275Summon')).toHaveCount(1);
  await expect(page.locator('.fam275Summon [data-act="summonEgg"]')).toHaveCount(2);

  await page.locator('[data-fam240-tab="progress"]').click();
  await expect(page.locator('.fam240Body [data-act="summonEgg"]')).toHaveCount(0);
});
