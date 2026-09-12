const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
}

test('V315 starts Forge at 250 Minerai then unlocks Raid exactly when Forge funds run out', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const start = {
      level: S.level,
      floor: S.floor,
      minerai: S.minerai,
      cost: forgeCost(S.forge.level),
      raidUnlocked: window.__srV315RaidUnlocked(S),
      raidScreen: scrRaid(),
    };

    // Forge is already usable on floor 1, inside the requested floor 1-3 intro window.
    const first = forgeSummon(1);
    const afterFirst = {
      minerai: S.minerai,
      crafted: Array.isArray(first) ? first.length : null,
      raidUnlocked: window.__srV315RaidUnlocked(S),
    };

    // 24 more paid crafts consume the remaining 240 Minerai.
    forgeSummon(24);
    const afterDepletion = {
      minerai: S.minerai,
      summonCount: S.forge.summonCount,
      raidUnlocked: window.__srV315RaidUnlocked(S),
    };

    S.tutorial.seen.combat = true;
    S.tutorial.seen.equipement = true;
    S.tutorial.seen.competence = true;
    S.tutorial.seen.familier = true;
    S.tutorial.seen.forge = true;
    const tutorial = pendingTutorialStep();
    const unlockedRaidScreen = scrRaid();

    // A genuinely old untouched save must keep its historical 400 Minerai.
    const oldEarly = defaultState('Legacy early');
    oldEarly.firstSeen = Date.now() - 86400000;
    oldEarly.minerai = 400;
    oldEarly.level = 1;
    oldEarly.floor = 1;
    oldEarly.forge.summonCount = 0;
    oldEarly.inventory = [];
    Object.keys(oldEarly.equipped).forEach((slot) => { oldEarly.equipped[slot] = null; });
    delete oldEarly.onboardingV315;
    window.__srV315EnsureOnboarding(oldEarly);

    // Anyone who had reached the historical level-5 gate retains Raid access.
    const oldRaidPlayer = structuredClone(oldEarly);
    oldRaidPlayer.level = 5;
    delete oldRaidPlayer.onboardingV315;
    window.__srV315EnsureOnboarding(oldRaidPlayer);

    return {
      start,
      afterFirst,
      afterDepletion,
      tutorial,
      unlockedRaidScreen,
      oldEarly: {
        minerai: oldEarly.minerai,
        raidUnlocked: window.__srV315RaidUnlocked(oldEarly),
      },
      oldRaidPlayer: {
        minerai: oldRaidPlayer.minerai,
        raidUnlocked: window.__srV315RaidUnlocked(oldRaidPlayer),
        reason: oldRaidPlayer.onboardingV315.raidUnlockedReason,
      },
    };
  });

  expect(result.start.level).toBe(1);
  expect(result.start.floor).toBe(1);
  expect(result.start.minerai).toBe(250);
  expect(result.start.cost).toBe(10);
  expect(result.start.raidUnlocked).toBe(false);
  expect(result.start.raidScreen).toContain('se débloquent quand tu n’as plus assez de Minerai');

  expect(result.afterFirst.minerai).toBe(240);
  expect(result.afterFirst.raidUnlocked).toBe(false);

  expect(result.afterDepletion.minerai).toBe(0);
  expect(result.afterDepletion.summonCount).toBe(25);
  expect(result.afterDepletion.raidUnlocked).toBe(true);

  expect(result.tutorial).toMatchObject({ key: 'raid', title: 'Raids débloqués' });
  expect(result.tutorial.sub).toContain('Raid Minerai');
  expect(result.unlockedRaidScreen).not.toContain('Niveau 5');
  expect(result.unlockedRaidScreen).toContain('Raid Minerai');

  expect(result.oldEarly.minerai).toBe(400);
  expect(result.oldEarly.raidUnlocked).toBe(false);
  expect(result.oldRaidPlayer.minerai).toBe(400);
  expect(result.oldRaidPlayer.raidUnlocked).toBe(true);
  expect(result.oldRaidPlayer.reason).toBe('legacy');
});
