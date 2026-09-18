const { test, expect } = require('@playwright/test');

test('V386 duplicate level-up shows the same centered green Power popup as equipment upgrades', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof summonSkill === 'function' && typeof queuePowerDelta === 'function');

  await page.evaluate(() => {
    const common = (SKILLS_BY_RARITY.COMMUN || []).map((d) => d.id);
    common.forEach((id) => { S.skills[id] = { level: 1, count: 0 }; });
    const id = common[0];
    S.skills[id].count = skillDupesNeeded(1) - 1;
    S.skillSlots[0] = id;
    S.eclat = 999;
    S.power = computePower(S);
    D = computeDerived(S);

    const oldRandom = Math.random;
    Math.random = () => 0;
    const r = summonSkill(1);
    Math.random = oldRandom;

    if (!r.length || !r[0].leveled) throw new Error('forced duplicate did not level');
    showSkillResult(r);
    if (Number(r.powerDelta) > 0) queuePowerDelta(Number(r.powerDelta));
  });

  await expect(page.locator('#powerDelta')).toBeVisible();
  await expect(page.locator('#powerDelta')).toHaveClass(/up/);
  await expect(page.locator('#powerDelta')).toContainText('Puissance');
  await expect(page.locator('#powerDelta')).toContainText('+');
  await expect(page.locator('#overlay')).toContainText('Niv. 1 → 2');
});
