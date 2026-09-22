const { test, expect } = require('@playwright/test');

test('V426 each allocated level stat point adds +3% global Power bonus', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof heroAllocatedStatPoints === 'function' &&
    typeof heroLevelStatPoints === 'function' &&
    typeof heroStatPowerBonusPct === 'function' &&
    typeof computePower === 'function' &&
    window.__smoke
  );

  const data = await page.evaluate(() => {
    const fresh = defaultState('V426');
    fresh.statPoints = 50;
    const unspentPoints = heroLevelStatPoints(fresh);
    const unspentBonus = heroStatPowerBonusPct(fresh);

    fresh.stats.sante = 2;
    fresh.stats.degats = 3;
    fresh.stats.critred = 4;
    fresh.stats.crit = 99; // retired legacy field must never count.
    const allocated = heroAllocatedStatPoints(fresh);
    const totalPoints = heroLevelStatPoints(fresh);
    const bonus = heroStatPowerBonusPct(fresh);
    const derived = computeDerived(fresh);

    const one = defaultState('V426-one');
    const basePower = computePower(one);
    one.statPoints = 1;
    const oneAvailablePointPower = computePower(one);
    const oneAvailablePointBonus = heroStatPowerBonusPct(one);
    one.statPoints = 0;
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
      unspentPoints,
      unspentBonus,
      allocated,
      totalPoints,
      bonus,
      derivedBonus: derived.heroStatPowerBonusPct,
      derivedMul: derived.heroStatPowerMul,
      basePower,
      oneAvailablePointPower,
      oneAvailablePointBonus,
      onePointPower,
      onePointBonus: onePointDerived.heroStatPowerBonusPct,
      spent: H.S.stats.sante,
      remaining: H.S.statPoints,
      beforeAlloc,
      afterAlloc,
      heroText: scrHerosStats()
    };
  });

  expect(data.unspentPoints).toBe(50);
  expect(data.unspentBonus).toBe(150);
  expect(data.allocated).toBe(9);
  expect(data.totalPoints).toBe(59);
  expect(data.bonus).toBe(177);
  expect(data.derivedBonus).toBe(177);
  expect(data.derivedMul).toBeCloseTo(2.77, 8);

  expect(data.oneAvailablePointBonus).toBe(3);
  expect(data.oneAvailablePointPower).toBeGreaterThan(data.basePower);
  expect(data.onePointBonus).toBe(3);
  expect(data.onePointPower).toBeGreaterThan(data.basePower);

  expect(data.spent).toBe(1);
  expect(data.remaining).toBe(0);
  expect(data.afterAlloc).toBeGreaterThan(data.beforeAlloc);

  expect(data.heroText).toContain('+3 % de Puissance globale');
  expect(data.heroText).toContain('disponible ou dépensé');
  expect(data.heroText).toContain('+3% Puissance');
});

test('V426 source applies the +3% multiplier to the final global Power score', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  const source = await page.evaluate(async () => (await fetch('game-1.js?v=test')).text());
  expect(source).toContain('const HERO_STAT_POWER_PER_POINT_PCT = 3;');
  expect(source).toContain('return heroAllocatedStatPoints(s) + Math.max(0, Math.floor(Number(s && s.statPoints) || 0));');
  expect(source).toContain('const heroStatPowerMul = 1 + heroStatPowerBonusPct / 100;');
  expect(source).toContain('const power = Math.floor(rawPower * heroStatPowerMul);');
});
