const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { touchCurrentLocator } = require('./helpers/render-stable-touch');

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
    await touchCurrentLocator(page, locator, { label: 'Phase 2 touch target' });
  } else {
    await locator.click();
  }
}

test('Phase 2A fantasy decoration is consolidated into the V209 BottomNav owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');
  const layout = fs.readFileSync(path.join(root, 'bottom-nav-layout-v183.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  expect(layout).toContain('__srBottomNavPhase2A');
  expect(layout).toContain('__srDecorateBottomNavPhase2A');
  expect(layout).toContain('fantasyNavStyleV65');
  expect(layout).toContain('nativeRenderTabs');
  expect(layout).toContain('window.renderTabs=function');
  expect(index).not.toContain('bottom-nav-v53.js');
  expect((index.match(/bottom-nav-layout-v183\.js/g) || []).length).toBe(1);
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

test('Phase 2B moves Home classification and compatibility off DOM mutation observers', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');
  const homeAuthority = fs.readFileSync(path.join(root, 'home-layout-authority-v219.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(fs.existsSync(path.join(root, 'social-forge-layout-v1.js'))).toBe(false);
  expect(fs.existsSync(path.join(root, 'home-layout-fix-v119.js'))).toBe(false);
  expect(index).not.toContain('social-forge-layout-v1.js');
  expect(index).not.toContain('home-layout-fix-v119.js');
  expect(homeAuthority).toContain('__srHomeFramePhase2B');
  expect(homeAuthority).toContain('__srHomeLayoutPhase2B');
  expect(homeAuthority).toContain('__srSyncHomeFramePhase2B');
  expect(homeAuthority).toContain('__srHomeLayoutCompatV119');
  expect(homeAuthority).toContain('__srApplyHomeCompatV119');
  expect(homeAuthority).not.toContain('new MutationObserver');
  expect(homeAuthority).not.toContain('window.renderTabs=function');
});

test('Home state follows the rendered route without stale observer timing', async ({ page }, testInfo) => {
  await openCleanGame(page);
  await expect.poll(() => page.evaluate(() => !!window.__srHomeFramePhase2B && !!window.__srHomeLayoutPhase2B), { timeout: 10000 }).toBe(true);

  const tabs = page.locator('#tabs .tab');
  const routeArgs = await tabs.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-arg')));
  const homeIndex = routeArgs.indexOf('accueil');
  expect(homeIndex).toBeGreaterThanOrEqual(0);

  const expectHomeState = async (expected) => {
    await expect.poll(() => page.evaluate(() => {
      const app = document.getElementById('app');
      const screen = document.getElementById('screen');
      return {
        full: !!app && app.classList.contains('srHomeFullArena'),
        world: !!screen && !!screen.querySelector('.campaignWorld')
      };
    })).toEqual({ full: expected, world: expected });
  };

  await expectHomeState(true);

  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < routeArgs.length; i++) {
      const tab = tabs.nth(i);
      const routeArg = routeArgs[i];
      await activate(page, tab, testInfo);
      await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', routeArg);
      await expectHomeState(routeArg === 'accueil');
    }
  }

  await activate(page, tabs.nth(homeIndex), testInfo);
  await expectHomeState(true);

  const info = page.locator('.homeForge .iBtn').first();
  await expect(info).toBeVisible();
  const circle = await info.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return { width: rect.width, height: rect.height, radius: style.borderRadius };
  });
  expect(Math.abs(circle.width - circle.height)).toBeLessThan(0.5);
  expect(circle.width).toBeGreaterThanOrEqual(27);
  expect(circle.radius).toBe('50%');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('V209 retires Development-only BottomNav layers and owns geometry after render', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');
  const layout = fs.readFileSync(path.join(root, 'bottom-nav-layout-v183.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(layout).toContain('__srBottomNavGeometryV209');
  expect(layout).toContain('normalizeIconSlot');
  expect(layout).toContain('nativeRenderTabs');
  expect(layout).toContain('__srDecorateBottomNavPhase2A');
  expect(layout).not.toContain('MutationObserver');
  expect(index).toContain('premium-ui-v209.js');
  expect(index).not.toContain("'bottom-nav-development-v186.js'");
  expect(index).not.toContain("'bottom-nav-active-normalize-v187.js'");
});

test('Development uses the exact same icon slot and geometry as every other BottomNav tab', async ({ page }, testInfo) => {
  await openCleanGame(page);
  await expect.poll(() => page.evaluate(() => !!window.__srBottomNavGeometryV209 && !!window.__srPremiumUiV209), { timeout: 10000 }).toBe(true);

  await expect(page.locator('#tabs > .tab > .fantasyNavIcon')).toHaveCount(0);
  await expect(page.locator('#tabs > .tab > .ico > .fantasyNavIcon')).toHaveCount(4);

  const geometry = async () => page.locator('#tabs > .tab').evaluateAll((tabs) => tabs.map((tab) => {
    const slot = tab.querySelector(':scope > .ico');
    const icon = slot && slot.querySelector(':scope > .fantasyNavIcon');
    const label = tab.querySelector(':scope > span:not(.fantasyNavIcon):not(.dot)');
    const tr = tab.getBoundingClientRect();
    const sr = slot.getBoundingClientRect();
    const ir = icon.getBoundingClientRect();
    const lr = label.getBoundingClientRect();
    return {
      route: tab.getAttribute('data-arg'),
      slotCenter: sr.left + sr.width / 2 - tr.left,
      iconCenter: ir.left + ir.width / 2 - tr.left,
      iconTop: ir.top - tr.top,
      iconWidth: ir.width,
      iconHeight: ir.height,
      labelTop: lr.top - tr.top,
      labelCenter: lr.left + lr.width / 2 - tr.left
    };
  }));

  const assertUniform = (rows) => {
    for (const key of ['slotCenter', 'iconCenter', 'iconTop', 'iconWidth', 'iconHeight', 'labelTop', 'labelCenter']) {
      const values = rows.map((row) => row[key]);
      expect(Math.max(...values) - Math.min(...values), `${key} must match across all four tabs`).toBeLessThan(0.75);
    }
  };

  assertUniform(await geometry());

  const development = page.locator('#tabs > .tab[data-arg="developpement"]');
  await activate(page, development, testInfo);
  await expect(page.locator('#tabs > .tab.on')).toHaveAttribute('data-arg', 'developpement');
  assertUniform(await geometry());

  const equipment = page.locator('#tabs > .tab[data-arg="equipement"]');
  await activate(page, equipment, testInfo);
  await expect(page.locator('#tabs > .tab.on')).toHaveAttribute('data-arg', 'equipement');
  await activate(page, development, testInfo);
  await expect(page.locator('#tabs > .tab.on')).toHaveAttribute('data-arg', 'developpement');
  assertUniform(await geometry());
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('premium interaction layer replaces cyan primary rings with warm gold', async ({ page }) => {
  await openCleanGame(page);
  await expect.poll(() => page.evaluate(() => !!window.__srPremiumUiV209), { timeout: 10000 }).toBe(true);

  const visual = await page.evaluate(() => {
    const ring = getComputedStyle(document.documentElement).getPropertyValue('--primary-action-ring').trim();
    const button = document.createElement('button');
    button.className = 'btn blue';
    button.setAttribute('data-primary-action', 'true');
    button.textContent = 'Premium';
    document.body.appendChild(button);
    const style = getComputedStyle(button);
    const out = {
      ring,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      backgroundImage: style.backgroundImage
    };
    button.remove();
    return out;
  });

  expect(visual.ring.toUpperCase()).toBe('#D7AE58');
  expect(visual.borderColor).not.toContain('127, 212, 255');
  expect(visual.boxShadow).not.toContain('127, 212, 255');
  expect(visual.backgroundImage).not.toContain('127, 212, 255');
});
