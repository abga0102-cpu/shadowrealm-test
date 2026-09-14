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
    // Current 400-stage campaign: Normal 5-4 is internal floor 44.
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
