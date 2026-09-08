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
  const executableNav = nav
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n');
  expect(nav).toContain('__srBottomNavPhase2A');
  expect(nav).toContain('nativeRenderTabs');
  expect(nav).toContain('window.renderTabs=function');
  expect(executableNav).not.toContain('MutationObserver');
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
  const homeFrame = fs.readFileSync(path.join(root, 'social-forge-layout-v1.js'), 'utf8');
  const compatibility = fs.readFileSync(path.join(root, 'home-layout-fix-v119.js'), 'utf8');

  expect(homeFrame).toContain('__srHomeFramePhase2B');
  expect(homeFrame).toContain('__srSyncHomeFramePhase2B');
  expect(homeFrame).toContain('nativeRenderTabs');
  expect(homeFrame).not.toContain('new MutationObserver');

  expect(compatibility).toContain('__srHomeLayoutPhase2B');
  expect(compatibility).toContain('__srSyncHomeFramePhase2B');
  expect(compatibility).toContain('nativeRenderTabs');
  expect(compatibility).not.toContain('new MutationObserver');
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
  await expect.poll(async () => info.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      square: Math.abs(rect.width - rect.height) < 0.5,
      largeEnough: rect.width >= 27,
      round: style.borderRadius === '50%'
    };
  }), { timeout: 3000 }).toEqual({ square: true, largeEnough: true, round: true });
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('Phase 2C gives Tutorial the canonical modal lifecycle instead of a DOM observer', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');
  const modalOwner = fs.readFileSync(path.join(root, 'ui-stability-v83.js'), 'utf8');
  const tutorial = fs.readFileSync(path.join(root, 'tutorial-auto-v100.js'), 'utf8');

  expect(modalOwner).toContain('__srModalLifecyclePhase2C');
  expect(modalOwner).toContain('__srGetModalStatePhase2C');
  expect(modalOwner).toContain("CustomEvent('sr:modal-state'");
  expect(tutorial).toContain('__srTutorialModalPhase2C');
  expect(tutorial).toContain("addEventListener('sr:modal-state'");
  expect(tutorial).not.toContain('MutationObserver');
});

test('Tutorial yields to an opened modal and resumes after canonical close', async ({ page }, testInfo) => {
  await openCleanGame(page);
  await expect.poll(() => page.evaluate(() => !!window.__srModalLifecyclePhase2C && !!window.__srTutorialModalPhase2C), { timeout: 10000 }).toBe(true);

  const home = page.locator('#tabs .tab[data-arg="accueil"]');
  await activate(page, home, testInfo);
  await expect(page.locator('#tabs .tab.on')).toHaveAttribute('data-arg', 'accueil');

  await page.evaluate(() => {
    window.__phase2CModalEvents = [];
    window.addEventListener('sr:modal-state', (e) => {
      window.__phase2CModalEvents.push(!!(e && e.detail && e.detail.open));
    });
    const old = document.getElementById('tutorialCard');
    if (old) old.remove();
    if (typeof clearTutorialGuide === 'function') clearTutorialGuide();
    if (typeof tutorialCurrentKey !== 'undefined') tutorialCurrentKey = null;
    if (!S.tutorial || typeof S.tutorial !== 'object') S.tutorial = { seen: {} };
    S.tutorial.seen = {};
    if (typeof checkTutorial === 'function') checkTutorial();
  });

  await expect(page.locator('#tutorialCard')).toHaveCount(1, { timeout: 5000 });

  await page.evaluate(() => {
    openModal('<button class="btn" data-act="closeModal">Fermer</button>', 'Phase 2C test');
  });
  await expect(page.locator('#overlay')).toHaveCount(1);
  await expect(page.locator('#tutorialCard')).toHaveCount(0, { timeout: 3000 });

  const close = page.locator('#overlay button[data-act="closeModal"]', { hasText: 'Fermer' });
  await activate(page, close, testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator('#tutorialCard')).toHaveCount(1, { timeout: 5000 });

  const events = await page.evaluate(() => window.__phase2CModalEvents || []);
  expect(events).toContain(true);
  expect(events[events.length - 1]).toBe(false);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});