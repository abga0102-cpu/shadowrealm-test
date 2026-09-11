const { test, expect } = require('@playwright/test');

test('campaign defeat synchronously returns to checkpoint and keeps the fresh fight playable', async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() =>
    window.__smoke &&
    window.__srCampaignLossImmediateRestartV156 === true &&
    typeof spawnCampaign === 'function' &&
    typeof tick === 'function'
  );

  const recovered = await page.evaluate(() => {
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

    // Exercise the real terminal-combat lifecycle. Recovery must be complete
    // before this call returns; a later timer is not an acceptable dependency.
    tick();

    const fresh = H.combat;
    if (fresh) fresh.__deathRecoveryStableMarker = 'stable';

    return {
      floor: H.S.floor,
      step: H.S.step,
      checkpoint: H.S.checkpoint,
      terminalProcessed: defeated._ended === true,
      oldCombatStillInstalled: fresh === defeated,
      combatFloor: fresh && fresh.floor,
      combatStep: fresh && fresh.step,
      combatStatus: fresh && fresh.status,
      fullHp: !!fresh && fresh.heroHP === fresh.heroMaxHP && fresh.heroHP > 0,
      freshCombat: !!fresh && !fresh.__deathRecoveryFixture,
      marker: fresh && fresh.__deathRecoveryStableMarker,
    };
  });

  expect(recovered).toEqual({
    floor: 5,
    step: 1,
    checkpoint: 5,
    terminalProcessed: true,
    oldCombatStillInstalled: false,
    combatFloor: 5,
    combatStep: 1,
    combatStatus: 'fight',
    fullHp: true,
    freshCombat: true,
    marker: 'stable',
  });

  // Prove there is no stale 40 ms callback waiting to replace the fresh fight.
  await page.waitForTimeout(100);
  const stable = await page.evaluate(() => ({
    marker: window.__smoke.combat && window.__smoke.combat.__deathRecoveryStableMarker,
    status: window.__smoke.combat && window.__smoke.combat.status,
    floor: window.__smoke.combat && window.__smoke.combat.floor,
    step: window.__smoke.combat && window.__smoke.combat.step,
  }));
  expect(stable).toEqual({ marker: 'stable', status: 'fight', floor: 5, step: 1 });

  await expect(page.locator('#tabs .tab').first()).toBeVisible();
  await page.locator('#tabs .tab').nth(1).click();
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
