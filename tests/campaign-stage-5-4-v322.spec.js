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
  await page.waitForFunction(() => window.__srCampaign800V322 === true);
}

test('V322 visible 5-4 is internal floor 84 and advances to 5-5', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const floor54 = 84;
    S.migrations = S.migrations || {};
    S.migrations.campaign800V322 = true;
    S.floor = floor54;
    S.step = 2;
    S.pendingBossFloor = 0;
    S.recordFloor = Math.max(Number(S.recordFloor) || 1, floor54);

    const meta = __srCampaignMeta(floor54);
    combat = spawnCampaign(S);
    const before = {
      floor: S.floor,
      label: __srCampaignLabel(S.floor),
      stage: meta.stage,
      kind: meta.kind,
      waves: campaignWaveCount(S.floor),
      elite: !!combat.elite,
      step: combat.step,
    };

    combat.enemies.forEach((e) => { e.hp = 0; e.alive = false; });
    tick();
    combat.endAt = Date.now() - 1;
    tick();

    return {
      before,
      floor: S.floor,
      step: S.step,
      nextLabel: __srCampaignLabel(S.floor),
      combatFloor: combat && combat.floor,
      combatStep: combat && combat.step,
      status: combat && combat.status,
    };
  });

  expect(result.before).toMatchObject({
    floor: 84,
    label: 'Facile · 5-4',
    stage: 4,
    kind: 'elite',
    waves: 2,
    elite: true,
    step: 2,
  });
  expect(result).toMatchObject({
    floor: 85,
    step: 1,
    nextLabel: 'Facile · 5-5',
    combatFloor: 85,
    combatStep: 1,
    status: 'fight',
  });
});
