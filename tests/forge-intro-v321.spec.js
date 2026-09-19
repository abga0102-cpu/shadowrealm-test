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
  await page.waitForFunction(() =>
    window.__srForgeIntroCombatV321 === true &&
    window.__srProgressionUnlocksV321 &&
    window.__srForgeIntroCombatConfigV321
  );
}

test('V321 stage 1-2 forces the pre-Forge teaching loss and then surfaces the Forge lesson', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const initial = {
      floor: S.floor,
      recordFloor: S.recordFloor,
      forgeUnlocked: __srProgressionUnlocksV321.forgeUnlocked(),
      forgeStage: __srProgressionUnlocksV321.forgeStage,
      minerai: S.minerai,
    };

    S.floor = 2;
    S.recordFloor = 2;
    S.checkpoint = 1;
    S.step = 1;
    S.pendingBossFloor = 0;
    S.forge.summonCount = 0;
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = S.tutorial.seen || {};
    S.tutorial.forgeIntroReadyV321 = false;
    S.tutorial.forgeIntroCompletedV321 = false;
    delete S.tutorial.forgeIntroMineralGrantV323;
    S.minerai = 0;

    startCampaign();
    const firstEnemy = combat.enemies[0];
    const encounter = {
      floor: combat.floor,
      tagged: !!combat.__srForgeIntroV321,
      enemyTagged: !!(firstEnemy && firstEnemy.__srForgeIntroV321),
      heroMaxHP: combat.heroMaxHP,
      enemyHP: firstEnemy && firstEnemy.maxHP,
      enemyDamage: firstEnemy && firstEnemy.dmg,
      forgeUnlockedAtStage: __srProgressionUnlocksV321.forgeUnlocked(),
    };

    combat.status = 'lost';
    const introCombat = combat;
    handleCombatEnd(introCombat);
    const mineraiOnce = S.minerai;
    const defeatsOnce = S.tutorial.forgeIntroDefeatsV321;
    handleCombatEnd(introCombat);
    const mineraiTwice = S.minerai;

    const seen = S.tutorial.seen || (S.tutorial.seen = {});
    try { Object.keys(TUTORIAL_FLOWS || {}).forEach((key) => { seen[key] = true; }); } catch (_) {}
    seen.forge = false;
    const tutorial = pendingTutorialStep();

    return {
      initial,
      encounter,
      afterLoss: {
        ready: !!S.tutorial.forgeIntroReadyV321,
        defeats: defeatsOnce,
        floor: S.floor,
        recordFloor: S.recordFloor,
        forgeUnlocked: __srProgressionUnlocksV321.forgeUnlocked(),
        mineraiOnce,
        mineraiTwice,
        mineralGranted: !!S.tutorial.forgeIntroMineralGrantV323,
      },
      tutorial,
      config: __srForgeIntroCombatConfigV321,
    };
  });

  expect(result.initial).toMatchObject({ floor: 1, forgeUnlocked: false, forgeStage: '1-2', minerai: 0 });
  expect(result.encounter).toMatchObject({ floor: 2, tagged: true, enemyTagged: true, forgeUnlockedAtStage: true });
  expect(result.encounter.enemyHP).toBeGreaterThanOrEqual(result.encounter.heroMaxHP * 1000);
  expect(result.encounter.enemyDamage).toBeGreaterThanOrEqual(result.encounter.heroMaxHP * 20);

  expect(result.afterLoss.ready).toBe(true);
  expect(result.afterLoss.defeats).toBe(1);
  expect(result.afterLoss.recordFloor).toBeGreaterThanOrEqual(2);
  expect(result.afterLoss.forgeUnlocked).toBe(true);
  expect(result.afterLoss.mineraiOnce).toBe(250);
  expect(result.afterLoss.mineraiTwice).toBe(250);
  expect(result.afterLoss.mineralGranted).toBe(true);
  expect(result.tutorial).toMatchObject({ key: 'forge', title: 'Forge ton équipement' });
  expect(result.tutorial.sub).toContain('Puissance');
  expect(result.config).toMatchObject({ floor: 2, stage: '1-2', hpVsHero: 1000, damageVsHero: 20 });
});

test('V408 reload recovers 250 mineral for a save that already lost 1-2 during the regression', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    S.floor = 2;
    S.recordFloor = 2;
    S.checkpoint = 1;
    S.step = 1;
    S.minerai = 0;
    S.forge.summonCount = 0;
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = S.tutorial.seen || {};
    S.tutorial.forgeIntroReadyV321 = true;
    delete S.tutorial.forgeIntroMineralGrantV323;
    saveNow();
  });

  await page.reload();
  await page.waitForFunction(() => window.__srForgeIntroCombatV321 === true);

  const recovered = await page.evaluate(() => ({
    minerai: S.minerai,
    granted: !!(S.tutorial && S.tutorial.forgeIntroMineralGrantV323),
    ready: !!(S.tutorial && S.tutorial.forgeIntroReadyV321),
  }));

  expect(recovered).toEqual({ minerai: 250, granted: true, ready: true });
});

test('V321 first Forge craft raises fresh equipment Power, restores normal 1-2 and leaves Raid gate unchanged', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    S.floor = 2;
    S.recordFloor = 2;
    S.checkpoint = 1;
    S.step = 1;
    S.pendingBossFloor = 0;
    S.level = 1;
    S.minerai = 250;
    S.inventory = [];
    Object.keys(S.equipped || {}).forEach((slot) => { S.equipped[slot] = null; });
    S.forge.summonCount = 0;
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = S.tutorial.seen || {};
    S.tutorial.seen.forge = false;
    S.tutorial.forgeIntroReadyV321 = true;
    S.tutorial.forgeIntroCompletedV321 = false;
    S.power = computePower(S);
    D = computeDerived(S);

    const powerBefore = computePower(S);
    const drop = forgeSummon(1);
    const forged = Array.isArray(drop) && drop.length ? drop[0] : null;
    if (forged) equipItem(forged.id);
    S.power = computePower(S);
    D = computeDerived(S);
    const powerAfter = computePower(S);

    S.floor = 2;
    S.recordFloor = Math.max(Number(S.recordFloor) || 1, 2);
    S.step = 1;
    S.pendingBossFloor = 0;
    startCampaign();
    const restoredEnemy = combat.enemies[0];

    const lowRaid = defaultState('V321 low raid');
    lowRaid.level = 1;
    lowRaid.floor = 2;
    lowRaid.recordFloor = 2;
    lowRaid.minerai = 0;
    delete lowRaid.onboardingV317;
    __srV317EnsureOnboarding(lowRaid);

    const level3Raid = structuredClone(lowRaid);
    level3Raid.level = 3;
    delete level3Raid.onboardingV317;
    __srV317EnsureOnboarding(level3Raid);

    return {
      crafted: !!forged,
      summonCount: S.forge.summonCount,
      minerai: S.minerai,
      powerBefore,
      powerAfter,
      introCompleted: !!S.tutorial.forgeIntroCompletedV321,
      forgeSeen: !!S.tutorial.seen.forge,
      restored: {
        tagged: !!combat.__srForgeIntroV321,
        enemyTagged: !!(restoredEnemy && restoredEnemy.__srForgeIntroV321),
        hp: restoredEnemy && restoredEnemy.maxHP,
        canonicalHP: __srV285EnemyHP(2),
      },
      raid: {
        level1: __srV317RaidUnlocked(lowRaid),
        level3: __srV317RaidUnlocked(level3Raid),
        minHeroLevel: __srForgeRaidOnboardingConfigV317.raidDepletionMinHeroLevel,
      },
    };
  });

  expect(result.crafted).toBe(true);
  expect(result.summonCount).toBe(1);
  expect(result.minerai).toBe(240);
  expect(result.powerAfter).toBeGreaterThan(result.powerBefore);
  expect(result.introCompleted).toBe(true);
  expect(result.forgeSeen).toBe(true);

  expect(result.restored.tagged).toBe(false);
  expect(result.restored.enemyTagged).toBe(false);
  expect(result.restored.hp).toBe(result.restored.canonicalHP);

  expect(result.raid).toEqual({ level1: false, level3: true, minHeroLevel: 3 });
});
