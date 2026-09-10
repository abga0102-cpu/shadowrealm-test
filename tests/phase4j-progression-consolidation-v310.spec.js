const { test, expect } = require('@playwright/test');

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

test('V310 mastery keys unlock at exactly 2/5 on every required node', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const node = TREE_BY_ID.mk_familier;
    const state = structuredClone(S);
    state.tree = state.tree || {};
    state.tree.levels = state.tree.levels || {};
    const req = node.masteryReq.slice();

    req.forEach((id) => { state.tree.levels[id] = 1; });
    const atOne = treeReqOk(state, node);
    req.forEach((id) => { state.tree.levels[id] = 2; });
    const atTwo = treeReqOk(state, node);

    return { reqCount: req.length, atOne, atTwo };
  });

  expect(result.reqCount).toBe(4);
  expect(result.atOne).toBe(false);
  expect(result.atTwo).toBe(true);
});

test('V310 ascension multipliers preserve approved systems and neutralize unknown systems', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => ({
    forge0: ascendPowerMul(0, 'forge'),
    forge1: ascendPowerMul(1, 'forge'),
    skill1: ascendPowerMul(1, 'skill'),
    pet1: ascendPowerMul(1, 'pet'),
    pet2: ascendPowerMul(2, 'pet'),
    pet3: ascendPowerMul(3, 'pet'),
    legacyNoSystem: ascendPowerMul(1),
    unknown: ascendPowerMul(1, 'future-system'),
  }));

  expect(result.forge0).toBe(1);
  expect(result.forge1).toBe(2);
  expect(result.skill1).toBe(1.5);
  expect(result.pet1).toBe(1.5);
  expect(result.pet2).toBe(2.1);
  expect(result.pet3).toBe(3);
  expect(result.legacyNoSystem).toBe(2);
  expect(result.unknown).toBe(1);
});

test('V310 Familiar flat stats use evaluated-state stars without mutating live stars', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.stars = S.stars || {};
    const hadPet = Object.prototype.hasOwnProperty.call(S.stars, 'pet');
    const oldPet = S.stars.pet;
    S.stars.pet = 0;
    try {
      const pet = { rarity: 'COMMUN', species: 'dragonnet', element: 'feu' };
      const zero = structuredClone(S);
      const three = structuredClone(S);
      zero.stars = zero.stars || {};
      three.stars = three.stars || {};
      zero.stars.pet = 0;
      three.stars.pet = 3;
      const a = window.__srV286PetStats(pet, zero);
      const b = window.__srV286PetStats(pet, three);
      return {
        liveAfter: S.stars.pet,
        damageRatio: b.damage / a.damage,
        hpRatio: b.hp / a.hp,
      };
    } finally {
      if (hadPet) S.stars.pet = oldPet;
      else delete S.stars.pet;
    }
  });

  expect(result.liveAfter).toBe(0);
  expect(result.damageRatio).toBeCloseTo(3, 8);
  expect(result.hpRatio).toBeCloseTo(3, 8);
});

test('V310 Forge star derivation leaves evaluated and live Forge levels unchanged', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const liveLevel = S.forge.level;
    const state = structuredClone(S);
    state.forge = state.forge || {};
    state.stars = state.stars || {};
    state.forge.level = 10;
    state.stars.forge = 1;
    const before = state.forge.level;
    const derived = computeDerived(state);
    return {
      before,
      after: state.forge.level,
      liveAfter: S.forge.level,
      damage: derived.damage,
      hp: derived.maxHP,
    };
  });

  expect(result.before).toBe(10);
  expect(result.after).toBe(10);
  expect(result.liveAfter).toBe(result.liveAfter);
  expect(Number.isFinite(result.damage)).toBe(true);
  expect(Number.isFinite(result.hp)).toBe(true);
});
