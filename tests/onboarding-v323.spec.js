const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__srOnboardingV323 === true);
}

test('V323 onboarding starts without mineral and auto skills enabled', async ({ page }) => {
  await openCleanGame(page);
  const state = await page.evaluate(() => ({ minerai: S.minerai, autoSkills: S.autoSkills }));
  expect(state.minerai).toBe(0);
  expect(state.autoSkills).toBe(true);
});

test('1-1 final wave is a meaningful warning and 1-2 starts wounded', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.floor=1; S.step=3; S.recordFloor=1; S.checkpoint=1; S.forge.summonCount=0;
    startCampaign();
    const prelude={ flag:!!combat.__srPreludeV323, dmg:combat.enemies[0].dmg, heroMax:combat.heroMaxHP };
    S.floor=2; S.step=1; S.recordFloor=2; combat=null;
    startCampaign();
    return { prelude, killer:{ intro:!!combat.__srForgeIntroV321, hp:combat.heroHP, max:combat.heroMaxHP } };
  });
  expect(result.prelude.flag).toBe(true);
  expect(result.prelude.dmg).toBeGreaterThanOrEqual(Math.ceil(result.prelude.heroMax*0.16));
  expect(result.killer.intro).toBe(true);
  expect(result.killer.hp).toBeLessThanOrEqual(Math.ceil(result.killer.max*0.58));
});

test('forced 1-2 defeat grants exactly 250 mineral once', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.floor=2; S.step=1; S.recordFloor=2; S.checkpoint=1; S.forge.summonCount=0; S.minerai=0;
    S.tutorial=S.tutorial||{}; delete S.tutorial.forgeIntroMineralGrantV323;
    startCampaign();
    combat.status='lost';
    const c=combat;
    handleCombatEnd(c);
    const once=S.minerai;
    handleCombatEnd(c);
    return { once, twice:S.minerai, flag:!!S.tutorial.forgeIntroMineralGrantV323, autoSkills:S.autoSkills };
  });
  expect(result.once).toBe(250);
  expect(result.twice).toBe(250);
  expect(result.flag).toBe(true);
  expect(result.autoSkills).toBe(true);
});
