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
  await expect(page.locator('#tabs > .tab')).toHaveCount(4, { timeout: 15000 });
  await page.waitForFunction(() =>
    window.__srProgressionUnlocksV316 &&
    window.__srForgeRaidOnboardingConfigV317 &&
    typeof window.__srV317RaidUnlocked === 'function'
  );
}

test('V319 Forge depletion points through Progression > Défis > Raids to Raid Minerai', async ({ page }) => {
  await openCleanGame(page);

  const state = await page.evaluate(() => {
    S.level = 3;
    S.power = computePower(S);
    D = computeDerived(S);

    let crafted = 0;
    for (let i = 0; i < 25; i += 1) {
      const out = forgeSummon(1);
      crafted += Array.isArray(out) ? out.length : 0;
    }

    const seen = S.tutorial.seen || (S.tutorial.seen = {});
    try { Object.keys(TUTORIAL_FLOWS || {}).forEach((key) => { seen[key] = true; }); } catch (_) {}
    seen.raid = false;
    const tutorial = pendingTutorialStep();

    return {
      crafted,
      minerai: S.minerai,
      raidUnlocked: __srV317RaidUnlocked(S),
      raidGate: RULES.RAID_UNLOCK_LEVEL,
      tutorial,
    };
  });

  expect(state).toMatchObject({
    crafted: 25,
    minerai: 0,
    raidUnlocked: true,
    raidGate: 1,
  });
  expect(state.tutorial).toMatchObject({ key: 'raid', title: 'Raids débloqués' });
  expect(state.tutorial.sub).toContain('Progression');
  expect(state.tutorial.sub).toContain('Défis');
  expect(state.tutorial.sub).toContain('Raids');
  expect(state.tutorial.sub).toContain('Raid Minerai');
  expect(state.tutorial.sub.indexOf('Progression')).toBeLessThan(state.tutorial.sub.indexOf('Défis'));
  expect(state.tutorial.sub.indexOf('Défis')).toBeLessThan(state.tutorial.sub.indexOf('Raids'));
  expect(state.tutorial.sub.indexOf('Raids')).toBeLessThan(state.tutorial.sub.indexOf('Raid Minerai'));

  await page.evaluate(() => {
    if (typeof clearTutorialGuide === 'function') clearTutorialGuide();
    const card = document.getElementById('tutorialCard');
    if (card) card.remove();
    S.tutorial = null;
    nav('accueil');
    scheduleRender();
  });
  await expect(page.locator('#tutorialCard')).toHaveCount(0);

  await page.locator('#tabs > .tab[data-arg="developpement"]').click();
  await expect(page.locator('#topbar .title')).toHaveText('Progression');
  await expect(page.locator('#screen [data-act="go"][data-arg="defis"]')).toHaveCount(1);

  await page.locator('#screen [data-act="go"][data-arg="defis"]').click();
  await expect(page.locator('#topbar .title')).toHaveText('Défis');
  await expect(page.locator('#screen [data-act="go"][data-arg="raid"]')).toHaveCount(1);

  await page.locator('#screen [data-act="go"][data-arg="raid"]').click();
  await expect(page.locator('#screen')).toContainText('Raid Minerai');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
