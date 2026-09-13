const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function openGame(page) {
  await page.addInitScript(() => {
    window.__forgeStressErrors = [];
    window.addEventListener('error', e => window.__forgeStressErrors.push(String(e.message || e.error || 'error')));
    window.addEventListener('unhandledrejection', e => window.__forgeStressErrors.push(String(e.reason || 'rejection')));
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#homeForge')).toHaveCount(1, { timeout: 15000 });
  const tutorial = page.locator('#tutorialCard button').first();
  if (await tutorial.isVisible().catch(() => false)) await tutorial.click();
}

async function assertEquipmentNavigationWorks(page) {
  const equipment = page.locator('[data-act="go"][data-arg="equipement"]').first();
  await expect(equipment).toBeVisible();
  await equipment.click({ timeout: 5000 });
  await expect.poll(() => page.evaluate(() => route)).toBe('equipement');
}

test('V151 synchronizes Forge comparison labels without a body-wide MutationObserver', async () => {
  const src = fs.readFileSync(path.join(process.cwd(), 'forge-equipment-safety-v151.js'), 'utf8');
  expect(src).not.toContain('new MutationObserver');
  expect(src).not.toContain('observer.observe(document.body');
  expect(src).toContain('originalShowForgeResult.apply(this,arguments)');
  expect(src).toContain('clarify(document)');
});

test('rapid real Forge clicks with Minerai stay responsive', async ({ page }) => {
  test.setTimeout(30000);
  await openGame(page);
  await page.evaluate(() => { S.minerai = 1e12; render(); });
  await page.waitForTimeout(50);

  const result = await page.evaluate(async () => {
    let attempts = 0;
    const started = performance.now();
    while (performance.now() - started < 6000) {
      const button = document.querySelector('#homeForge [data-act="forge"][data-arg="1"]');
      if (button) { attempts += 1; button.click(); }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return { attempts, elapsed: performance.now() - started };
  });

  expect(result.attempts).toBeGreaterThan(200);
  expect(result.elapsed).toBeLessThan(12000);
  await page.waitForTimeout(2300);
  expect(await page.evaluate(() => window.__forgeStressErrors.slice())).toEqual([]);
  expect(await page.evaluate(() => (window.__srBootErrors || []).slice())).toEqual([]);
  await assertEquipmentNavigationWorks(page);
});

test('rapid taps on disabled Forge with no Minerai do not poison interaction', async ({ page }) => {
  test.setTimeout(20000);
  await openGame(page);
  await page.evaluate(() => { S.minerai = 0; render(); });
  const forge = page.locator('#homeForge [data-act="forge"][data-arg="1"]');
  await expect(forge).toBeDisabled();
  const box = await forge.boundingBox();
  expect(box).toBeTruthy();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  for (let i = 0; i < 300; i++) await page.mouse.click(x, y);
  expect(await page.evaluate(() => window.__forgeStressErrors.slice())).toEqual([]);
  await assertEquipmentNavigationWorks(page);
});
