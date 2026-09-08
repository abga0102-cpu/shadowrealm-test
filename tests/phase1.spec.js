const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(__dirname, 'fixtures', 'saves');
const fixture = (name) => JSON.parse(fs.readFileSync(path.join(fixturesDir, name), 'utf8'));

async function openCleanGame(page) {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('shadowreach.save.local');
      localStorage.removeItem('shadowreach.social.v1.messages');
    } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await page.locator('#screen').waitFor({ state: 'visible' });
}

async function activate(locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') await locator.tap();
  else await locator.click();
}

test('existing smoke suite completes and exposes its baseline', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'The full legacy smoke suite only needs one engine.');
  test.setTimeout(180000);
  await page.goto('/smoke-test.html');
  const summary = page.locator('#big');
  await expect(summary).toContainText(/AUCUNE RÉGRESSION|RÉGRESSION\(S\) DÉTECTÉE/, { timeout: 170000 });
  const text = (await summary.textContent()) || '';
  console.log('Legacy smoke baseline:', text.trim());
  // Phase 1 first makes this suite automatic and observable. Once the current
  // baseline is recorded, a later guard can reject any increase in failures.
  expect(text.trim().length).toBeGreaterThan(0);
});

test('all four bottom tabs remain responsive under repeated navigation', async ({ page }, testInfo) => {
  await openCleanGame(page);

  for (let round = 0; round < 5; round++) {
    for (let i = 0; i < 4; i++) {
      const tabs = page.locator('#tabs .tab');
      const tab = tabs.nth(i);
      await activate(tab, testInfo);
      await expect(page.locator('#tabs .tab')).toHaveCount(4);
      await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
    }
  }

  const eventLoopResponsive = await page.evaluate(() => new Promise((resolve) => {
    const started = performance.now();
    setTimeout(() => resolve(performance.now() - started < 1000), 0);
  }));
  expect(eventLoopResponsive).toBe(true);
});

test('harvest modal close and claim controls remain interactive', async ({ page }, testInfo) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    S.harvest = { secs: 3600, minerai: 25, essence: 12, eclat: 8, gold: 40 };
    showHarvestModal();
  });
  await expect(page.locator('#overlay')).toBeVisible();
  const close = page.locator('#overlay [data-act="closeModal"]').first();
  await expect(close).toBeVisible();
  await activate(close, testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0);

  await page.evaluate(() => {
    S.harvest = { secs: 3600, minerai: 25, essence: 12, eclat: 8, gold: 40 };
    showHarvestModal();
  });
  await expect(page.locator('#overlay')).toBeVisible();
  const claim = page.locator('#overlay [data-act="harvestClaim"]');
  await expect(claim).toBeVisible();
  await activate(claim, testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('legacy save fixtures migrate into valid current structures', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Save migration is engine-independent.');
  await openCleanGame(page);

  for (const name of ['legacy-accessory.json', 'minimal-old-save.json', 'malformed-slots.json']) {
    const oldSave = fixture(name);
    const result = await page.evaluate((raw) => {
      const migrated = migrate(JSON.parse(JSON.stringify(raw)), 'Fixture');
      const slots = ['arme', 'casque', 'armure', 'gants', 'bottes', 'collier', 'anneau', 'ceinture'];
      return {
        version: migrated.version,
        equippedKeys: Object.keys(migrated.equipped || {}),
        hasAccessory: Object.prototype.hasOwnProperty.call(migrated.equipped || {}, 'accessoire'),
        inventoryIsArray: Array.isArray(migrated.inventory),
        skillSlotsIsArray: Array.isArray(migrated.skillSlots),
        petsIsArray: Array.isArray(migrated.pets),
        hasHarvest: !!migrated.harvest,
        hasTree: !!migrated.tree,
        hasRebirth: !!migrated.rebirth,
        hasRaids: !!migrated.raids,
        allSlots: slots.every((slot) => Object.prototype.hasOwnProperty.call(migrated.equipped || {}, slot)),
        accessoryInventoryCount: (migrated.inventory || []).filter((it) => it && it.slot === 'accessoire').length,
        equippedAnneauId: migrated.equipped && migrated.equipped.anneau && migrated.equipped.anneau.id
      };
    }, oldSave);

    expect(result.version, name).toBeTruthy();
    expect(result.inventoryIsArray, name).toBe(true);
    expect(result.skillSlotsIsArray, name).toBe(true);
    expect(result.petsIsArray, name).toBe(true);
    expect(result.hasHarvest, name).toBe(true);
    expect(result.hasTree, name).toBe(true);
    expect(result.hasRebirth, name).toBe(true);
    expect(result.hasRaids, name).toBe(true);
    expect(result.allSlots, name).toBe(true);
    expect(result.hasAccessory, name).toBe(false);
    expect(result.accessoryInventoryCount, name).toBe(0);
    if (name === 'legacy-accessory.json') expect(result.equippedAnneauId).toBe('legacy-equipped-ring');
  }
});
