const { test, expect } = require('@playwright/test');

/* Regression for the V151 observer feedback loop.
   Before the fix, showing one kept Forge result mounted V146's comparison panel,
   V151 rewrote its button text from a document-wide MutationObserver, and that
   textContent write retriggered the same observer indefinitely. The browser's
   microtask queue could then starve until the test/job timed out. */
test('V151 Forge comparison clarification stays bounded and interactive', async ({ page }) => {
  test.setTimeout(15000);

  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#homeForge')).toHaveCount(1, { timeout: 10000 });

  const count = await page.evaluate(() => {
    S.minerai = 1e12;
    const results = forgeSummon(1);
    showForgeResult(results);
    return results.length;
  });
  expect(count).toBeGreaterThan(0);

  const panel = page.locator('#srForgeArenaPreview146');
  await expect(panel).toHaveCount(1, { timeout: 3000 });
  await expect(panel.locator('[data-sr-fp146="keep"]')).toContainText('GARDER DANS L’INVENTAIRE');

  const equip = panel.locator('[data-sr-fp146="equip"]');
  if (await equip.count()) {
    await expect(equip).toContainText('ÉQUIPER LE NOUVEAU');
  }

  // An unrelated subtree mutation must not make V151 rescan/rewrite the popup,
  // and the next task must still run promptly instead of being starved by a
  // self-triggering MutationObserver microtask loop.
  await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.id = 'forgeObserverProbeV151';
    (document.getElementById('screen') || document.body).appendChild(probe);
  });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.getElementById('forgeObserverProbeV151')?.id)).toBe('forgeObserverProbeV151');
});