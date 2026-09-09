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
    expect(hit.ok, 'target center must remain touchable').toBe(true);
    await page.touchscreen.tap(hit.x, hit.y);
  } else {
    await locator.click();
  }
}

test('Phase 2C gives Tutorial the canonical modal lifecycle instead of a DOM observer', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');
  const modalOwner = fs.readFileSync(path.join(root, 'ui-stability-v83.js'), 'utf8');
  const tutorial = fs.readFileSync(path.join(root, 'tutorial-auto-v100.js'), 'utf8');

  expect(modalOwner).toContain('__srModalLifecyclePhase2C');
  expect(modalOwner).toContain('__srGetModalStatePhase2C');
  expect(modalOwner).toContain("CustomEvent('sr:modal-state'");
  expect(modalOwner).toContain('__srHarvestStableActionPhase2C');
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

  const close = page.locator('#overlay button[data-act="closeModal"]').filter({ hasText: 'Fermer' }).first();
  await activate(page, close, testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator('#tutorialCard')).toHaveCount(1, { timeout: 5000 });

  const events = await page.evaluate(() => window.__phase2CModalEvents || []);
  expect(events).toContain(true);
  expect(events[events.length - 1]).toBe(false);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
