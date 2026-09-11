const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'boot-stability-v115.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const retiredWaveSource = path.join(root, 'wave-display-v112.js');

test('Boot wave correction is observer-driven without a perpetual polling fallback', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(source).toContain("observe(document.body,{childList:true,subtree:true})");
  expect(source).toContain('setTimeout(syncWaveDisplay,0)');
  expect(source).not.toMatch(/setInterval\s*\(\s*syncWaveDisplay/);
});

test('retired V112 wave-display source stays absent from source and loader ownership', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(fs.existsSync(retiredWaveSource)).toBe(false);
  expect(index).not.toContain('wave-display-v112.js');
  expect(index).toContain('boot-stability-v115.js');
});
