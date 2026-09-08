const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await expect.poll(() => page.evaluate(() => !!window.__srBottomNavRuntimeV200)).toBe(true);
}

async function activate(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    const hit = await locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const top = document.elementFromPoint(x, y);
      return { x, y, ok: !!top && (top === el || el.contains(top)) };
    });
    expect(hit.ok).toBe(true);
    await page.touchscreen.tap(hit.x, hit.y);
  } else {
    await locator.click();
  }
}

test('Phase 2 has one bottom-navigation runtime owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const home = fs.readFileSync(path.join(root, 'home-layout-runtime-v200.js'), 'utf8');
  const nav = fs.readFileSync(path.join(root, 'bottom-nav-runtime-v200.js'), 'utf8');

  expect(index).toContain('bottom-nav-runtime-v200.js');
  expect(index).toContain('home-layout-runtime-v200.js');
  expect(index).toContain('auto-forge-compare-v199.js');
  for (const legacy of [
    'bottom-nav-v53.js',
    'bottom-nav-layout-v183.js',
    'bottom-nav-development-v186.js',
    'bottom-nav-active-normalize-v187.js',
    'home-layout-fix-v119.js'
  ]) expect(index, legacy + ' must be retired from the runtime chain').not.toContain(legacy);

  expect(home, 'home layout must not own bottom-nav selectors').not.toContain('#tabs');
  expect(home, 'home layout must not mutate .tab nodes').not.toContain("querySelectorAll('.tab')");
  expect(nav, 'nav runtime should decorate after render, not observe DOM churn').not.toContain('MutationObserver');
  expect((index.match(/bottom-nav-runtime-v200\.js/g) || []).length).toBe(1);
});

test('consolidated navigation preserves routes, icon ownership and Home geometry', async ({ page }, testInfo) => {
  await openCleanGame(page);

  await expect(page.locator('#srBottomNavRuntimeV200')).toHaveCount(1);
  await expect(page.locator('#fantasyNavStyleV65')).toHaveCount(0);
  await expect(page.locator('#srBottomNavLayoutV185')).toHaveCount(0);
  await expect(page.locator('#srDevelopmentNavV186')).toHaveCount(0);
  await expect(page.locator('#srBottomNavActiveNormalizeV187')).toHaveCount(0);
  await expect(page.locator('#tabs .fantasyNavIcon')).toHaveCount(4);

  for (let i = 0; i < 4; i++) {
    const tab = page.locator('#tabs .tab').nth(i);
    const routeArg = await tab.getAttribute('data-arg');
    await expect(tab.locator('.fantasyNavIcon')).toHaveCount(1);
    await activate(page, tab, testInfo);
    await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', routeArg);
    await expect(page.locator('#tabs .fantasyNavIcon')).toHaveCount(4);
  }

  const homeTab = page.locator('#tabs .tab[data-arg="accueil"]');
  await activate(page, homeTab, testInfo);
  await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', 'accueil');
  await expect.poll(() => page.evaluate(() => document.getElementById('app').classList.contains('srHomeFullArena'))).toBe(true);

  const homeGeometry = await page.locator('#tabs .tab').evaluateAll((tabs) => tabs.map((tab) => {
    const icon = tab.querySelector('.fantasyNavIcon');
    const r = icon.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    return { w:r.width, h:r.height, cx:r.left+r.width/2, tabCx:t.left+t.width/2 };
  }));
  const expected = testInfo.project.name === 'webkit-iphone' ? 31 : 34;
  for (const g of homeGeometry) {
    expect(Math.abs(g.w - expected)).toBeLessThan(0.75);
    expect(Math.abs(g.h - expected)).toBeLessThan(0.75);
    expect(Math.abs(g.cx - g.tabCx)).toBeLessThan(0.9);
  }

  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('home compatibility runtime still decorates Forge independently of navigation', async ({ page }) => {
  await openCleanGame(page);
  await expect.poll(() => page.evaluate(() => !!window.__srHomeLayoutRuntimeV200)).toBe(true);
  await expect(page.locator('#srHomeLayoutRuntimeV200')).toHaveCount(1);
  const info = page.locator('.homeForge .iBtn').first();
  if (await info.count()) {
    const radius = await info.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(radius).not.toBe('0px');
  }
});
