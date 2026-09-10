const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const executable = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

test('Phase 4D keeps v216 as the sole loaded tree mastery gating and popup owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const legacyRule = source('tree-mastery-v120.js');
  const legacyUi = source('tree-mastery-ui-v128.js');
  const canonical = source('runtime-tree-stability-v216.js');
  const index = source('index.html');

  expect(legacyRule).toContain('__srTreeMasteryV120');
  expect(legacyUi).toContain('__srTreeMasteryUIV128');

  for (const legacy of [executable(legacyRule), executable(legacyUi)]) {
    expect(legacy).not.toContain('treeReqOk=');
    expect(legacy).not.toContain('showTreeNode=');
    expect(legacy).not.toContain('new MutationObserver');
    expect(legacy).not.toContain('setInterval(');
    expect(legacy).not.toContain('querySelectorAll(');
  }

  expect(fs.existsSync(path.join(root, 'tree-mastery-v149.js'))).toBe(false);
  expect(canonical).toContain('__srRuntimeTreeStabilityV216');
  expect(canonical).toContain('var LEVEL=2,COST=100');
  expect(canonical).toContain('masteryLevelRequired=LEVEL');
  expect(canonical).toContain('treeReqOk=function');
  expect(canonical).toContain('function syncPopup()');
  expect(canonical).toContain('niveau 2/5 requis');
  expect(canonical).not.toContain('new MutationObserver');

  expect(index).not.toContain('tree-mastery-v120.js');
  expect(index).not.toContain('tree-mastery-ui-v128.js');
  expect(index).not.toContain('tree-mastery-v149.js');
  expect(index.match(/runtime-tree-stability-v216\.js/g) || []).toHaveLength(1);
});

test('retired tree mastery layers stay unloaded while v216 remains active', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof S !== 'undefined' && !!window.__srRuntimeTreeStabilityV216);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const state = await page.evaluate(() => ({
    v120: typeof window.__srTreeMasteryV120,
    v128: typeof window.__srTreeMasteryUIV128,
    v149: typeof window.__srTreeMasteryV149,
    v216: !!window.__srRuntimeTreeStabilityV216,
  }));

  expect(state).toEqual({
    v120: 'undefined',
    v128: 'undefined',
    v149: 'undefined',
    v216: true,
  });
});
