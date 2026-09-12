const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { touchCurrentLocator } = require('./helpers/render-stable-touch');

const root = path.join(__dirname, '..');
const v83Path = path.join(root, 'ui-stability-v83.js');

async function openObserverlessGame(page) {
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
  await expect.poll(() => page.evaluate(() => !!window.__srModalLifecyclePhase2C), { timeout: 10000 }).toBe(true);
}

async function activate(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    await touchCurrentLocator(page, locator, { label: 'V83 observerless lifecycle action' });
  } else {
    await locator.click();
  }
}

test('V83 production source has no broad #app modal observer', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');
  const source = fs.readFileSync(v83Path, 'utf8');
  expect(source).not.toContain('new MutationObserver(schedule).observe(app,{childList:true,subtree:false})');
  expect(source).not.toContain("const app=document.getElementById('app');");
  expect(source).toContain('function nativeOpenSafe(ctx,args)');
  expect(source).toContain('function nativeCloseSafe(ctx,args)');
  expect(source).toContain('markOverlay();\n  publishModalState(true);');
});

test('V83 modal lifecycle remains complete without the broad #app observer', async ({ page }, testInfo) => {
  await openObserverlessGame(page);

  await page.evaluate(() => {
    window.__leanV83ObserverlessStates = [];
    window.addEventListener('sr:modal-state', (event) => {
      window.__leanV83ObserverlessStates.push(!!(event && event.detail && event.detail.open));
    });
    openModal('<button class="btn" data-act="closeModal">Fermer A</button>', 'Observerless A');
  });

  await expect(page.locator('#overlay')).toHaveCount(1);
  await expect(page.locator('#overlay')).toHaveAttribute('data-sr-persistent', '1');
  await expect(page.locator('#overlay')).toContainText('Observerless A');

  await page.evaluate(() => {
    openModal('<button class="btn" data-act="closeModal">Fermer B</button>', 'Observerless B');
  });
  await expect(page.locator('#overlay')).toContainText('Observerless A');
  await expect(page.locator('#overlay')).not.toContainText('Observerless B');

  await activate(page, page.locator('#overlay [data-act="closeModal"]').first(), testInfo);
  await expect(page.locator('#overlay')).toContainText('Observerless B', { timeout: 5000 });
  await expect(page.locator('#overlay')).toHaveAttribute('data-sr-persistent', '1');

  await activate(page, page.locator('#overlay [data-act="closeModal"]').first(), testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });

  const states = await page.evaluate(() => window.__leanV83ObserverlessStates || []);
  expect(states).toContain(true);
  expect(states[states.length - 1]).toBe(false);

  const homeTab = page.locator('#tabs .tab').first();
  const equipmentTab = page.locator('#tabs .tab').nth(1);
  await activate(page, equipmentTab, testInfo);
  await expect(page.locator('#screen .campaignWorld')).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator('#screen')).not.toHaveClass(/srHomeCompact/);
  await activate(page, homeTab, testInfo);
  await expect(page.locator('#screen .campaignWorld')).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('#screen')).toHaveClass(/srHomeCompact/);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
