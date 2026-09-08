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
  await expect.poll(() => page.evaluate(() => !!window.__srBottomNavRuntimeV198)).toBe(true);
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
  const home = fs.readFileSync(path.join(root, 'home-layout-runtime-v198.js'), 'utf8');
  const nav = fs.readFileSync(path.join(root, 'bottom-nav-runtime-v198.js'), 'utf8');

  expect(index).toContain('bottom-nav-runtime-v198.js');
  expect(index).toContain('home-layout-runtime-v198.js');
  for (const legacy of [
    'bottom-nav-v53.js',
    'bottom-nav-layout-v183.js',
    'bottom-nav-development-v186.js',
    'bottom-nav-active-normalize-v187.js',
    'home-layout-fix-v119.js'
  ]) expect(index, legacy + ' must be retired from the runtime chain').not.toContain(legacy);

  expect(home, 'home layout must not own bottom-nav selectors').not.toContain('#tabs');
  expect(home, 'home layout must not mutate .tab nodes').not.toContain("querySelectorAll('.tab')");
  expect(nav, 'nav runtime should decorate synchronously after render, not observe DOM churn').not.toContain('MutationObserver');
  expect((index.match(/bottom-nav-runtime-v198\.js/g) || []).length).toBe(1);
});

test('consolidated navigation preserves one icon and stable active geometry', async ({ page }, testInfo) => {
  await openCleanGame(page);

  await expect(page.locator('#srBottomNavRuntimeV198')).toHaveCount(1);
  await expect(page.locator('#srHomeLayoutRuntimeV198')).toHaveCount(1);
  await expect(page.locator('#fantasyNavStyleV65')).toHaveCount(0);
  await expect(page.locator('#srBottomNavLayoutV185')).toHaveCount(0);
  await expect(page.locator('#srDevelopmentNavV186')).toHaveCount(0);
  await expect(page.locator('#srBottomNavActiveNormalizeV187')).toHaveCount(0);

  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < 4; i++) {
      const tab = page.locator('#tabs .tab').nth(i);
      const routeArg = await tab.getAttribute('data-arg');
      await expect(tab.locator('.fantasyNavIcon')).toHaveCount(1);
      const before = await tab.evaluate((el) => {
        const icon = el.querySelector('.fantasyNavIcon');
        const r = icon.getBoundingClientRect();
        const t = el.getBoundingClientRect();
        return { w:r.width, h:r.height, cx:r.left+r.width/2, tabCx:t.left+t.width/2 };
      });
      await activate(page, tab, testInfo);
      await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', routeArg);
      const active = page.locator('#tabs .tab.on');
      await expect(active.locator('.fantasyNavIcon')).toHaveCount(1);
      const after = await active.evaluate((el) => {
        const icon = el.querySelector('.fantasyNavIcon');
        const r = icon.getBoundingClientRect();
        const t = el.getBoundingClientRect();
        return { w:r.width, h:r.height, cx:r.left+r.width/2, tabCx:t.left+t.width/2 };
      });
      expect(Math.abs(after.w - before.w)).toBeLessThan(0.5);
      expect(Math.abs(after.h - before.h)).toBeLessThan(0.5);
      expect(Math.abs(after.cx - after.tabCx)).toBeLessThan(0.75);
    }
  }

  await expect(page.locator('#tabs .fantasyNavIcon')).toHaveCount(4);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
