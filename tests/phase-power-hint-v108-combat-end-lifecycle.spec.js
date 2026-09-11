const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'power-hint-v108.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

test('Power Hint V108 observes combat completion without replacing the canonical end function', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(source).toContain('function watch(){');
  expect(source).toContain("combat.status==='lost'||combat.status==='won'");
  expect(source).toContain('setInterval(watch,350)');
  expect(source).not.toContain('handleCombatEnd=function');
  expect(source).not.toContain('nativeHandleCombatEnd.apply');
});

test('Power Hint V108 observer is active after normal boot without owning handleCombatEnd', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const lifecycle = await page.evaluate(() => ({
    loaded: window.__srPowerHintV108 === true,
    observerActive: window.__srPowerHintCombatEndLifecycleV108 === true,
    handleCombatEnd: typeof window.handleCombatEnd === 'function',
  }));

  expect(lifecycle.loaded).toBe(true);
  expect(lifecycle.observerActive).toBe(true);
  expect(lifecycle.handleCombatEnd).toBe(true);
});
