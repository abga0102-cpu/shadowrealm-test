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

test('Forge migration layers load before the V224 runtime authority', async () => {
  const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const v96 = index.indexOf('forge-rarity-balance-v96.js');
  const v98 = index.indexOf('forge-rarity-balance-v98.js');
  const v224 = index.indexOf('game-balance-v224.js');

  expect(v96).toBeGreaterThan(-1);
  expect(v98).toBeGreaterThan(v96);
  expect(v224).toBeGreaterThan(v98);
});

test('V224 owns new Forge equipment power independently of Forge level', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const originalRandom = Math.random;
    Math.random = () => 0.5;
    try {
      const low = makeItem('arme', 'RARE', 1);
      const high = makeItem('arme', 'RARE', 999);
      return {
        authorityLoaded: !!window.__srGameBalanceV224,
        makeItemOwned: !!(makeItem && makeItem.__srV224),
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
  expect(result.low.curve).toBe(224);
  expect(result.high.curve).toBe(224);
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
      getRatesOwned: !!(getRates && getRates.__srV224),
      divine: Number(zeroAscension && zeroAscension.DIVIN) || 0,
      total: Object.keys(zeroAscension || {}).reduce((sum, key) => sum + (Number(zeroAscension[key]) || 0), 0)
    };
  });

  expect(result.getRatesOwned).toBe(true);
  expect(result.divine).toBe(0);
  expect(result.total).toBeGreaterThan(0);
});

test('Forge arena preview follows the same fixed-base model as real drops', async ({ page }) => {
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
