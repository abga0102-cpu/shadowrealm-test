const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

const index = read('index.html');
const v229 = read('familiars-ui-v229.js');
const v231 = read('familiars-noscr-v231.js');
const v234 = read('familiars-noscr-v234.js');
const v240 = read('familiars-scroll-layout-v240.js');

function indexOfScript(name) {
  return index.indexOf(`src="${name}`);
}

test('Familiar V229 stays unloaded while the V240+ registry chain owns the final screen', async ({ page }) => {
  const v229Pos = indexOfScript('familiars-ui-v229.js');
  const v231Pos = indexOfScript('familiars-noscr-v231.js');

  expect(v229Pos).toBe(-1);
  expect(v231Pos).toBeGreaterThanOrEqual(0);
  expect(v231).toContain("load('familiars-noscr-v234.js");

  // Retained source documents the superseded renderer, but it must not regain runtime ownership.
  expect(v229).toContain('scrFamiliers = renderFamiliarsV229');
  expect(v229).not.toContain('SCREENS.familiers=renderFamiliarsV229');
  expect(v234).toContain('SCREENS.familiers=renderV234');
  expect(v240).toContain('SCREENS.familiers=renderV240');

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

  const ownership = await page.evaluate(() => {
    const finalHtml = typeof SCREENS !== 'undefined' && SCREENS && typeof SCREENS.familiers === 'function'
      ? SCREENS.familiers()
      : '';
    const legacyHtml = typeof scrFamiliers === 'function' ? scrFamiliers() : '';

    return {
      finalUsesV240: finalHtml.includes('famScroll240'),
      finalUsesV229: finalHtml.includes('famV229') || finalHtml.includes('data-fam-jump'),
      legacyUsesV229: legacyHtml.includes('famV229') || legacyHtml.includes('data-fam-jump'),
      v229StylePresent: !!document.getElementById('sr-familiars-v229-style'),
    };
  });

  expect(ownership).toEqual({
    finalUsesV240: true,
    finalUsesV229: false,
    legacyUsesV229: false,
    v229StylePresent: false,
  });
});
