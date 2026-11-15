const { test, expect } = require('@playwright/test');

test('starter grant is 100 once across reload and saved stocks survive migration', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__srStarterPacingV461);
  const result = await page.evaluate(() => {
    const initial = S.minerai;
    const migrated = [100,158,250,500].map(amount => {
      const raw=defaultState('Saved'); raw.minerai=amount;
      raw.tutorial.forgeIntroMineralGrantV323=true;
      return migrate(raw,'Saved').minerai;
    });
    S.floor=2; S.recordFloor=2; S.step=1; startCampaign();
    combat.status='lost'; handleCombatEnd(combat);
    const granted=S.minerai;
    handleCombatEnd(combat);
    const repeated=S.minerai;
    saveNow();
    return {initial,granted,repeated,migrated};
  });
  expect(result).toEqual({initial:0,granted:100,repeated:100,migrated:[100,158,250,500]});
  await page.reload();
  await page.waitForFunction(() => window.__srStarterPacingV461);
  expect(await page.evaluate(() => ({minerai:S.minerai,granted:S.tutorial.forgeIntroMineralGrantV323})))
    .toEqual({minerai:100,granted:true});
});

test('100 minerals fund ten crafts then expose the Raid intro at hero level 3', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srStarterPacingV461);
  const result=await page.evaluate(() => {
    S.floor=2; S.recordFloor=2; S.step=1; startCampaign();
    combat.status='lost'; handleCombatEnd(combat);
    S.level=3;
    const before=__srV317RaidUnlocked(S);
    for(let i=0;i<9;i++)forgeSummon(1);
    const ninth={minerai:S.minerai,unlocked:__srV317RaidUnlocked(S)};
    forgeSummon(1);
    closeModal(); nav('raid');
    return {before,ninth,minerai:S.minerai,crafts:S.forge.summonCount,
      unlocked:__srV317RaidUnlocked(S)};
  });
  expect(result).toEqual({before:false,ninth:{minerai:10,unlocked:false},minerai:0,crafts:10,unlocked:true});
  await page.getByRole('button',{name:'OK',exact:true}).click();
  await expect(page.locator('#tutorialCard')).toHaveAttribute('data-tutorial-key','raid');
});
