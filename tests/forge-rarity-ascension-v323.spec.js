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

function closeTo(actual, expected, digits = 8) {
  expect(Number(actual)).toBeCloseTo(expected, digits);
}

test('V501 unlocks the requested Forge equipment ladder and retires Infernal', async ({ page }) => {
  await openCleanGame(page);

  const rows = await page.evaluate(() => {
    const at = (level, ascension = 0, stars = 0) => getRates('forge', level, ascension, stars);
    return {
      e14: at(14), e15: at(15),
      h21: at(21), h22: at(22),
      m27: at(27), m28: at(28),
      a34: at(34), a35: at(35),
      l39: at(39), l40: at(40),
      i44: at(44), i45: at(45),
      d47a1: at(47, 1), d48a0: at(48, 0), d50a1: at(50, 1), d50a3: at(50, 3),
      floors: {
        epique: RARITY_MIN_FORGE.EPIQUE,
        heroique: RARITY_MIN_FORGE.HEROIQUE,
        mythique: RARITY_MIN_FORGE.MYTHIQUE,
        artefact: RARITY_MIN_FORGE.ARTEFACT,
        legendaire: RARITY_MIN_FORGE.LEGENDAIRE,
        immortel: RARITY_MIN_FORGE.IMMORTEL,
        divin: RARITY_MIN_FORGE.DIVIN,
      },
      activeOrder: orderFor('forge').slice(),
    };
  });

  closeTo(rows.e14.EPIQUE, 0); closeTo(rows.e15.EPIQUE, .25);
  closeTo(rows.h21.HEROIQUE, 0); closeTo(rows.h22.HEROIQUE, .25);
  closeTo(rows.m27.MYTHIQUE, 0); closeTo(rows.m28.MYTHIQUE, .25);
  closeTo(rows.a34.ARTEFACT, 0); closeTo(rows.a35.ARTEFACT, .25);
  closeTo(rows.l39.LEGENDAIRE, 0); closeTo(rows.l40.LEGENDAIRE, .25);
  closeTo(rows.i44.IMMORTEL, 0); closeTo(rows.i45.IMMORTEL, .25);
  closeTo(rows.d47a1.DIVIN, 0);
  closeTo(rows.d48a0.DIVIN, 0);
  closeTo(rows.d50a1.DIVIN, 2);
  closeTo(rows.d50a3.DIVIN, 6);
  expect(rows.floors).toEqual({ epique:15, heroique:22, mythique:28, artefact:35, legendaire:40, immortel:45, divin:48 });
  expect(rows.activeOrder).toEqual(['COMMUN','PEU_COMMUN','RARE','EPIQUE','HEROIQUE','MYTHIQUE','ARTEFACT','LEGENDAIRE','IMMORTEL','DIVIN']);

  for (const row of [rows.e15, rows.h22, rows.m28, rows.a35, rows.l40, rows.i45, rows.d50a1, rows.d50a3]) {
    closeTo(row.INFERNAL, 0);
    closeTo(Object.values(row).reduce((sum, value) => sum + Number(value || 0), 0), 100);
  }
});

test('V501 Forge Ascension removes only Commun then Peu commun', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => ({
    zero: getRates('forge', 50, 0, 0),
    one: getRates('forge', 50, 0, 1),
    two: getRates('forge', 50, 0, 2),
    oneReset: gateForgeRates(getRates('forge', 1, 0, 1), 1),
    twoReset: gateForgeRates(getRates('forge', 1, 0, 2), 1),
    legacyExtra: getRates('forge', 50, 0, 4),
  }));

  expect(result.zero.COMMUN).toBeGreaterThan(0);
  expect(result.zero.PEU_COMMUN).toBeGreaterThan(0);

  closeTo(result.one.COMMUN, 0);
  expect(result.one.PEU_COMMUN).toBeGreaterThan(0);

  closeTo(result.two.COMMUN, 0);
  closeTo(result.two.PEU_COMMUN, 0);
  expect(result.two.RARE).toBeGreaterThan(0);
  expect(result.two.EPIQUE).toBeGreaterThan(0);
  expect(result.two.HEROIQUE).toBeGreaterThan(0);
  expect(result.two.MYTHIQUE).toBeGreaterThan(0);
  expect(result.two.ARTEFACT).toBeGreaterThan(0);
  expect(result.two.LEGENDAIRE).toBeGreaterThan(0);
  expect(result.two.IMMORTEL).toBeGreaterThan(0);
  closeTo(result.two.INFERNAL, 0);

  closeTo(result.oneReset.COMMUN, 0);
  closeTo(result.oneReset.PEU_COMMUN, 100);
  closeTo(result.twoReset.COMMUN, 0);
  closeTo(result.twoReset.PEU_COMMUN, 0);
  closeTo(result.twoReset.RARE, 100);

  for (const key of Object.keys(result.two)) closeTo(result.legacyExtra[key], result.two[key]);
  closeTo(Object.values(result.two).reduce((sum, value) => sum + Number(value || 0), 0), 100);
});

test('V501 caps equipment Ascension at 2 while preserving the existing first-star x2 power', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const can = [];
    for (let stars = 0; stars <= 2; stars += 1) {
      const state = defaultState('QA');
      state.forge.level = RULES.FORGE_MAX;
      state.stars.forge = stars;
      can.push(canAscend(state, 'forge'));
    }
    return {
      can,
      multipliers: [0, 1, 2].map((stars) => ascendPowerMul(stars, 'forge')),
      config: window.__srProgressionStabilityConfigV304 && window.__srProgressionStabilityConfigV304.forgeRarityAscensionV501,
      rarityConfig: window.__srEquipmentBalanceV224 && window.__srEquipmentBalanceV224.forgeRarityV501,
    };
  });

  expect(result.can).toEqual([true, true, false]);
  expect(result.multipliers).toEqual([1, 2, 2]);
  expect(result.config.maxStars).toBe(2);
  expect(result.config.removedByStar).toEqual({ 1: 'Commun', 2: 'Peu commun' });
  expect(result.rarityConfig.infernalRetired).toBe(true);
  expect(result.rarityConfig.divineCharacterAscension).toBe(1);
});

test('V501 Divin depends on character Ascension, not Forge Ascension', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => ({
    noCharacterAscensionTwoForgeStars: getRates('forge', 50, 0, 2),
    characterAscensionOneZeroForgeStars: getRates('forge', 50, 1, 0),
  }));

  closeTo(result.noCharacterAscensionTwoForgeStars.DIVIN, 0);
  closeTo(result.characterAscensionOneZeroForgeStars.DIVIN, 2);
});
