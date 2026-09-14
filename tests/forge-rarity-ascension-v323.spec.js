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

test('V323 every base Forge rarity starts at exactly 0.25% and 0★ ends at Artefact', async ({ page }) => {
  await openCleanGame(page);

  const rows = await page.evaluate(() => ({
    f1: getRates('forge', 1, 0, 0),
    f5: getRates('forge', 5, 0, 0),
    f6: getRates('forge', 6, 0, 0),
    f13: getRates('forge', 13, 0, 0),
    f14: getRates('forge', 14, 0, 0),
    f21: getRates('forge', 21, 0, 0),
    f22: getRates('forge', 22, 0, 0),
    f50: getRates('forge', 50, 999, 0),
  }));

  closeTo(rows.f1.RARE, 0.25);
  closeTo(rows.f5.EPIQUE, 0);
  closeTo(rows.f6.EPIQUE, 0.25);
  closeTo(rows.f13.MYTHIQUE, 0);
  closeTo(rows.f14.MYTHIQUE, 0.25);
  closeTo(rows.f21.ARTEFACT, 0);
  closeTo(rows.f22.ARTEFACT, 0.25);

  closeTo(rows.f50.COMMUN, 39);
  closeTo(rows.f50.RARE, 28);
  closeTo(rows.f50.EPIQUE, 21);
  closeTo(rows.f50.MYTHIQUE, 8);
  closeTo(rows.f50.ARTEFACT, 4);
  closeTo(rows.f50.LEGENDAIRE, 0);
  closeTo(rows.f50.INFERNAL, 0);
  closeTo(rows.f50.IMMORTEL, 0);
  closeTo(rows.f50.DIVIN, 0);
  closeTo(Object.values(rows.f50).reduce((sum, value) => sum + Number(value || 0), 0), 100);
});

test('V323 Forge stars unlock one post-Artefact rarity at Forge 45 from 0.25% to 1% at 50', async ({ page }) => {
  await openCleanGame(page);

  const rows = await page.evaluate(() => {
    const at = (level, stars) => getRates('forge', level, 0, stars);
    return {
      s1f44: at(44, 1), s1f45: at(45, 1), s1f50: at(50, 1),
      s2f44: at(44, 2), s2f45: at(45, 2), s2f50: at(50, 2),
      s3f45: at(45, 3), s3f50: at(50, 3),
      s4f45: at(45, 4), s4f50: at(50, 4),
      floors: {
        legendary: RARITY_MIN_FORGE.LEGENDAIRE,
        infernal: RARITY_MIN_FORGE.INFERNAL,
        immortal: RARITY_MIN_FORGE.IMMORTEL,
        divine: RARITY_MIN_FORGE.DIVIN,
      },
    };
  });

  expect(rows.floors).toEqual({ legendary: 45, infernal: 45, immortal: 45, divine: 45 });

  closeTo(rows.s1f44.LEGENDAIRE, 0);
  closeTo(rows.s1f45.LEGENDAIRE, 0.25);
  closeTo(rows.s1f50.LEGENDAIRE, 1);
  closeTo(rows.s1f50.INFERNAL, 0);

  closeTo(rows.s2f44.INFERNAL, 0);
  closeTo(rows.s2f45.LEGENDAIRE, 0.25);
  closeTo(rows.s2f45.INFERNAL, 0.25);
  closeTo(rows.s2f50.LEGENDAIRE, 1);
  closeTo(rows.s2f50.INFERNAL, 1);
  closeTo(rows.s2f50.IMMORTEL, 0);

  closeTo(rows.s3f45.IMMORTEL, 0.25);
  closeTo(rows.s3f50.IMMORTEL, 1);
  closeTo(rows.s3f50.DIVIN, 0);

  closeTo(rows.s4f45.DIVIN, 0.25);
  closeTo(rows.s4f50.LEGENDAIRE, 1);
  closeTo(rows.s4f50.INFERNAL, 1);
  closeTo(rows.s4f50.IMMORTEL, 1);
  closeTo(rows.s4f50.DIVIN, 1);
  closeTo(rows.s4f50.COMMUN, 35);
  closeTo(Object.values(rows.s4f50).reduce((sum, value) => sum + Number(value || 0), 0), 100);
});

test('V323 Forge can Ascend to four rarity stars without increasing power beyond the approved first-star x2', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const can = [];
    for (let stars = 0; stars <= 4; stars += 1) {
      const state = defaultState('QA');
      state.forge.level = RULES.FORGE_MAX;
      state.stars = state.stars || {};
      state.stars.forge = stars;
      can.push(canAscend(state, 'forge'));
    }
    return {
      can,
      multipliers: [0, 1, 2, 3, 4].map((stars) => ascendPowerMul(stars, 'forge')),
      config: window.__srProgressionStabilityConfigV304 && window.__srProgressionStabilityConfigV304.forgeRarityAscensionV323,
      rarityConfig: window.__srEquipmentBalanceV224 && window.__srEquipmentBalanceV224.forgeRarityV323,
    };
  });

  expect(result.can).toEqual([true, true, true, true, false]);
  expect(result.multipliers).toEqual([1, 2, 2, 2, 2]);
  expect(result.config.maxStars).toBe(4);
  expect(result.config.rarityByStar).toEqual({ 1: 'Légendaire', 2: 'Infernal', 3: 'Immortel', 4: 'Divin' });
  expect(result.rarityConfig.starUnlockLevel).toBe(45);
  closeTo(result.rarityConfig.starStartChance, 0.25);
  closeTo(result.rarityConfig.starMaxChance, 1);
});

test('V323 global character Ascension cannot bypass the Forge-star rarity ladder', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => ({
    zeroStarWithGlobalAscension: getRates('forge', 50, 999, 0),
    fourStarsWithoutGlobalAscension: getRates('forge', 50, 0, 4),
  }));

  closeTo(result.zeroStarWithGlobalAscension.LEGENDAIRE, 0);
  closeTo(result.zeroStarWithGlobalAscension.DIVIN, 0);
  closeTo(result.fourStarsWithoutGlobalAscension.DIVIN, 1);
});
