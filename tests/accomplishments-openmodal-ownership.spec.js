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

test('Accomplishments claims refresh through the canonical action without wrapping openModal', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const legacy = executable(source('accomplishments-v121.js'));
  const canonical = executable(source('accomplishments-canonical-v139.js'));

  expect(legacy).toContain("typeof ACT.accomplishments==='function'");
  expect(legacy).toContain('ACT.accomplishments()');
  expect(canonical).toContain('ACT.accomplishments=function()');
  expect(canonical).not.toMatch(/\bopenModal\s*=\s*function/);
  expect(canonical).not.toContain('baseOpen');
});
