/* Browser regression: real save import path, not just the VM mock. */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const legacy = fs.readFileSync(path.join(__dirname, 'fixtures/saves/minimal-old-save.json'), 'utf8');

async function ready(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.goto('/index.html');
  await page.waitForFunction(() =>
    typeof ACT === 'object' && typeof ACT.importSave === 'function' &&
    typeof S === 'object' && Array.isArray(S.inventory) &&
    window.__srImportSaveGuardV207 === true, null, { timeout: 15000 });
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

async function importJson(page, json) {
  const chooser = page.waitForEvent('filechooser');
  await page.evaluate(() => ACT.importSave());
  const file = await chooser;
  await file.setFiles({ name: 'shadowreach-save.json', mimeType: 'application/json', buffer: Buffer.from(json) });
}

test('invalid JSON cannot replace the running hero', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => { window.__srImportPriorState = S; });
  await importJson(page, '{"stats":{},"level":2}');
  await expect.poll(() => page.evaluate(() => S === window.__srImportPriorState)).toBe(true);
});

test('legacy save imports in the real game, persists progress and uses raid-local day', async ({ page }) => {
  await ready(page);
  await importJson(page, legacy);
  await expect.poll(() => page.evaluate(() => S.level)).toBe(7);
  const result = await page.evaluate(() => {
    const stored = JSON.parse(localStorage.getItem('shadowreach.save.local') || 'null');
    return {
      gold: S.gold, floor: S.floor,
      dayAligned: S.lastKeyReset === raidKeyResetDayKey(Date.now()),
      storedLevel: stored && stored.level, storedGold: stored && stored.gold,
      storedDay: stored && stored.lastKeyReset
    };
  });
  expect(result.gold).toBe(321);
  expect(result.floor).toBe(4);
  expect(result.dayAligned).toBe(true);
  expect(result.storedLevel).toBe(7);
  expect(result.storedGold).toBe(321);
  expect(result.storedDay).toBe(await page.evaluate(() => raidKeyResetDayKey(Date.now())));
});
