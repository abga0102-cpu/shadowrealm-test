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
  await page.waitForFunction(() => window.__srStageMiniProgressV316 === true);
}

test('V316 gives every 10-stage chapter the approved 3/3/3/2/1 encounter rhythm', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => ({
    pattern: window.__srCampaignWavePatternV316.slice(),
    firstChapter: Array.from({ length: 10 }, (_, i) => window.__srCampaignWaveCountV316(i + 1)),
    secondChapter: Array.from({ length: 10 }, (_, i) => window.__srCampaignWaveCountV316(i + 11)),
    liveAuthority: Array.from({ length: 10 }, (_, i) => campaignWaveCount(i + 1)),
  }));

  const expected = [3, 3, 3, 2, 1, 3, 3, 3, 2, 1];
  expect(result.pattern).toEqual(expected);
  expect(result.firstChapter).toEqual(expected);
  expect(result.secondChapter).toEqual(expected);
  expect(result.liveAuthority).toEqual(expected);
});

test('V316 renders only the current stage mini-track, never the whole 10-stage chapter', async ({ page }) => {
  await openCleanGame(page);

  async function show(floor, step) {
    await page.evaluate(({ floor, step }) => {
      update((st) => {
        st.floor = floor;
        st.step = step;
        st.pendingBossFloor = 0;
        st.recordFloor = Math.max(Number(st.recordFloor) || 1, floor);
      });
      combat = spawnCampaign(S);
      nav('accueil');
      scheduleRender();
    }, { floor, step });
    await page.waitForTimeout(80);
    return {
      dots: await page.locator('#aTrack .srStageMiniDot').count(),
      current: await page.locator('#aTrack .srStageMiniDot.cur').count(),
      sub: await page.locator('#aSub').innerText(),
    };
  }

  expect(await show(1, 1)).toMatchObject({ dots: 3, current: 1 });
  expect((await show(1, 1)).sub).toContain('Vague 1/3');

  const stage4 = await show(4, 2);
  expect(stage4).toMatchObject({ dots: 2, current: 1 });
  expect(stage4.sub).toContain('Vague 2/2');

  const stage5 = await show(5, 1);
  expect(stage5).toMatchObject({ dots: 1, current: 1 });
  expect(stage5.sub).toContain('Vague 1/1');
  await expect(page.locator('#aTrack .srStageMiniDot')).toHaveClass(/elite/);

  const stage6 = await show(6, 1);
  expect(stage6).toMatchObject({ dots: 3, current: 1 });
  expect(stage6.sub).toContain('Vague 1/3');

  const stage9 = await show(9, 1);
  expect(stage9).toMatchObject({ dots: 2, current: 1 });
  expect(stage9.sub).toContain('Vague 1/2');

  const stage10 = await show(10, 1);
  expect(stage10).toMatchObject({ dots: 1, current: 1 });
  expect(stage10.sub).toContain('Vague 1/1');
  await expect(page.locator('#aTrack .srStageMiniDot')).toHaveClass(/boss/);
  await expect(page.locator('#aTrack .srStageMiniDot')).toHaveCount(1);
});

test('V316 encounter counts drive real campaign advancement, including elite and boss stages', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    function run(floor, step) {
      S.floor = floor;
      S.step = step;
      S.pendingBossFloor = 0;
      S.bossClears = S.bossClears || {};
      S.bossRewardsClaimed = S.bossRewardsClaimed || {};
      const c = spawnCampaign(S);
      c.status = 'won';
      handleCombatEnd(c);
      return { from: floor + ':' + step, floor: S.floor, step: S.step, elite: !!c.elite, boss: !!c.boss };
    }
    return [
      run(4, 1),
      run(4, 2),
      run(5, 1),
      run(9, 1),
      run(9, 2),
      run(10, 1),
    ];
  });

  expect(result).toEqual([
    { from: '4:1', floor: 4, step: 2, elite: false, boss: false },
    { from: '4:2', floor: 5, step: 1, elite: false, boss: false },
    { from: '5:1', floor: 6, step: 1, elite: true, boss: false },
    { from: '9:1', floor: 9, step: 2, elite: false, boss: false },
    { from: '9:2', floor: 10, step: 1, elite: false, boss: false },
    { from: '10:1', floor: 11, step: 1, elite: false, boss: true },
  ]);
});
