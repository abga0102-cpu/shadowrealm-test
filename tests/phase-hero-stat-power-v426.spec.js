const { test, expect } = require('@playwright/test');

test('V426 each allocated level stat point adds +3% global Power bonus', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof heroAllocatedStatPoints === 'function' &&
    typeof heroStatPowerBonusPct === 'function' &&
    typeof computePower === 'function' &&
    window.__smoke
  );

  const data = await page.evaluate(() => {
    const fresh = defaultState('V426');
    fresh.statPoints = 50;
    const unspentBonus = heroStatPowerBonusPct(fresh);

    fresh.stats.sante = 2;
    fresh.stats.degats = 3;
    fresh.stats.critred = 4;
    fresh.stats.crit = 99; // retired legacy field must never count.
    const allocated = heroAllocatedStatPoints(fresh);
    const bonus = heroStatPowerBonusPct(fresh);
    const derived = computeDerived(fresh);

    const one = defaultState('V426-one');
    const basePower = computePower(one);
    one.stats.sante = 1;
    const onePointPower = computePower(one);
    const onePointDerived = computeDerived(one);

    const H = window.__smoke;
    H.S.stats.sante = 0;
    H.S.stats.degats = 0;
    H.S.stats.critred = 0;
    H.S.stats.crit = 0;
    H.S.statPoints = 1;
    H.S.power = computePower(H.S);
    const beforeAlloc = H.S.power;
    allocStat('sante', 1);
    const afterAlloc = H.S.power;

    return {
      unspentBonus,
      allocated,
      bonus,
      derivedBonus: derived.heroStatPowerBonusPct,
      derivedMul: derived.heroStatPowerMul,
      basePower,
      onePointPower,
      onePointBonus: onePointDerived.heroStatPowerBonusPct,
      spent: H.S.stats.sante,
      remaining: H.S.statPoints,
      beforeAlloc,
      afterAlloc,
      heroText: scrHerosStats()
    };
  });

  expect(data.unspentBonus).toBe(0);
  expect(data.allocated).toBe(9);
  expect(data.bonus).toBe(27);
  expect(data.derivedBonus).toBe(27);
  expect(data.derivedMul).toBeCloseTo(1.27, 8);

  expect(data.onePointBonus).toBe(3);
  expect(data.onePointPower).toBeGreaterThan(data.basePower);

  expect(data.spent).toBe(1);
  expect(data.remaining).toBe(0);
  expect(data.afterAlloc).toBeGreaterThan(data.beforeAlloc);

  expect(data.heroText).toContain('+3 % de Puissance globale');
  expect(data.heroText).toContain('+3% Puissance');
});

test('V426 source applies the +3% multiplier to the final global Power score', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  const source = await page.evaluate(async () => (await fetch('game-1.js?v=test')).text());
  expect(source).toContain('const HERO_STAT_POWER_PER_POINT_PCT = 3;');
  expect(source).toContain('const heroStatPowerMul = 1 + heroStatPowerBonusPct / 100;');
  expect(source).toContain('const power = Math.floor(rawPower * heroStatPowerMul);');
});
