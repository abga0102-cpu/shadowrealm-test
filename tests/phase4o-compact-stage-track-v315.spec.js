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
  await page.waitForFunction(() =>
    window.__srCompactStageTrackV315 === true &&
    typeof window.__srCampaignWaveCountV315 === 'function' &&
    typeof window.__srCompactStageTrackHTMLV315 === 'function'
  );
}

test('V315 uses the approved 3-3-3-2-1 compact encounter cadence in every chapter', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => ({
    first: Array.from({ length: 10 }, (_, i) => __srCampaignWaveCountV315(i + 1)),
    second: Array.from({ length: 10 }, (_, i) => __srCampaignWaveCountV315(i + 11)),
    difficult: Array.from({ length: 10 }, (_, i) => __srCampaignWaveCountV315(i + 51)),
    native: Array.from({ length: 10 }, (_, i) => campaignWaveCount(i + 1)),
  }));
  const approved = [3, 3, 3, 2, 1, 3, 3, 3, 2, 1];
  expect(result.first).toEqual(approved);
  expect(result.second).toEqual(approved);
  expect(result.difficult).toEqual(approved);
  expect(result.native).toEqual(approved);
});

test('V315 arena track represents only the current stage, never the whole ten-stage chapter', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    function inspect(floor, step) {
      combat = { ctx: 'campaign', floor, step };
      const t = document.createElement('template');
      t.innerHTML = __srCompactStageTrackHTMLV315(floor);
      return {
        dots: t.content.querySelectorAll('.sdot').length,
        links: t.content.querySelectorAll('i').length,
        current: t.content.querySelectorAll('.sdot.cur').length,
        completed: t.content.querySelectorAll('.sdot.on').length,
      };
    }
    return {
      s1: inspect(1, 1),
      s4: inspect(4, 2),
      s5: inspect(5, 1),
      s6: inspect(6, 3),
      s9: inspect(9, 1),
      s10: inspect(10, 1),
    };
  });
  expect(result.s1).toEqual({ dots: 3, links: 2, current: 1, completed: 0 });
  expect(result.s4).toEqual({ dots: 2, links: 1, current: 1, completed: 1 });
  expect(result.s5).toEqual({ dots: 1, links: 0, current: 1, completed: 0 });
  expect(result.s6).toEqual({ dots: 3, links: 2, current: 1, completed: 2 });
  expect(result.s9).toEqual({ dots: 2, links: 1, current: 1, completed: 0 });
  expect(result.s10).toEqual({ dots: 1, links: 0, current: 1, completed: 0 });
});

test('V315 normalizes an old 3-wave save when it lands on a newly shortened stage', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.floor = 5;
    S.step = 3;
    S.pendingBossFloor = 0;
    startCampaign();
    return { floor: S.floor, step: S.step, combatFloor: combat.floor, combatStep: combat.step, waves: campaignWaveCount(5) };
  });
  expect(result).toEqual({ floor: 5, step: 1, combatFloor: 5, combatStep: 1, waves: 1 });
});
