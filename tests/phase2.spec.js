const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

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

async function activate(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    await expect(locator).toBeVisible();
    const hit = await locator.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const top = document.elementFromPoint(x, y);
      return { x, y, width: rect.width, height: rect.height, ok: !!top && (top === el || el.contains(top)) };
    });
    expect(hit.width).toBeGreaterThan(0);
    expect(hit.height).toBeGreaterThan(0);
    expect(hit.ok, 'bottom-nav center must remain touchable').toBe(true);
    await page.touchscreen.tap(hit.x, hit.y);
  } else {
    await locator.click();
  }
}

test('Phase 2A replaces observer-driven fantasy decoration with the render lifecycle', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');
  const nav = fs.readFileSync(path.join(root, 'bottom-nav-v53.js'), 'utf8');
  expect(nav).toContain('__srBottomNavPhase2A');
  expect(nav).toContain('nativeRenderTabs');
  expect(nav).toContain('window.renderTabs=function');
  expect(nav).not.toContain('MutationObserver');
});

test('fantasy navigation remains singular and stable through repeated renders', async ({ page }, testInfo) => {
  await openCleanGame(page);

  await expect(page.locator('#fantasyNavStyleV65')).toHaveCount(1);
  await expect(page.locator('#tabs .fantasyNavIcon')).toHaveCount(4);

  for (let round = 0; round < 5; round++) {
    for (let i = 0; i < 4; i++) {
      const tab = page.locator('#tabs .tab').nth(i);
      const routeArg = await tab.getAttribute('data-arg');
      expect(routeArg).toBeTruthy();
      await expect(tab.locator('.fantasyNavIcon')).toHaveCount(1);
      await expect(tab).toHaveAttribute('data-fantasy-nav', 'phase2a');
      await activate(page, tab, testInfo);
      await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', routeArg);
      await expect(page.locator('#tabs .fantasyNavIcon')).toHaveCount(4);
      await expect(page.locator('#tabs .fantasyNavIcon')).toHaveCount(4);
    }
  }

  await page.evaluate(() => {
    if (typeof render === 'function') {
      render(); render(); render();
    }
  });
  await expect(page.locator('#tabs .fantasyNavIcon')).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(page.locator('#tabs .tab').nth(i).locator('.fantasyNavIcon')).toHaveCount(1);
  }
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
