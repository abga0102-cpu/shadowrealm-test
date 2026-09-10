const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'tree-dedicated-v116.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

test('Tree dedicated mode is observer-driven without a perpetual polling loop', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(source).toContain('new MutationObserver(syncMode)');
  expect(source).toContain("observe(document.body,{childList:true,subtree:true})");
  expect(source).toContain('setTimeout(syncMode,0)');
  expect(source).not.toMatch(/setInterval\s*\(\s*syncMode/);
});
