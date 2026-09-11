const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function openCleanGame(page) {
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
}

test('Forge balance migrations load before V224 and the V283 progression authority', async () => {
  const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const v96 = index.indexOf('forge-rarity-balance-v96.js');
  const v98 = index.indexOf('forge-rarity-balance-v98.js');
  const v224 = index.indexOf('game-balance-v224.js');
  const v283 = index.indexOf('progression-overhaul-v283.js');

  expect(v96).toBeGreaterThan(-1);
  expect(v98).toBeGreaterThan(v96);
  expect(v224).toBeGreaterThan(v98);
  expect(v283).toBeGreaterThan(v224);
});

test('retired Forge auto-batch gate history stays absent while V266 remains canonical', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const root = path.join(__dirname, '..');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const retired = [
    'forge-auto-batch-gate-v254.js',
    'forge-auto-batch-gate-v258.js',
    'forge-auto-batch-gate-v260.js',
    'forge-auto-batch-gate-v261.js',
  ];

  for (const file of retired) {
    expect(fs.existsSync(path.join(root, file))).toBe(false);
    expect(index).not.toContain(file);
  }

  expect(index).toContain('forge-auto-batch-gate-v266.js');
  const canonical = fs.readFileSync(path.join(root, 'forge-auto-batch-gate-v266.js'), 'utf8');
  expect(canonical).toContain('Canonical progression authority. No dynamic loaders.');
  expect(canonical).toContain('forgeBatch(S)');
  expect(canonical).toContain('ACT.autoForgeBatch266');
  expect(canonical).toContain('#srAutoBatch266 .srBatch266');
});

test('retired Forge presentation history stays absent while V266 panel and V273 UX remain canonical', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const root = path.join(__dirname, '..');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const retired = [
    'forge-panel-compact-v259.js',
    'forge-panel-authority-v260.js',
    'forge-panel-authority-v261.js',
    'forge-entry-animation-v263.js',
    'forge-entry-animation-v264.js',
  ];

  for (const file of retired) {
    expect(fs.existsSync(path.join(root, file))).toBe(false);
    expect(index).not.toContain(file);
  }

  expect(index).toContain('forge-panel-authority-v266.js');
  expect(index).toContain('forge-ux-v273.js');

  const panel = fs.readFileSync(path.join(root, 'forge-panel-authority-v266.js'), 'utf8');
  expect(panel).toContain('Canonical renderer-level Home Forge authority.');
  expect(panel).toContain('SCREENS.accueil=function');
  expect(panel).toContain('srForgeLootReserve266');
  expect(panel).toContain('UI-only: no economy/progression/save changes.');

  const ux = fs.readFileSync(path.join(root, 'forge-ux-v273.js'), 'utf8');
  expect(ux).toContain('Event-driven Forge loot authority');
  expect(ux).toContain('srForgeEntryAnimationV263Style');
  expect(ux).toContain('srForgeEntryAnimationV264Style');
  expect(ux).toContain('srForgeLoot273');
});

test('V283 owns current fixed-base Forge equipment power independently of Forge level', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const originalRandom = Math.random;
    Math.random = () => 0.5;
    try {
      const low = makeItem('arme', 'RARE', 1);
      const high = makeItem('arme', 'RARE', 999);
      return {
        authorityLoaded: !!window.__srProgressionOverhaulV283,
        makeItemOwned: !!(makeItem && makeItem.__srV283),
        low: {
          damage: low.damage,
          hp: low.hp,
          baseDamage: low.baseDamage,
          baseHp: low.baseHp,
          originalPower: low.originalPower,
          curve: low.powerCurveVersion
        },
        high: {
          damage: high.damage,
          hp: high.hp,
          baseDamage: high.baseDamage,
          baseHp: high.baseHp,
          originalPower: high.originalPower,
          curve: high.powerCurveVersion
        }
      };
    } finally {
      Math.random = originalRandom;
    }
  });

  expect(result.authorityLoaded).toBe(true);
  expect(result.makeItemOwned).toBe(true);
  expect(result.low.curve).toBe(283);
  expect(result.high.curve).toBe(283);
  expect(result.high.damage).toBe(result.low.damage);
  expect(result.high.hp).toBe(result.low.hp);
  expect(result.high.baseDamage).toBe(result.low.baseDamage);
  expect(result.high.baseHp).toBe(result.low.baseHp);
  expect(result.high.originalPower).toBe(result.low.originalPower);
});

test('V224 keeps Divine Forge drops locked before first Ascension', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const zeroAscension = getRates('forge', 999, 0, 999);
    return {
      authorityLoaded: !!window.__srGameBalanceV224,
      divine: Number(zeroAscension && zeroAscension.DIVIN) || 0,
      total: Object.keys(zeroAscension || {}).reduce((sum, key) => sum + (Number(zeroAscension[key]) || 0), 0)
    };
  });

  expect(result.authorityLoaded).toBe(true);
  expect(result.divine).toBe(0);
  expect(result.total).toBeCloseTo(100, 8);
});

test('Forge arena preview follows the current fixed-base model as real drops', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const originalRandom = Math.random;
    Math.random = () => 0.5;
    try {
      const low = arenaItem('arme', 'EPIQUE', 1, 0);
      const high = arenaItem('arme', 'EPIQUE', 999, 0);
      return {
        low: { damage: low.damage, hp: low.hp, quality: low.statQuality },
        high: { damage: high.damage, hp: high.hp, quality: high.statQuality }
      };
    } finally {
      Math.random = originalRandom;
    }
  });

  expect(result.high.damage).toBe(result.low.damage);
  expect(result.high.hp).toBe(result.low.hp);
  expect(result.high.quality).toBe(result.low.quality);
});
