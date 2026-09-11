const { test, expect } = require('@playwright/test');

async function installDefeatFixture(page) {
  return page.evaluate(() => {
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
    H.combat.heroHP = 0;
    H.combat.status = 'lost';
    H.combat.endAt = Date.now() - 1;
    H.combat._ended = false;
    H.combat.__deathRecoveryFixture = true;
    return true;
  });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__smoke && typeof spawnCampaign === 'function' && typeof tick === 'function' && window.__srCampaignDeathRecoveryV312 === true);
});

test('campaign defeat restarts immediately without depending on a later timer task', async ({ page }) => {
  await installDefeatFixture(page);

  const result = await page.evaluate(() => {
    const H = window.__smoke;
    const defeated = H.combat;
    const realSetTimeout = window.setTimeout;
    let forbiddenDeferredRestart = false;

    window.setTimeout = function(fn, delay) {
      if (fn === startCampaign && Number(delay) === 40) {
        forbiddenDeferredRestart = true;
        throw new Error('deferred campaign restart is forbidden in this regression');
      }
      return realSetTimeout.apply(this, arguments);
    };

    try { tick(); }
    finally { window.setTimeout = realSetTimeout; }

    return {
      floor: H.S.floor,
      step: H.S.step,
      checkpoint: H.S.checkpoint,
      terminalProcessed: defeated._ended === true,
      oldCombatStillInstalled: H.combat === defeated,
      forbiddenDeferredRestart,
      combatFloor: H.combat && H.combat.floor,
      combatStep: H.combat && H.combat.step,
      combatStatus: H.combat && H.combat.status,
      fullHp: !!H.combat && H.combat.heroHP === H.combat.heroMaxHP && H.combat.heroHP > 0,
      recoveredByGuard: !!H.combat && H.combat.__srRecoveredV312 === true,
    };
  });

  expect(result).toEqual({
    floor: 5,
    step: 1,
    checkpoint: 5,
    terminalProcessed: true,
    oldCombatStillInstalled: false,
    forbiddenDeferredRestart: false,
    combatFloor: 5,
    combatStep: 1,
    combatStatus: 'fight',
    fullHp: true,
    recoveredByGuard: false,
  });

  await expect(page.locator('#tabs .tab').first()).toBeVisible();
  await page.locator('#tabs .tab').nth(1).click();
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('campaign defeat still recovers if canonical settlement throws after combat is marked ended', async ({ page }) => {
  await installDefeatFixture(page);

  const result = await page.evaluate(() => {
    const H = window.__smoke;
    const defeated = H.combat;
    const realUpdate = update;
    update = function(){ throw new Error('forced settlement failure'); };

    try { tick(); }
    finally { update = realUpdate; }

    return {
      floor: H.S.floor,
      step: H.S.step,
      checkpoint: H.S.checkpoint,
      terminalProcessed: defeated._ended === true,
      oldCombatStillInstalled: H.combat === defeated,
      combatFloor: H.combat && H.combat.floor,
      combatStep: H.combat && H.combat.step,
      combatStatus: H.combat && H.combat.status,
      fullHp: !!H.combat && H.combat.heroHP === H.combat.heroMaxHP && H.combat.heroHP > 0,
      recoveredByGuard: !!H.combat && H.combat.__srRecoveredV312 === true,
    };
  });

  expect(result).toEqual({
    floor: 5,
    step: 1,
    checkpoint: 5,
    terminalProcessed: true,
    oldCombatStillInstalled: false,
    combatFloor: 5,
    combatStep: 1,
    combatStatus: 'fight',
    fullHp: true,
    recoveredByGuard: true,
  });

  await page.locator('#tabs .tab').nth(1).click();
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
