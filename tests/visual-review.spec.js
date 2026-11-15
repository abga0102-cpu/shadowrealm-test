'use strict';
// Fresh disposable browser contexts only: never import or export a player's real save.
const { test, expect } = require('@playwright/test');
const { touchCurrentLocator } = require('./helpers/render-stable-touch');

test('capture fresh Shadowreach UI for design review', async ({ page }, testInfo) => {
  await page.route('**/npm/**', route => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await expect.poll(() => page.evaluate(() => !!window.__srHomeLayoutAuthorityV219), { timeout: 15000 }).toBe(true);

  // The initial tutorial is independent of the screens that need comparison.
  const dismiss = page.getByRole('button', { name: 'Compris' });
  try {
    await dismiss.waitFor({ state: 'visible', timeout: 2500 });
    await dismiss.click();
  } catch (_) {
    // No tutorial on this fresh context/project.
  }

  async function capture(filename) {
    await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(filename), animations: 'disabled', fullPage: false });
  }

  async function visit(destination) {
    const tab = page.locator('#tabs .tab[data-arg="' + destination + '"]');
    await expect(tab).toHaveCount(1);
    if (testInfo.project.name === 'webkit-iphone') {
      await touchCurrentLocator(page, tab, { label: 'visual design capture ' + destination });
    } else {
      await tab.click();
    }
    await expect.poll(() => page.evaluate(() => route), { timeout: 7000 }).toBe(destination);
  }

  await capture('01-accueil.png');
  await visit('equipement');
  await capture('02-equipement.png');
  await visit('parametres');
  await capture('03-parametres.png');
});
