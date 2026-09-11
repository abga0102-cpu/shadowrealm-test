const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

test('Tree V116 mode synchronization uses the canonical render lifecycle', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const source = fs.readFileSync(path.join(root, 'tree-dedicated-v116.js'), 'utf8');

  expect(source).toContain("window.addEventListener('sr:bottomnavrendered',scheduleModeSync)");
  expect(source).toContain('setTimeout(syncMode,0)');
  expect(source).not.toContain('new MutationObserver');
  expect(source).not.toMatch(/setInterval\s*\(\s*syncMode/);
});
