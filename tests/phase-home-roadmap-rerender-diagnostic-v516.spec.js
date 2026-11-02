const { test, expect } = require('@playwright/test');

// Diagnostic only for #487. Uses an isolated browser save; no game runtime edits.
test('V516 diagnose Home roadmap position before/after rerender frames', async ({ page }) => {
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
    // V517 diagnostic: trace Home's scheduled/fired rAF and direct #screen replacements.
    // Only the test page is instrumented; production runtime is unchanged.
    const homeTrace = [];
    const cardIds = new WeakMap();
    let nextCardId = 0;
    let nextRafId = 0;
    window.__srHomeSchedulerTraceV517 = homeTrace;
    window.__srHomeTraceV517 = (kind, extra = {}) => {
      const card = document.querySelector('.srStarterRoadmapV461');
      if (card && !cardIds.has(card)) cardIds.set(card, ++nextCardId);
      homeTrace.push({
        kind, ms: Math.round(performance.now() * 10) / 10,
        cardId: card ? cardIds.get(card) : null,
        inlineTop: card ? card.style.top : null,
        marker: card ? card.getAttribute('data-stage-safe-v463') : null,
        ...extra
      });
      if (homeTrace.length > 300) homeTrace.shift();
    };
    const nativeRaf = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      const stack = String(new Error().stack || '');
      if (!stack.includes('home-layout-authority-v219.js')) {
        return nativeRaf.call(window, callback);
      }
      const id = ++nextRafId;
      window.__srHomeTraceV517('home-raf-queued', { id });
      return nativeRaf.call(window, function(timestamp) {
        window.__srHomeTraceV517('home-raf-enter', { id });
        try { return callback(timestamp); }
        finally { window.__srHomeTraceV517('home-raf-exit', { id }); }
      });
    };
    const screenObserver = new MutationObserver(records => {
      window.__srHomeTraceV517('screen-direct-mutation', { count: records.length });
    });
    screenObserver.observe(document.getElementById('screen'), { childList: true });
    window.__srHomeRoadmapSnapshotV516 = () => {
      const card = document.querySelector('.srStarterRoadmapV461');
      const floor = document.querySelector('#arena .floorTag');
      const world = document.querySelector('.campaignWorld');
      if (!card || !floor || !world) return { present: false };
      const c = card.getBoundingClientRect();
      const f = floor.getBoundingClientRect();
      const w = world.getBoundingClientRect();
      return {
        present: true,
        top: Math.round(c.top * 10) / 10,
        floorBottom: Math.round(f.bottom * 10) / 10,
        worldBottom: Math.round(w.bottom * 10) / 10,
        inlineTop: card.style.getPropertyValue('top'),
        marker: card.getAttribute('data-stage-safe-v463'),
        room: w.bottom - f.bottom >= c.height + 8,
        safe: c.top >= f.bottom + 5,
        withinWorld: c.bottom <= w.bottom + 1
      };
    };
  });
  await expect.poll(async () =>
    page.evaluate(() => window.__srHomeRoadmapSnapshotV516().safe),
    { timeout: 7000 }
  ).toBe(true);

  const results = [];
  for (let i = 0; i < 6; i++) {
    const immediate = await page.evaluate(() => {
      window.__srHomeTraceV517('before-render');
      S.gold += 1;
      render();
      window.__srHomeTraceV517('after-render');
      return window.__srHomeRoadmapSnapshotV516();
    });
    await page.evaluate(() => new Promise(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    ));
    const afterFrames = await page.evaluate(() => {
      window.__srHomeTraceV517('after-two-raf');
      return window.__srHomeRoadmapSnapshotV516();
    });
    const afterManualSync = await page.evaluate(() => {
      window.__srSyncHomeLayoutV219();
      return window.__srHomeRoadmapSnapshotV516();
    });
    results.push({ iteration: i + 1, immediate, afterFrames, afterManualSync });
  }
  console.log('HOME_ROADMAP_V516_DIAGNOSTIC ' + JSON.stringify(results));
  console.log('HOME_ROADMAP_V517_SCHEDULER_TRACE ' + JSON.stringify(
    await page.evaluate(() => window.__srHomeSchedulerTraceV517)
  ));

  // A synchronous CSS fallback is logged, not treated as a proven runtime defect.
  // Persistent post-frame overlap is a real layout failure when room is available.
  for (const r of results) {
    expect(r.afterManualSync.present).toBe(true);
    if (r.afterManualSync.room) {
      expect(r.afterManualSync.safe).toBe(true);
      expect(r.afterManualSync.withinWorld).toBe(true);
    }
    if (r.afterFrames.room) {
      expect(r.afterFrames.safe).toBe(true);
      expect(r.afterFrames.withinWorld).toBe(true);
    }
  }
});


/* V519: diagnostic only. Reproduce the V461 arena/world height mismatch on
   WebKit without changing the layout, relaxing any existing assertion or
   writing to a real player save. Logs are useful even when the run passes. */
test('V519 diagnose arena/world height across Home navigation and rerenders', async ({ page }) => {
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
  const samples = await page.evaluate(async () => {
    S.onboardingV461.active = true;
    S.onboardingV461.completed = false;
    S.onboardingV461.freeSkillSummons = 0;
    S.onboardingV461.skillCreditGranted = false;
    S.onboardingV461.starterEggGranted = false;
    S.forge.summonCount = 0;
    S.floor = 1; S.recordFloor = 1; S.checkpoint = 1; S.level = 1;
    const measure = () => {
      const app = document.getElementById('app');
      const screen = document.getElementById('screen');
      const world = screen?.querySelector('.campaignWorld');
      const arena = screen?.querySelector('#arenaSlot');
      const card = screen?.querySelector('.srStarterRoadmapV461');
      const floor = screen?.querySelector('#arena .floorTag');
      if (!app || !screen || !world || !arena || !card || !floor) {
        return { present: false, appClass: app?.className, screenClass: screen?.className };
      }
      const wr = world.getBoundingClientRect();
      const ar = arena.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      const fr = floor.getBoundingClientRect();
      const ws = getComputedStyle(world);
      const as = getComputedStyle(arena);
      return {
        present: true,
        ms: Math.round(performance.now()),
        appClass: app.className,
        screenClass: screen.className,
        worldHeight: Math.round(wr.height * 10) / 10,
        arenaHeight: Math.round(ar.height * 10) / 10,
        delta: Math.round((ar.height - wr.height) * 10) / 10,
        worldCssHeight: ws.height,
        worldFlex: ws.flex,
        arenaCssHeight: as.height,
        arenaPosition: as.position,
        cardMarked: card.getAttribute('data-stage-safe-v463'),
        cardTop: Math.round(cr.top),
        floorBottom: Math.round(fr.bottom),
        overlap: cr.top < fr.bottom
      };
    };
    const observations = [];
    for (let i = 0; i < 6; i++) {
      if (i === 0) nav('accueil'); else render();
      const immediate = measure();
      await Promise.resolve();
      const afterMutation = measure();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const afterFrames = measure();
      await new Promise(resolve => setTimeout(resolve, 180));
      const settled = measure();
      observations.push({ iteration: i + 1, immediate, afterMutation, afterFrames, settled });
    }
    return observations;
  });
  console.log('HOME_V519_ARENA_GEOMETRY ' + JSON.stringify(samples));
  for (const sample of samples) {
    expect(sample.settled.present).toBe(true);
  }
});
