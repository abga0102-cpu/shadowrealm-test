const { test, expect } = require('@playwright/test');

test('campaign defeat returns to the previous checkpoint and starts a fresh playable fight', async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__smoke && typeof spawnCampaign === 'function' && typeof tick === 'function');

  const before = await page.evaluate(() => {
    const H = window.__smoke;
    update((st) => {
      st.level = 40;
      st.floor = 6;
      st.step = 2;
      st.recordFloor = Math.max(st.recordFloor || 1, 6);
      st.checkpoint = 5;
      st.pendingBossFloor = 0;
      st.stats = { sante: 100, degats: 100, crit: 0, critred: 0 };
      st.skills = {};
      st.skillSlots = [null, null, null, null, null];
      st.autoSkills = false;
      st.pets = [];
      st.activePetId = null;
    });
    H.D = computeDerived(H.S);
    H.combat = spawnCampaign(H.S);
    const defeated = H.combat;
    defeated.heroHP = 0;
    defeated.status = 'lost';
    defeated.endAt = Date.now() - 1;
    defeated._ended = false;
    defeated.__deathRecoveryFixture = true;

    // Exercise the real terminal-combat lifecycle. This is where a failed
    // combat-end hook used to leave _ended=true forever on the dead combat.
    tick();

    return {
      floor: H.S.floor,
      step: H.S.step,
      checkpoint: H.S.checkpoint,
      terminalProcessed: defeated._ended === true,
      oldCombatStillInstalled: H.combat === defeated,
    };
  });

  expect(before.floor).toBe(5);
  expect(before.step).toBe(1);
  expect(before.checkpoint).toBe(5);
  expect(before.terminalProcessed).toBe(true);
  expect(before.oldCombatStillInstalled).toBe(true);

  await expect.poll(async () => page.evaluate(() => {
    const H = window.__smoke;
    return {
      floor: H.S.floor,
      step: H.S.step,
      combatFloor: H.combat && H.combat.floor,
      combatStep: H.combat && H.combat.step,
      combatStatus: H.combat && H.combat.status,
      fullHp: !!H.combat && H.combat.heroHP === H.combat.heroMaxHP && H.combat.heroHP > 0,
      freshCombat: !!H.combat && !H.combat.__deathRecoveryFixture,
    };
  }), { timeout: 3000 }).toEqual({
    floor: 5,
    step: 1,
    combatFloor: 5,
    combatStep: 1,
    combatStatus: 'fight',
    fullHp: true,
    freshCombat: true,
  });

  await expect(page.locator('#tabs .tab').first()).toBeVisible();
  await page.locator('#tabs .tab').nth(1).click();
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
