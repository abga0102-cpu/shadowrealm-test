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
  await page.waitForFunction(() => window.__srBossRetryProgressionV342 === true);
}

test('V342 clearing 4-14 after a previous 4-15 loss immediately reopens 4-15', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => new Promise((resolve) => {
    // Facile 4-14 = internal floor 74. Facile 4-15 = internal floor 75 (Boss).
    S.floor = 74;
    S.step = 2;
    S.recordFloor = Math.max(Number(S.recordFloor) || 1, 74);
    S.checkpoint = Math.max(Number(S.checkpoint) || 1, 74);
    S.pendingBossFloor = 75;
    S.bossClears = S.bossClears || {};
    delete S.bossClears['75'];

    const c = spawnCampaign(S);
    c.status = 'won';
    handleCombatEnd(c);

    setTimeout(() => {
      resolve({
        floor: S.floor,
        step: S.step,
        pendingBossFloor: Number(S.pendingBossFloor || 0),
        label: __srCampaignLabel(S.floor),
        combatFloor: combat && combat.floor,
        combatBoss: !!(combat && combat.boss),
      });
    }, 90);
  }));

  expect(result).toEqual({
    floor: 75,
    step: 1,
    pendingBossFloor: 0,
    label: 'Facile · 4-15',
    combatFloor: 75,
    combatBoss: true,
  });
});
