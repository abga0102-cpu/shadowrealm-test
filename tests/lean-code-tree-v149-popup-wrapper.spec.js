const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Tree mastery gating and popup synchronization have one active runtime owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const v216 = source('runtime-tree-stability-v216.js');

  expect(fs.existsSync(path.join(root, 'tree-mastery-v149.js'))).toBe(false);
  expect(v216).toContain('__srRuntimeTreeStabilityV216');
  expect(v216).toContain('treeReqOk=function');
  expect(v216).toContain('masteryLevelRequired=LEVEL');
  expect(v216).toContain('function syncPopup()');
  expect(v216).toContain('queuePopupSync');
  expect(v216).not.toContain('new MutationObserver');
});
