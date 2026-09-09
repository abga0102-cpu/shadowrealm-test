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
}

async function activate(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    await locator.scrollIntoViewIfNeeded();
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
    expect(hit.ok, 'target center must remain touchable once scrolled into view').toBe(true);
    await page.touchscreen.tap(hit.x, hit.y);
  } else {
    await locator.click();
  }
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
  await activate(page, development, testInfo);
  await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', 'developpement');

  const entry = page.locator('[data-sr-accomplishments-v138]');
  await expect(entry).toHaveCount(1, { timeout: 5000 });

  for (let round = 0; round < 3; round++) {
    await activate(page, entry, testInfo);
    await expectCanonicalAccomplishments(page);

    const close = page.locator('#overlay [data-act="closeModal"]').filter({ hasText: 'Fermer' }).last();
    await activate(page, close, testInfo);
    await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });
    await expect(entry).toHaveCount(1);
  }

  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('BottomNav stays touchable after Accomplishments modal lifecycle', async ({ page }, testInfo) => {
  await openCleanGame(page);

  const development = page.locator('#tabs .tab[data-arg="developpement"]');
  await activate(page, development, testInfo);
  await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', 'developpement');

  const entry = page.locator('[data-sr-accomplishments-v138]');
  await expect(entry).toHaveCount(1, { timeout: 5000 });
  await activate(page, entry, testInfo);
  await expectCanonicalAccomplishments(page);

  const close = page.locator('#overlay [data-act="closeModal"]').filter({ hasText: 'Fermer' }).last();
  await activate(page, close, testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });

  const tabs = page.locator('#tabs .tab');
  const routeArgs = await tabs.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-arg')));
  expect(routeArgs).toHaveLength(4);
  expect(routeArgs.every(Boolean)).toBe(true);
  expect(new Set(routeArgs).size).toBe(4);

  for (const routeArg of routeArgs) {
    const tab = page.locator(`#tabs .tab[data-arg="${routeArg}"]`);
    await expect(tab).toHaveCount(1);
    await activate(page, tab, testInfo);
    await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', routeArg);
    await expect(page.locator('#tabs .fantasyNavIcon')).toHaveCount(4);
  }

  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
