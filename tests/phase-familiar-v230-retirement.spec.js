const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const exists = name => fs.existsSync(path.join(root, name));

const index = read('index.html');

test('obsolete Familiar V230 QA stub is retired without affecting the active Familiar chain', async ({ page }) => {
  expect(index).not.toContain('src="familiars-qa-v230.js');
  expect(exists('familiars-qa-v230.js')).toBe(false);
  expect(index).toContain('src="familiars-ui-v229.js');
  expect(index).toContain('src="familiars-noscr-v231.js');
  expect(index).toContain('src="familiars-stock-authority-v275.js');

  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  await page.waitForFunction(() => (
    window.__srFamScrollLayoutV240 === true &&
    window.__srFamTabsMergeV241 === true &&
    window.__srFamStockAuthorityV275 === true &&
    window.__srFamiliarFlatUIV309 === true
  ), null, { timeout: 15000 });

  const state = await page.evaluate(() => ({
    retiredMarker: !!window.__srFamQaV230Disabled,
    v240: !!window.__srFamScrollLayoutV240,
    v241: !!window.__srFamTabsMergeV241,
    v275: !!window.__srFamStockAuthorityV275,
    v309: !!window.__srFamiliarFlatUIV309,
  }));

  expect(state).toEqual({
    retiredMarker: false,
    v240: true,
    v241: true,
    v275: true,
    v309: true,
  });
});
