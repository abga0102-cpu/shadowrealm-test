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
  await page.waitForFunction(() =>
    window.__srProgressionStabilityConfigV304 &&
    window.__srEquipmentBalanceV224
  );
}

function closeTo(actual, expected, digits = 8) {
  expect(Number(actual)).toBeCloseTo(expected, digits);
}

test('Forge 0★ still ends at Artefact and base rarity progression is unchanged', async ({ page }) => {
  await openCleanGame(page);

  const rows = await page.evaluate(() => ({
    f1: getRates('forge', 1, 0, 0),
    f5: getRates('forge', 5, 0, 0),
    f6: getRates('forge', 6, 0, 0),
    f13: getRates('forge', 13, 0, 0),
    f14: getRates('forge', 14, 0, 0),
    f21: getRates('forge', 21, 0, 0),
    f22: getRates('forge', 22, 0, 0),
    f50: getRates('forge', 50, 3, 0),
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

test('Forge ★/★★/★★★ unlock Légendaire/Infernal/Immortel, never a fourth Forge star', async ({ page }) => {
  await openCleanGame(page);

  const rows = await page.evaluate(() => {
    const at = (level, ascension, stars) => getRates('forge', level, ascension, stars);
    return {
      s1f44: at(44, 0, 1), s1f45: at(45, 0, 1), s1f50: at(50, 0, 1),
      s2f45: at(45, 0, 2), s2f50: at(50, 0, 2),
      s3f45: at(45, 0, 3), s3f50: at(50, 0, 3),
      legacy4f50: at(50, 0, 4),
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

  closeTo(rows.s2f45.INFERNAL, 0.25);
  closeTo(rows.s2f50.LEGENDAIRE, 1);
  closeTo(rows.s2f50.INFERNAL, 1);
  closeTo(rows.s2f50.IMMORTEL, 0);

  closeTo(rows.s3f45.IMMORTEL, 0.25);
  closeTo(rows.s3f50.LEGENDAIRE, 1);
  closeTo(rows.s3f50.INFERNAL, 1);
  closeTo(rows.s3f50.IMMORTEL, 1);
  closeTo(rows.s3f50.DIVIN, 0);
  closeTo(rows.s3f50.COMMUN, 36);

  // Legacy raw 4★ input is treated as the approved 3★ ceiling.
  expect(rows.legacy4f50).toEqual(rows.s3f50);
});

test('Forge Divin requires ★★★ plus at least one global character Ascension', async ({ page }) => {
  await openCleanGame(page);

  const rows = await page.evaluate(() => ({
    zeroStarsAscended: getRates('forge', 50, 1, 0),
    threeStarsNoAscension: getRates('forge', 50, 0, 3),
    threeStarsAscended45: getRates('forge', 45, 1, 3),
    threeStarsAscended50: getRates('forge', 50, 1, 3),
  }));

  closeTo(rows.zeroStarsAscended.DIVIN, 0);
  closeTo(rows.threeStarsNoAscension.DIVIN, 0);
  closeTo(rows.threeStarsAscended45.DIVIN, 0.25);
  closeTo(rows.threeStarsAscended50.DIVIN, 1);
  closeTo(rows.threeStarsAscended50.COMMUN, 35);
  closeTo(Object.values(rows.threeStarsAscended50).reduce((sum, value) => sum + Number(value || 0), 0), 100);
});

test('Forge Ascension cap is 3★ while legacy raw 4★ save data is preserved non-destructively', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const can = [];
    for (let rawStars = 0; rawStars <= 4; rawStars += 1) {
      const state = defaultState('QA');
      state.forge.level = RULES.FORGE_MAX;
      state.stars = state.stars || {};
      state.stars.forge = rawStars;
      can.push({
        raw: state.stars.forge,
        effective: starsOf(state, 'forge'),
        canAscend: canAscend(state, 'forge'),
      });
    }
    const cfg = window.__srProgressionStabilityConfigV304.forgeRarityAscensionV372;
    return {
      can,
      multipliers: [0, 1, 2, 3, 4].map((stars) => ascendPowerMul(stars, 'forge')),
      cfg,
      rarityCfg: window.__srEquipmentBalanceV224.forgeRarityV372,
    };
  });

  expect(result.can).toEqual([
    { raw: 0, effective: 0, canAscend: true },
    { raw: 1, effective: 1, canAscend: true },
    { raw: 2, effective: 2, canAscend: true },
    { raw: 3, effective: 3, canAscend: false },
    { raw: 4, effective: 3, canAscend: false },
  ]);
  expect(result.multipliers).toEqual([1, 2, 2, 2, 2]);
  expect(result.cfg.maxStars).toBe(3);
  expect(result.cfg.rarityByStar).toEqual({ 1: 'Légendaire', 2: 'Infernal', 3: 'Immortel' });
  expect(result.cfg.divineRequiresGlobalAscension).toBe(true);
  expect(result.cfg.legacyRawStarsPreserved).toBe(true);
  expect(result.rarityCfg.divineRequiresGlobalAscension).toBe(true);
  expect(result.rarityCfg.divineMinStars).toBe(3);
});

test('Forge UI reachability follows stars and global Ascension instead of Forge level alone', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    S.forge.level = 50;
    S.stars.forge = 0;
    S.ascension = 1;
    const ascOnly = {
      legendary: rarityAllowed('LEGENDAIRE', 50),
      divine: rarityAllowed('DIVIN', 50),
    };

    S.stars.forge = 3;
    S.ascension = 0;
    const starsOnly = {
      immortal: rarityAllowed('IMMORTEL', 50),
      divine: rarityAllowed('DIVIN', 50),
    };

    S.ascension = 1;
    const complete = {
      immortal: rarityAllowed('IMMORTEL', 50),
      divine: rarityAllowed('DIVIN', 50),
    };
    return { ascOnly, starsOnly, complete };
  });

  expect(result.ascOnly).toEqual({ legendary: false, divine: false });
  expect(result.starsOnly).toEqual({ immortal: true, divine: false });
  expect(result.complete).toEqual({ immortal: true, divine: true });
});

test('Skill mastery stars cannot unlock Divin before global character Ascension', async ({ page }) => {
  await openCleanGame(page);

  const rows = await page.evaluate(() => ({
    noStarNoAsc: getRates('skill', 50, 0, 0),
    skillStarNoAsc: getRates('skill', 50, 0, 1),
    noStarAscended: getRates('skill', 50, 1, 0),
    skillStarAscended: getRates('skill', 50, 1, 1),
  }));

  closeTo(rows.noStarNoAsc.DIVIN, 0);
  closeTo(rows.skillStarNoAsc.DIVIN, 0);
  expect(rows.noStarAscended.DIVIN).toBeGreaterThan(0);
  expect(rows.skillStarAscended.DIVIN).toBeGreaterThan(0);
});
