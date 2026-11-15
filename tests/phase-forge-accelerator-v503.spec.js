const { test, expect } = require('@playwright/test');

test('V503 Forge upgrade exposes speed and uses tappable accelerator buttons', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__smoke && window.__smoke.S && typeof render === 'function');

  await page.evaluate(() => {
    const s = window.__smoke.S;
    s.forge.level = Math.max(4, s.forge.level || 4);
    s.forge.upgradeEnd = Date.now() + 60 * 60 * 1000;
    s.accels.a30 = 1;
    render();
  });

  const speed = page.locator('#homeForge').getByText(/Vitesse Forge +/);
  await expect(speed).toBeVisible();

  const accel = page.locator('#homeForge button[data-act="accel"][data-arg="a30"][data-arg2="forge"]');
  await expect(accel).toBeVisible();
  await expect(accel).toHaveCSS('pointer-events', 'auto');

  const box = await accel.boundingBox();
  expect(box).not.toBeNull();
  expect(box.height).toBeGreaterThanOrEqual(38);

  const before = await page.evaluate(() => window.__smoke.S.forge.upgradeEnd);
  await accel.click();
  const after = await page.evaluate(() => window.__smoke.S.forge.upgradeEnd);
  expect(after).toBeLessThan(before - 25 * 60 * 1000);
});
