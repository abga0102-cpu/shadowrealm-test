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
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await expect.poll(() => page.evaluate(() => !!window.__srBottomNavPhase2A)).toBe(true);
}

async function tapAtCurrentCenter(page, locator, message) {
  await expect(locator).toBeVisible();
  const hit = await locator.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const top = document.elementFromPoint(x, y);
    return {
      x,
      y,
      width: rect.width,
      height: rect.height,
      ok: !!top && (top === el || el.contains(top))
    };
  });
  expect(hit.width).toBeGreaterThan(0);
  expect(hit.height).toBeGreaterThan(0);
  expect(hit.ok, message).toBe(true);
  await page.touchscreen.tap(hit.x, hit.y);
}

async function activateBottomNav(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    await tapAtCurrentCenter(page, locator, 'bottom-nav center must remain touchable');
  } else {
    await locator.click();
  }
}

async function settleScrollAndRender(page) {
  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

async function activateScrollable(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    await expect(locator).toBeVisible();
    await locator.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
    // WebKit can keep a deep nested-scroll input transaction alive when the
    // raw touch is injected in the same frame as scrollIntoView. Real users
    // naturally tap after scrolling has painted; wait two frames, then resolve
    // the locator again and keep the same center hit-test + touchscreen tap.
    await settleScrollAndRender(page);
    await tapAtCurrentCenter(page, locator, 'target center must remain touchable after scrolling into view');
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
  await expect(page.locator('#overlay')).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('#overlay .srAch139')).toHaveCount(1);
  await expect(page.locator('#overlay [data-ach-overview-v135]')).toHaveCount(1);
  await expect(page.locator('#overlay [data-ach-floors-v138]')).toHaveCount(1);
  await expect(page.locator('#overlay [data-ach-titles-v134]')).toHaveCount(1);
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
