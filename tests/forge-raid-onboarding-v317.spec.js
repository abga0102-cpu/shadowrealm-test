const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await page.waitForFunction(() =>
    window.__srProgressionUnlocksV316 &&
    window.__srForgeRaidOnboardingConfigV317
  );
}

test('V321 moves Forge to 1-2 but keeps the V317 Raid level-3 depletion gate', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const start = {
      level: S.level,
      floor: S.floor,
      minerai: S.minerai,
      cost: forgeCost(S.forge.level),
      forgeUnlocked: __srProgressionUnlocksV316.forgeUnlocked(),
      raidUnlocked: __srV317RaidUnlocked(S),
      raidGate: RULES.RAID_UNLOCK_LEVEL,
    };

    const blockedCraft = forgeSummon(1);
    const belowForgeGate = {
      minerai: S.minerai,
      crafted: Array.isArray(blockedCraft) ? blockedCraft.length : null,
      raidUnlocked: __srV317RaidUnlocked(S),
      raidGate: RULES.RAID_UNLOCK_LEVEL,
    };

    S.level = 3;
    S.floor = 2;
    S.recordFloor = Math.max(Number(S.recordFloor) || 1, 2);
    S.tutorial = S.tutorial || {};
    S.tutorial.forgeIntroReadyV321 = true;
    S.power = computePower(S);
    D = computeDerived(S);
    const beforeDepletion = {
      forgeUnlocked: __srProgressionUnlocksV316.forgeUnlocked(),
      forgeStage: __srProgressionUnlocksV316.forgeStage,
      raidUnlocked: __srV317RaidUnlocked(S),
      raidGate: RULES.RAID_UNLOCK_LEVEL,
      raidScreen: scrRaid(),
    };

    let crafted = 0;
    for (let i = 0; i < 25; i += 1) {
      const out = forgeSummon(1);
      crafted += Array.isArray(out) ? out.length : 0;
    }
    const afterDepletion = {
      minerai: S.minerai,
      summonCount: S.forge.summonCount,
      crafted,
      raidUnlocked: __srV317RaidUnlocked(S),
      raidGate: RULES.RAID_UNLOCK_LEVEL,
      raidScreen: scrRaid(),
    };

    const seen = S.tutorial.seen || (S.tutorial.seen = {});
    try { Object.keys(TUTORIAL_FLOWS || {}).forEach((key) => { seen[key] = true; }); } catch (_) {}
    seen.combat = true;
    seen.equipement = true;
    seen.raid = false;
    const tutorial = pendingTutorialStep();

    const oldEarly = defaultState('Legacy early');
    oldEarly.firstSeen = Date.now() - 86400000;
    oldEarly.minerai = 400;
    oldEarly.level = 1;
    oldEarly.floor = 1;
    oldEarly.forge.summonCount = 0;
    oldEarly.inventory = [];
    Object.keys(oldEarly.equipped).forEach((slot) => { oldEarly.equipped[slot] = null; });
    delete oldEarly.onboardingV317;
    __srV317EnsureOnboarding(oldEarly);

    const oldRaidPlayer = structuredClone(oldEarly);
    oldRaidPlayer.level = 5;
    delete oldRaidPlayer.onboardingV317;
    __srV317EnsureOnboarding(oldRaidPlayer);

    const underRaidDepletionGate = defaultState('Under Raid gate');
    underRaidDepletionGate.level = 1;
    underRaidDepletionGate.floor = 2;
    underRaidDepletionGate.recordFloor = 2;
    underRaidDepletionGate.minerai = 0;
    delete underRaidDepletionGate.onboardingV317;
    __srV317EnsureOnboarding(underRaidDepletionGate);

    return {
      start,
      belowForgeGate,
      beforeDepletion,
      afterDepletion,
      tutorial,
      oldEarly: {
        minerai: oldEarly.minerai,
        raidUnlocked: __srV317RaidUnlocked(oldEarly),
      },
      oldRaidPlayer: {
        minerai: oldRaidPlayer.minerai,
        raidUnlocked: __srV317RaidUnlocked(oldRaidPlayer),
        reason: oldRaidPlayer.onboardingV317.raidUnlockedReason,
      },
      underRaidDepletionGate: {
        raidUnlocked: __srV317RaidUnlocked(underRaidDepletionGate),
      },
      config: __srForgeRaidOnboardingConfigV317,
    };
  });

  expect(result.start).toMatchObject({
    level: 1,
    floor: 1,
    minerai: 250,
    cost: 10,
    forgeUnlocked: false,
    raidUnlocked: false,
    raidGate: 5,
  });
  expect(result.belowForgeGate).toMatchObject({
    minerai: 250,
    crafted: 0,
    raidUnlocked: false,
    raidGate: 5,
  });

  expect(result.beforeDepletion.forgeUnlocked).toBe(true);
  expect(result.beforeDepletion.forgeStage).toBe('1-2');
  expect(result.beforeDepletion.raidUnlocked).toBe(false);
  expect(result.beforeDepletion.raidGate).toBe(5);
  expect(result.beforeDepletion.raidScreen).toContain('Niveau 5');

  expect(result.afterDepletion.minerai).toBe(0);
  expect(result.afterDepletion.summonCount).toBe(25);
  expect(result.afterDepletion.crafted).toBe(25);
  expect(result.afterDepletion.raidUnlocked).toBe(true);
  expect(result.afterDepletion.raidGate).toBe(1);
  expect(result.afterDepletion.raidScreen).not.toContain('Niveau 5');
  expect(result.afterDepletion.raidScreen).toContain('Raid Minerai');

  expect(result.tutorial).toMatchObject({ key: 'raid', title: 'Raids débloqués' });
  expect(result.tutorial.sub).toContain('Défis');
  expect(result.tutorial.sub).toContain('Raid Minerai');

  expect(result.oldEarly).toEqual({ minerai: 400, raidUnlocked: false });
  expect(result.oldRaidPlayer).toMatchObject({ minerai: 400, raidUnlocked: true, reason: 'legacy' });
  expect(result.underRaidDepletionGate.raidUnlocked).toBe(false);
  expect(result.config).toMatchObject({
    forgeUnlockLevel: 3,
    raidDepletionMinHeroLevel: 3,
    actualForgeUnlockFloor: 2,
    actualForgeUnlockStage: '1-2',
  });
});
