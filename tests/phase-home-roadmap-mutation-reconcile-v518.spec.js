const { test, expect } = require('@playwright/test');

// Browser-only, isolated save. No persistent player data is written.
test('V518 repositions a freshly replaced Home roadmap before the next animation frame', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srStarterPacingV462?.version === 462 &&
    typeof window.__srSyncHomeLayoutV219 === 'function'
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
  await expect.poll(() => page.evaluate(() => {
    const card = document.querySelector('.srStarterRoadmapV461');
    const floor = document.querySelector('#arena .floorTag');
    return !!card && !!floor && card.getBoundingClientRect().top >= floor.getBoundingClientRect().bottom + 5;
  }), { timeout: 7000 }).toBe(true);

  const observations = await page.evaluate(async () => {
    const snapshot = () => {
      const card = document.querySelector('.srStarterRoadmapV461');
      const floor = document.querySelector('#arena .floorTag');
      const world = document.querySelector('.campaignWorld');
      if (!card || !floor || !world) return { present: false };
      const c = card.getBoundingClientRect();
      const f = floor.getBoundingClientRect();
      const w = world.getBoundingClientRect();
      return {
        present: true,
        marked: card.getAttribute('data-stage-safe-v463') === '1',
        top: Math.round(c.top),
        room: w.bottom - f.bottom >= c.height + 8,
        safe: c.top >= f.bottom + 5,
        withinWorld: c.bottom <= w.bottom + 1
      };
    };
    const results = [];
    for (let i = 0; i < 6; i++) {
      S.gold += 1;
      render();
      const immediately = snapshot();
      // Flush the existing direct-child MutationObserver, without forcing
      // the Home layout callback or waiting for a frame.
      await Promise.resolve();
      const afterMutation = snapshot();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const afterFrames = snapshot();
      results.push({ immediately, afterMutation, afterFrames });
    }
    return results;
  });
  for (const result of observations) {
    expect(result.afterMutation.present).toBe(true);
    expect(result.afterMutation.marked).toBe(true);
    if (result.afterMutation.room) {
      expect(result.afterMutation.safe).toBe(true);
      expect(result.afterMutation.withinWorld).toBe(true);
    }
    if (result.afterFrames.room) {
      expect(result.afterFrames.safe).toBe(true);
      expect(result.afterFrames.withinWorld).toBe(true);
    }
  }
});
