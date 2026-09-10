const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Tree mastery popup synchronization has one runtime owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const v149 = source('tree-mastery-v149.js');
  const v216 = source('runtime-tree-stability-v216.js');

  expect(v149).toContain('__srTreeMasteryV149');
  expect(v149).toContain('treeReqOk=function');
  expect(v149).not.toContain('showTreeNode=function');
  expect(v149).not.toContain('new MutationObserver');
  expect(v149).not.toContain('querySelectorAll(');

  expect(v216).toContain('__srRuntimeTreeStabilityV216');
  expect(v216).toContain('function syncPopup()');
  expect(v216).toContain('queuePopupSync');
  expect(v216).not.toContain('new MutationObserver');
});
