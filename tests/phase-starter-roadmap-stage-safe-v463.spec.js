const { test, expect } = require('@playwright/test');

async function openStarterHome(page, viewport={width:390,height:844}) {
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srStarterPacingV462?.version === 462 &&
    typeof window.__srPositionStarterRoadmapV463 === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.evaluate(() => {
    S.onboardingV461.active = true;
    S.onboardingV461.completed = false;
    S.onboardingV461.freeSkillSummons = 0;
    S.onboardingV461.skillCreditGranted = false;
    S.onboardingV461.starterEggGranted = false;
    S.forge.summonCount = 0;
    S.floor = 1; S.recordFloor = 1; S.checkpoint = 1; S.level = 1;
    nav('accueil');
    window.__srSyncHomeLayoutV219();
  });
  await page.waitForFunction(() =>
    document.querySelector('.srStarterRoadmapV461')?.getAttribute('data-stage-safe-v463') === '1'
  );
}

test('V463 compact starter roadmap stays below all stage information on iPhone-sized Home', async ({ page }) => {
  await openStarterHome(page,{width:390,height:844});
  const g = await page.evaluate(() => {
    const card = document.querySelector('.srStarterRoadmapV461').getBoundingClientRect();
    const stage = document.querySelector('#arena .floorTag').getBoundingClientRect();
    const world = document.querySelector('.campaignWorld').getBoundingClientRect();
    return {
      card:{top:card.top,bottom:card.bottom,width:card.width,height:card.height},
      stage:{top:stage.top,bottom:stage.bottom},
      world:{top:world.top,bottom:world.bottom}
    };
  });
  expect(g.card.top).toBeGreaterThanOrEqual(g.stage.bottom + 5);
  expect(g.card.bottom).toBeLessThanOrEqual(g.world.bottom + 1);
  expect(g.card.width).toBeLessThanOrEqual(150);
  expect(g.card.height).toBeLessThanOrEqual(70);
});

test('V463 keeps the stage-safe rule after a Home rerender', async ({ page }) => {
  await openStarterHome(page,{width:390,height:844});
  await page.evaluate(() => {
    S.gold += 1;
    render();
  });
  await page.waitForFunction(() =>
    document.querySelector('.srStarterRoadmapV461')?.getAttribute('data-stage-safe-v463') === '1'
  );
  const safe = await page.evaluate(() => {
    const card = document.querySelector('.srStarterRoadmapV461').getBoundingClientRect();
    const stage = document.querySelector('#arena .floorTag').getBoundingClientRect();
    return card.top >= stage.bottom + 5;
  });
  expect(safe).toBe(true);
});
