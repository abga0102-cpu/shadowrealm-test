const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() =>
    window.__srDustEconomyConfigV293 &&
    window.__srDustEconomyConfigV293.revision === 429 &&
    typeof upgradeItem === 'function'
  );
}

test('V429 recycling is rarity-based and independent of equipment power', async ({ page }) => {
  await openCleanGame(page);

  const values = await page.evaluate(() => {
    const cfg = window.__srDustEconomyConfigV293;
    const tiny = dustValue(S, { rarity: 'DIVIN', originalPower: 1, power: 1 });
    const huge = dustValue(S, { rarity: 'DIVIN', originalPower: 999999999, power: 999999999 });
    return {
      table: {
        commun: cfg.valueForRarity('COMMUN'),
        peuCommun: cfg.valueForRarity('PEU_COMMUN'),
        rare: cfg.valueForRarity('RARE'),
        epique: cfg.valueForRarity('EPIQUE'),
        heroique: cfg.valueForRarity('HEROIQUE'),
        mythique: cfg.valueForRarity('MYTHIQUE'),
        artefact: cfg.valueForRarity('ARTEFACT'),
        legendaire: cfg.valueForRarity('LEGENDAIRE'),
        infernal: cfg.valueForRarity('INFERNAL'),
        immortel: cfg.valueForRarity('IMMORTEL'),
        divin: cfg.valueForRarity('DIVIN'),
      },
      tiny,
      huge,
      powerIndependent: cfg.powerIndependent,
    };
  });

  expect(values.table).toEqual({
    commun: 1,
    peuCommun: 2,
    rare: 4,
    epique: 8,
    heroique: 12,
    mythique: 20,
    artefact: 35,
    legendaire: 60,
    infernal: 100,
    immortel: 160,
    divin: 250,
  });
  expect(values.tiny).toBe(250);
  expect(values.huge).toBe(250);
  expect(values.powerIndependent).toBe(true);
});

test('V429 converts legacy Dust stock once at 1:100 and retires the 7500 compensation', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const cfg = window.__srDustEconomyConfigV293;
    S.forge.dustEconomyVersion = 0;
    delete S.forge.dustEconomyV429;
    S.poussiere = 12345;

    const first = cfg.migrateStockV429();
    const afterFirst = S.poussiere;
    const second = cfg.migrateStockV429();

    return {
      first,
      afterFirst,
      second,
      afterSecond: S.poussiere,
      version: S.forge.dustEconomyVersion,
      divisor: cfg.stockDivisor,
      compensation: window.__srForgeDustIntegrityV429 && window.__srForgeDustIntegrityV429.compensation,
    };
  });

  expect(result.first.changed).toBe(true);
  expect(result.first.before).toBe(12345);
  expect(result.first.after).toBe(123);
  expect(result.afterFirst).toBe(123);
  expect(result.second.changed).toBe(false);
  expect(result.afterSecond).toBe(123);
  expect(result.version).toBe(429);
  expect(result.divisor).toBe(100);
  expect(result.compensation).toBe(0);
});

test('V429 one successful Dust upgrade adds exactly +1% of the base equipment stat', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const item = {
      id: 'v429-dust-upgrade',
      slot: 'arme',
      rarity: 'RARE',
      weaponType: 'epee',
      damage: 10000,
      hp: 0,
      baseDamage: 10000,
      baseHp: 0,
      originalPower: 10000,
      power: 10000,
      level: 0,
      upgradeBaseLevel: 0,
      affixes: [],
      powerCurveVersion: 372
    };
    S.inventory = [item];
    S.poussiere = 1000;

    const preview = itemUpgradePreview(item);
    const cost = itemUpgradeCost(item);
    const beforeDust = S.poussiere;
    const oldRandom = Math.random;
    Math.random = () => 0;
    let outcome;
    try {
      outcome = upgradeItem(item.id);
    } finally {
      Math.random = oldRandom;
    }

    return {
      preview,
      cost,
      beforeDust,
      afterDust: S.poussiere,
      outcome,
      level: item.level,
      damage: item.damage,
      gain: item.damage - 10000,
    };
  });

  expect(result.preview.gain).toBe(100);
  expect(result.cost).toBe(30);
  expect(result.afterDust).toBe(result.beforeDust - 30);
  expect(result.outcome.ok).toBe(true);
  expect(result.outcome.success).toBe(true);
  expect(result.level).toBe(1);
  expect(result.damage).toBe(10100);
  expect(result.gain).toBe(100);
});
