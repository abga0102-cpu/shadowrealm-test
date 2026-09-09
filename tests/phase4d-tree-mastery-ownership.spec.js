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

test('Phase 4D leaves v149 as the sole tree mastery gating and popup owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const legacyRule = source('tree-mastery-v120.js');
  const legacyUi = source('tree-mastery-ui-v128.js');
  const canonical = source('tree-mastery-v149.js');
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

  expect(canonical).toContain('__srTreeMasteryV149');
  expect(canonical).toContain('var REQUIRED=3');
  expect(canonical).toContain('treeReqOk=function');
  expect(canonical).toContain('showTreeNode=function');
  expect(canonical).toContain('new MutationObserver');

  const v120 = index.indexOf('tree-mastery-v120.js');
  const v128 = index.indexOf('tree-mastery-ui-v128.js');
  const v149 = index.indexOf('tree-mastery-v149.js');
  expect(v120).toBeGreaterThan(-1);
  expect(v128).toBeGreaterThan(v120);
  expect(v149).toBeGreaterThan(v128);
  expect(index.match(/tree-mastery-v149\.js/g) || []).toHaveLength(1);
});
