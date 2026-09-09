const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { touchCurrentLocator } = require('./helpers/render-stable-touch');

const fixturesDir = path.join(__dirname, 'fixtures', 'saves');
const fixture = (name) => JSON.parse(fs.readFileSync(path.join(fixturesDir, name), 'utf8'));
const LEGACY_SMOKE_FAILURE_CEILING = 20;

async function openCleanGame(page) {
  // Phase 1 is deliberately an offline/static regression harness. The social
  // layer may attempt optional CDN imports; abort those in tests so network
  // availability cannot make core UI interaction checks flaky.
  await page.route('**/npm/**', (route) => route.abort());
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

async function activate(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    // The game intentionally replaces interactive DOM nodes during renders.
    // Re-resolve until the current node has real geometry and owns its center,
    // then send a genuine touchscreen tap at that stable on-screen point.
    await touchCurrentLocator(page, locator, { label: 'Phase 1 touch target' });
  } else {
    await locator.click();
  }
}

async function seedHarvestAndOpen(page, testInfo) {
  await page.evaluate(() => {
    S.harvest = { secs: 3600, minerai: 25, essence: 12, eclat: 8, gold: 40 };
    if (typeof render === 'function') render();
  });
  // Drive the game through its real public interaction path. ACT.harvest owns
  // the internal modal call; tests should not depend on that private function.
  const harvestButton = page.locator('[data-act="harvest"]').first();
  await expect(harvestButton).toBeVisible();
  await activate(page, harvestButton, testInfo);
  await expect(page.locator('#overlay')).toBeVisible();
}

test('existing smoke suite stays under the Phase 1 emergency ceiling', async ({ page }, testInfo) => {
  test.skip(process.env.PHASE1_SMOKE_RATCHET_DONE === '1', 'CI already compared this revision with its exact base revision.');
  test.skip(testInfo.project.name !== 'chromium-desktop', 'The full legacy smoke suite only needs one engine.');
  test.setTimeout(180000);
  await page.goto('/smoke-test.html');
  const summary = page.locator('#big');
  await expect(summary).toContainText(/AUCUNE RÉGRESSION|RÉGRESSION\(S\) DÉTECTÉE/, { timeout: 170000 });
  const text = ((await summary.textContent()) || '').trim();
  console.log('Legacy smoke ceiling:', text);

  const failures = /AUCUNE RÉGRESSION/.test(text)
    ? 0
    : Number((text.match(/(\d+)\s+RÉGRESSION/) || [])[1]);
  expect(Number.isFinite(failures), 'smoke-test.html must report a numeric result').toBe(true);
  // V197 began Phase 1 with 20 known failures. This remains an emergency
  // standalone ceiling for local/manual runs. CI uses smoke-ratchet.js to
  // compare against the exact PR base (or previous main commit), so once a
  // failure is fixed it cannot be silently reintroduced later.
  expect(failures).toBeLessThanOrEqual(LEGACY_SMOKE_FAILURE_CEILING);
});

test('all four bottom tabs remain responsive under repeated navigation', async ({ page }, testInfo) => {
  await openCleanGame(page);

  for (let round = 0; round < 5; round++) {
    for (let i = 0; i < 4; i++) {
      const tabs = page.locator('#tabs .tab');
      const tab = tabs.nth(i);
      const routeArg = await tab.getAttribute('data-arg');
      expect(routeArg).toBeTruthy();
      await activate(page, tab, testInfo);
      await expect(page.locator('#tabs .tab')).toHaveCount(4);
      await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', routeArg);
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

  await seedHarvestAndOpen(page, testInfo);
  const close = page.locator('#overlay [data-act="closeModal"]').first();
  await expect(close).toBeVisible();
  await activate(page, close, testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0);

  await seedHarvestAndOpen(page, testInfo);
  const claim = page.locator('#overlay [data-act="harvestClaim"]');
  await expect(claim).toBeVisible();
  await activate(page, claim, testInfo);
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
