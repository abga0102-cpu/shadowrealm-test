const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('shadowreach.save.local');
      localStorage.removeItem('shadowreach.social.v1.messages');
    } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__srForgeMasterStageFlowV316 === true);
}

test('visible stage 5-4 clears after its Elite wave and advances to 5-5', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.floor = 44;
    S.step = 2;
    S.pendingBossFloor = 0;
    S.recordFloor = Math.max(Number(S.recordFloor) || 1, 44);

    const c = spawnCampaign(S);
    const before = {
      label: __srCampaignLabel(44),
      waves: campaignWaveCount(44),
      elite: !!c.elite,
      step: c.step,
    };

    c.status = 'won';
    handleCombatEnd(c);

    return {
      before,
      floor: S.floor,
      step: S.step,
      nextLabel: __srCampaignLabel(S.floor),
    };
  });

  expect(result.before).toMatchObject({ label: 'Normal · 5-4', waves: 2, elite: true, step: 2 });
  expect(result.floor).toBe(45);
  expect(result.step).toBe(1);
  expect(result.nextLabel).toBe('Normal · 5-5');
});

test('real settle path restarts campaign on 5-5 after winning Elite 5-4', async ({ page }) => {
  await openCleanGame(page);

  const before = await page.evaluate(() => {
    S.floor = 44;
    S.step = 2;
    S.pendingBossFloor = 0;
    S.recordFloor = Math.max(Number(S.recordFloor) || 1, 44);
    combat = spawnCampaign(S);
    combat.status = 'won';
    combat.endAt = Date.now() - 1;
    combat._ended = false;
    return {
      floor: S.floor,
      step: S.step,
      combatFloor: combat.floor,
      combatStep: combat.step,
      elite: !!combat.elite,
      waves: campaignWaveCount(combat.floor),
    };
  });

  expect(before).toMatchObject({ floor: 44, step: 2, combatFloor: 44, combatStep: 2, elite: true, waves: 2 });

  await page.evaluate(() => tick());
  await page.waitForFunction(() => S.floor === 45 && S.step === 1 && combat && combat.floor === 45 && combat.step === 1);

  const after = await page.evaluate(() => ({
    floor: S.floor,
    step: S.step,
    label: __srCampaignLabel(S.floor),
    combatFloor: combat && combat.floor,
    combatStep: combat && combat.step,
    status: combat && combat.status,
  }));

  expect(after).toMatchObject({
    floor: 45,
    step: 1,
    label: 'Normal · 5-5',
    combatFloor: 45,
    combatStep: 1,
    status: 'fight',
  });
});
