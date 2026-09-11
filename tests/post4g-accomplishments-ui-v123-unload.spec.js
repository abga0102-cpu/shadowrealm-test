const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { touchCurrentLocator } = require('./helpers/render-stable-touch');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const exists = (name) => fs.existsSync(path.join(root, name));

test('post-4G source-retires dormant Accomplishments UI v123 behind the v138 lifecycle owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  const stability = source('accomplishments-stability-v138.js');

  expect(index).not.toContain('accomplishments-ui-v123.js');
  expect(exists('accomplishments-ui-v123.js')).toBe(false);
  expect(index.match(/accomplishments-stability-v138\.js/g) || []).toHaveLength(1);
  expect(index.match(/accomplishments-canonical-v139\.js/g) || []).toHaveLength(1);

  // Phase 4F v138 remains the deterministic Development-route owner and keeps
  // the legacy guard for compatibility with old bundles/saves.
  expect(stability).toContain('window.__srAccomplishmentsUIV124=true');
  expect(stability).toContain('__srAccomplishmentsStabilityV138');
  expect(stability).toContain("window.addEventListener('sr:bottomnavrendered',schedulePlace)");
  expect(stability).toContain('data-sr-accomplishments-v138');
  expect(stability).not.toMatch(/renderTabs\s*=|function\s+renderTabs\b/);
  expect(stability).not.toContain('new MutationObserver');
  expect(stability).not.toContain('setInterval(');
});

test('v123 stays unloaded at runtime while v138 owns exactly one Development entry', async ({ page }, testInfo) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await expect.poll(() => page.evaluate(() => !!window.__srAccomplishmentsStabilityV138 && !!window.__srAccomplishmentsCanonicalV139)).toBe(true);

  const runtime = await page.evaluate(() => ({
    legacyScript: !!document.querySelector('script[src*="accomplishments-ui-v123.js"]'),
    legacyResource: performance.getEntriesByType('resource').some((entry) => entry.name.includes('accomplishments-ui-v123.js')),
    legacyGuard: window.__srAccomplishmentsUIV124 === true,
    stability: window.__srAccomplishmentsStabilityV138 === true,
    canonical: window.__srAccomplishmentsCanonicalV139 === true,
  }));
  expect(runtime).toEqual({
    legacyScript: false,
    legacyResource: false,
    legacyGuard: true,
    stability: true,
    canonical: true,
  });

  const development = page.locator('#tabs .tab[data-arg="developpement"]');
  if (testInfo.project.name === 'webkit-iphone') {
    await touchCurrentLocator(page, development, { label: 'post-4G Development target' });
  } else {
    await development.click();
  }

  await expect.poll(() => page.locator('#tabs .tab.on').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-arg') || '')
  ), { timeout: 7000, intervals: [50, 100, 250, 500] }).toEqual(['developpement']);

  await expect(page.locator('[data-sr-accomplishments-v138]')).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('[data-sr-accomplishments-entry]')).toHaveCount(0);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
