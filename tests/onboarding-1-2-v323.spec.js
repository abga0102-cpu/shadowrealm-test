const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__srForgeIntroCombatV321 === true);
}

test('new onboarding starts with no mineral, auto skills on, and grants 250 mineral once after forced 1-2 defeat', async ({ page }) => {
  await openCleanGame(page);
  const before = await page.evaluate(() => ({ minerai: S.minerai, autoSkills: S.autoSkills }));
  expect(before.autoSkills).toBe(true);

  const result = await page.evaluate(() => {
    S.floor = 2;
    S.step = 1;
    S.recordFloor = 2;
    S.checkpoint = 1;
    S.forge.summonCount = 0;
    S.tutorial = S.tutorial || { seen: {} };
    delete S.tutorial.forgeIntroMineralGrantV323;
    combat = spawnCampaign(S);
    if (window.__srApplyForgeIntroCombatV321) window.__srApplyForgeIntroCombatV321(combat);
    combat.status = 'lost';
    handleCombatEnd(combat);
    const once = S.minerai;
    const flag = !!S.tutorial.forgeIntroMineralGrantV323;
    handleCombatEnd(combat);
    return { once, twice: S.minerai, flag, autoSkills: S.autoSkills };
  });

  expect(result.once).toBe(250);
  expect(result.twice).toBe(250);
  expect(result.flag).toBe(true);
  expect(result.autoSkills).toBe(true);
});
