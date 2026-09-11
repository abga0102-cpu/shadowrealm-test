const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Phase 4B keeps V207 as the sole save-import source owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const pricing = source('sanctuary-pricing-v125.js');
  const importer = source('import-save-guard-v207.js');
  const index = source('index.html');

  expect(pricing).not.toContain('ACT.importSave');
  expect(pricing).not.toContain('__srImportGuardV206');
  expect(pricing).not.toContain('IMPORT_GUARD_V206');

  expect(fs.existsSync(path.join(root, 'import-save-guard-v204.js'))).toBe(false);
  expect(index).not.toContain('import-save-guard-v204.js');
  expect(index.match(/import-save-guard-v207\.js/g) || []).toHaveLength(1);

  expect(importer).toContain('Authoritative save import guard V207');
  expect(importer).toContain('ACT.importSave=function()');
  expect(importer).toContain('raw.raids');
  expect(importer).toContain('RAID_IDS');
  expect(importer).toContain('raw.universalKeys');
});

test('the fully loaded game keeps V207 as the runtime save-import owner', async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof ACT === 'object' && typeof ACT.importSave === 'function' && typeof S !== 'undefined');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const owner = await page.evaluate(() => {
    const body = String(ACT.importSave);
    return {
      v207Loaded: window.__srImportSaveGuardV207 === true,
      staleV206Loaded: window.__srImportGuardV206 === true,
      restoresRaidKeys: body.includes('raw.raids') && body.includes('RAID_IDS'),
      restoresUniversalKeys: body.includes('raw.universalKeys') && body.includes('S.universalKeys'),
      pricingLoaded: window.__srSanctuaryPricingV125 === true,
    };
  });

  expect(owner.v207Loaded).toBe(true);
  expect(owner.staleV206Loaded).toBe(false);
  expect(owner.restoresRaidKeys).toBe(true);
  expect(owner.restoresUniversalKeys).toBe(true);
  expect(owner.pricingLoaded).toBe(true);
});

test('V207 import preserves explicit zero raid and universal-key counts', async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof ACT === 'object' && typeof ACT.importSave === 'function' && typeof S !== 'undefined' && Array.isArray(RAID_IDS));

  const result = await page.evaluate(async () => {
    const raw = JSON.parse(JSON.stringify(S));
    raw.universalKeys = 0;
    raw.raids = raw.raids && typeof raw.raids === 'object' ? raw.raids : {};
    RAID_IDS.forEach((id) => {
      raw.raids[id] = raw.raids[id] && typeof raw.raids[id] === 'object' ? raw.raids[id] : {};
      raw.raids[id].keys = 0;
    });

    const nativeCreate = document.createElement.bind(document);
    const NativeFileReader = window.FileReader;
    document.createElement = function(tagName) {
      const el = nativeCreate(tagName);
      if (String(tagName).toLowerCase() === 'input') {
        el.click = function() {
          Object.defineProperty(el, 'files', { value: [{ name: 'phase4b-save.json' }], configurable: true });
          if (typeof el.onchange === 'function') el.onchange();
        };
      }
      return el;
    };
    window.FileReader = class {
      readAsText() {
        this.result = JSON.stringify(raw);
        Promise.resolve().then(() => { if (typeof this.onload === 'function') this.onload(); });
      }
    };

    try {
      ACT.importSave();
      await new Promise((resolve) => setTimeout(resolve, 80));
      return {
        universalKeys: S.universalKeys,
        raidKeys: RAID_IDS.map((id) => Number(S.raids && S.raids[id] && S.raids[id].keys)),
      };
    } finally {
      document.createElement = nativeCreate;
      window.FileReader = NativeFileReader;
    }
  });

  expect(result.universalKeys).toBe(0);
  expect(result.raidKeys.length).toBeGreaterThan(0);
  expect(result.raidKeys.every((keys) => keys === 0)).toBe(true);
});
