const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('post-4G stops loading the V123 Development entry that V138 suppresses', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  const legacy = source('accomplishments-ui-v123.js');
  const stability = source('accomplishments-stability-v138.js');

  expect(index).not.toContain('accomplishments-ui-v123.js');
  expect(index).toContain('accomplishments-stability-v138.js');

  expect(legacy).toContain('__srAccomplishmentsUIV124');
  expect(legacy).toContain('new MutationObserver');
  expect(legacy).toContain('setInterval(mount,700)');

  expect(stability).toContain('window.__srAccomplishmentsUIV124=true');
  expect(stability).toContain('__srAccomplishmentsStabilityV138');
  expect(stability).toContain('data-sr-accomplishments-v138');
  expect(stability).toContain('window.renderTabs=function');
  expect(stability).not.toContain('new MutationObserver');
});

test('V123 is absent at runtime while V138 still owns the Development entry', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof S !== 'undefined' && !!window.__srAccomplishmentsStabilityV138);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const state = await page.evaluate(() => ({
    legacyScriptCount: document.querySelectorAll('script[src*="accomplishments-ui-v123.js"]').length,
    stability: !!window.__srAccomplishmentsStabilityV138,
    suppressedLegacyFlag: !!window.__srAccomplishmentsUIV124,
  }));

  expect(state).toEqual({
    legacyScriptCount: 0,
    stability: true,
    suppressedLegacyFlag: true,
  });
});
