const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'power-hint-v108.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

test('Power Hint V108 uses canonical combat-end lifecycle without session polling', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(source).toContain("var nativeHandleCombatEnd=typeof handleCombatEnd==='function'?handleCombatEnd:null;");
  expect(source).toContain('handleCombatEnd=function(c){');
  expect(source).toContain('nativeHandleCombatEnd.apply(this,arguments)');
  expect(source).toContain('if(c&&handled!==c){handled=c;finish(c);}');
  expect(source).not.toMatch(/setInterval\s*\(/);
  expect(source).not.toContain('function watch()');
});

test('Power Hint V108 combat-end hook is active after normal boot', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const lifecycle = await page.evaluate(() => ({
    loaded: window.__srPowerHintV108 === true,
    eventDriven: window.__srPowerHintCombatEndLifecycleV108 === true,
    handleCombatEnd: typeof window.handleCombatEnd === 'function',
  }));

  expect(lifecycle.loaded).toBe(true);
  expect(lifecycle.eventDriven).toBe(true);
  expect(lifecycle.handleCombatEnd).toBe(true);
});
