const { test, expect } = require('@playwright/test');
const { touchCurrentLocator } = require('./helpers/render-stable-touch');

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
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await expect.poll(() => page.evaluate(() => !!window.__srBottomNavPhase2A)).toBe(true);
}

async function activateBottomNav(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    await touchCurrentLocator(page, locator, { label: 'Phase 3 BottomNav target' });
  } else {
    await locator.click();
  }
}

async function activateScrollable(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    await touchCurrentLocator(page, locator, {
      label: 'Phase 3 scrollable target',
      scroll: true,
      timeout: 10000
    });
  } else {
    await locator.click();
  }
}

async function expectActiveRoute(page, routeArg) {
  await expect.poll(async () => {
    return page.locator('#tabs .tab.on').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-arg') || '')
    );
  }, {
    timeout: 7000,
    intervals: [50, 100, 250, 500]
  }).toEqual([routeArg]);
}

async function expectCanonicalAccomplishments(page) {
  // Read the large canonical modal in one browser-side snapshot. Five separate
  // locator assertions make Playwright trace the same deep modal five times;
  // on WebKit that tracing overhead can consume the whole test timeout even
  // though every selector has already resolved successfully.
  await expect.poll(() => page.evaluate(() => ({
    overlay: document.querySelectorAll('#overlay').length,
    canonical: document.querySelectorAll('#overlay .srAch139').length,
    overview: document.querySelectorAll('#overlay [data-ach-overview-v135]').length,
    floors: document.querySelectorAll('#overlay [data-ach-floors-v138]').length,
    titles: document.querySelectorAll('#overlay [data-ach-titles-v134]').length
  })), {
    timeout: 5000,
    intervals: [50, 100, 250]
  }).toEqual({ overlay: 1, canonical: 1, overview: 1, floors: 1, titles: 1 });
}

test('Accomplishments compatibility stack renders one canonical modal through repeated opens', async ({ page }, testInfo) => {
  await openCleanGame(page);

  const development = page.locator('#tabs .tab[data-arg="developpement"]');
  await activateBottomNav(page, development, testInfo);
  await expectActiveRoute(page, 'developpement');

  const entry = page.locator('[data-sr-accomplishments-v138]');
  await expect(entry).toHaveCount(1, { timeout: 5000 });

  for (let round = 0; round < 3; round++) {
    await activateScrollable(page, entry, testInfo);
    await expectCanonicalAccomplishments(page);

    const close = page.locator('#overlay [data-act="closeModal"]').filter({ hasText: 'Fermer' }).last();
    await activateScrollable(page, close, testInfo);
    await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });
    await expect(entry).toHaveCount(1);
  }

  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('BottomNav stays touchable after Accomplishments modal lifecycle', async ({ page }, testInfo) => {
  await openCleanGame(page);

  const development = page.locator('#tabs .tab[data-arg="developpement"]');
  await activateBottomNav(page, development, testInfo);
  await expectActiveRoute(page, 'developpement');

  const entry = page.locator('[data-sr-accomplishments-v138]');
  await expect(entry).toHaveCount(1, { timeout: 5000 });
  await activateScrollable(page, entry, testInfo);
  await expectCanonicalAccomplishments(page);

  const close = page.locator('#overlay [data-act="closeModal"]').filter({ hasText: 'Fermer' }).last();
  await activateScrollable(page, close, testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });

  const tabs = page.locator('#tabs .tab');
  const routeArgs = await tabs.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-arg')));
  expect(routeArgs).toHaveLength(4);
  expect(routeArgs.every(Boolean)).toBe(true);
  expect(new Set(routeArgs).size).toBe(4);

  for (const routeArg of routeArgs) {
    const tab = page.locator(`#tabs .tab[data-arg="${routeArg}"]`);
    await expect(tab).toHaveCount(1);
    await activateBottomNav(page, tab, testInfo);
    await expectActiveRoute(page, routeArg);
    await expect(page.locator('#tabs .fantasyNavIcon')).toHaveCount(4);
  }

  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('Accomplishments legacy owners keep only Development scope and title interaction', async ({ page }, testInfo) => {
  await openCleanGame(page);

  const entry = page.locator('[data-sr-accomplishments-v138]');
  await expect(entry).toHaveCount(0);
  expect(await page.evaluate(() => !!window.__srAccomplishmentsFinalModalV138)).toBe(false);

  const development = page.locator('#tabs .tab[data-arg="developpement"]');
  await activateBottomNav(page, development, testInfo);
  await expectActiveRoute(page, 'developpement');
  await expect(entry).toHaveCount(1, { timeout: 5000 });

  await page.evaluate(() => {
    S.sanctuary = S.sanctuary && typeof S.sanctuary === 'object' ? S.sanctuary : {};
    S.sanctuary.divineTitleUnlocked = true;
    S.titles = S.titles && typeof S.titles === 'object' ? S.titles : {};
    S.equippedTitle = '';
  });

  await activateScrollable(page, entry, testInfo);
  await expectCanonicalAccomplishments(page);

  const titleButton = page.locator('#overlay [data-ach-title="divin"]');
  await expect(titleButton).toHaveCount(1);
  await expect(titleButton).toContainText('Équiper');
  await activateScrollable(page, titleButton, testInfo);

  await expect.poll(() => page.evaluate(() => S.equippedTitle), {
    timeout: 5000,
    intervals: [50, 100, 250]
  }).toBe('divin');
  await expectCanonicalAccomplishments(page);
  await expect(page.locator('#overlay [data-ach-title="divin"]')).toContainText('Équipé');

  const close = page.locator('#overlay [data-act="closeModal"]').filter({ hasText: 'Fermer' }).last();
  await activateScrollable(page, close, testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });

  const otherRoute = await page.locator('#tabs .tab').evaluateAll((nodes) => {
    const node = nodes.find((candidate) => candidate.getAttribute('data-arg') !== 'developpement');
    return node ? node.getAttribute('data-arg') : '';
  });
  expect(otherRoute).toBeTruthy();
  await activateBottomNav(page, page.locator(`#tabs .tab[data-arg="${otherRoute}"]`), testInfo);
  await expectActiveRoute(page, otherRoute);
  await expect(entry).toHaveCount(0, { timeout: 5000 });

  // Verify the entry can remount after a full route transition. This is the
  // WebKit race that surfaced only in the post-merge main run.
  await activateBottomNav(page, development, testInfo);
  await expectActiveRoute(page, 'developpement');
  await expect(entry).toHaveCount(1, { timeout: 5000 });

  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
