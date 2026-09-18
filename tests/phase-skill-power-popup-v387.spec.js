const { test, expect } = require('@playwright/test');

test('V387 duplicate level-up shows centered green Power feedback', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof summonSkill === 'function' && typeof queuePowerDelta === 'function');

  const result = await page.evaluate(() => {
    const common = (SKILLS_BY_RARITY.COMMUN || []).map((d) => d.id);
    common.forEach((id) => { S.skills[id] = { level: 1, count: 0 }; });
    const id = common[0];
    S.skills[id].count = skillDupesNeeded(1) - 1;
    S.skillSlots = [id, null, null, null, null];
    S.eclat = 999;
    S.power = computePower(S);
    D = computeDerived(S);

    const before = S.power;
    const oldRandom = Math.random;
    Math.random = () => 0;
    const r = summonSkill(1);
    Math.random = oldRandom;
    const after = S.power;

    if (r.some((x) => x && x.leveled) && Number(r.powerDelta) > 0) {
      showSkillResult(r);
      queuePowerDelta(Number(r.powerDelta));
    }
    return {
      before, after,
      leveled: !!(r[0] && r[0].leveled),
      powerDelta: Number(r.powerDelta) || 0
    };
  });

  expect(result.leveled).toBe(true);
  expect(result.after).toBeGreaterThan(result.before);
  expect(result.powerDelta).toBeGreaterThan(0);
  await expect(page.locator('#powerDelta')).toBeVisible();
  await expect(page.locator('#powerDelta')).toHaveClass(/up/);
  await expect(page.locator('#powerDelta')).toContainText('Puissance');
  await expect(page.locator('#powerDelta')).toContainText('+');
  await expect(page.locator('#overlay')).toContainText('Niv. 1 → 2');
});
