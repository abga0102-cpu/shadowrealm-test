const { test, expect } = require('@playwright/test');

test('V335 Raid Familier pays 350 Essence then +5 per level and keeps Raid Competence unchanged', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() =>
    typeof window.raidReward === 'function' &&
    window.__srRaidSummonEconomyConfigV291 &&
    typeof window.__srApplyRaidFamilierEssenceCompensationV335 === 'function'
  );

  const rewards = await page.evaluate(() => ({
    familier1: raidReward('familier', 1),
    familier2: raidReward('familier', 2),
    familier10: raidReward('familier', 10),
    familier50: raidReward('familier', 50),
    competence1: raidReward('competence', 1),
    competence2: raidReward('competence', 2),
    config: window.__srRaidSummonEconomyConfigV291
  }));

  expect(rewards.familier1).toBe(350);
  expect(rewards.familier2).toBe(355);
  expect(rewards.familier10).toBe(395);
  expect(rewards.familier50).toBe(595);
  expect(rewards.competence1).toBe(250);
  expect(rewards.competence2).toBe(260);
  expect(rewards.config.familier.base).toBe(350);
  expect(rewards.config.familier.perLevel).toBe(5);
});

test('V335 compensates already-cleared Raid Familier levels exactly once', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() => typeof window.__srApplyRaidFamilierEssenceCompensationV335 === 'function');

  const result = await page.evaluate(() => {
    const state = {
      essence: 10,
      raids: { familier: { record: 3 } }
    };
    const first = window.__srApplyRaidFamilierEssenceCompensationV335(state);
    const afterFirst = state.essence;
    const markerAfterFirst = state.raidFamilierEssenceCompensationV335;
    const second = window.__srApplyRaidFamilierEssenceCompensationV335(state);
    return { first, second, afterFirst, afterSecond: state.essence, markerAfterFirst };
  });

  // Old V291 first-clear rewards: 250, 260, 270.
  // V335 first-clear rewards:        350, 355, 360.
  // Guaranteed make-good:            100 + 95 + 90 = 285 Essence.
  expect(result.first.changed).toBe(true);
  expect(result.first.paid).toBe(285);
  expect(result.afterFirst).toBe(295);
  expect(result.markerAfterFirst.processed).toBe(true);
  expect(result.markerAfterFirst.record).toBe(3);
  expect(result.markerAfterFirst.paid).toBe(285);
  expect(result.second.changed).toBe(false);
  expect(result.second.paid).toBe(0);
  expect(result.afterSecond).toBe(295);
});

test('V335 compensation also survives the import migration lifecycle', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() =>
    typeof window.migrate === 'function' &&
    typeof window.__srApplyRaidFamilierEssenceCompensationV335 === 'function'
  );

  const imported = await page.evaluate(() => {
    const raw = {
      essence: 0,
      raids: { familier: { level: 4, keys: 2, record: 3, stars: 0 } }
    };
    const once = migrate(raw, 'V335 Import Test');
    const essenceOnce = once.essence;
    const markerOnce = once.raidFamilierEssenceCompensationV335;
    const twice = migrate(once, 'V335 Import Test');
    return {
      essenceOnce,
      essenceTwice: twice.essence,
      markerOnce,
      markerTwice: twice.raidFamilierEssenceCompensationV335
    };
  });

  expect(imported.essenceOnce).toBe(285);
  expect(imported.essenceTwice).toBe(285);
  expect(imported.markerOnce.processed).toBe(true);
  expect(imported.markerOnce.paid).toBe(285);
  expect(imported.markerTwice.processed).toBe(true);
  expect(imported.markerTwice.paid).toBe(285);
});
