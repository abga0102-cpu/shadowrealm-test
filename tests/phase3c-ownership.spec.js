const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const exists = (name) => fs.existsSync(path.join(root, name));
const index = source('index.html');
const executable = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

const retired = ['accomplishments-overview-v135.js', 'accomplishments-floors-v137.js'];

test('Phase 3C leaves v139 as the sole Accomplishments rendering owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  for (const file of retired) {
    expect(index, `${file} must remain absent from the runtime loader`).not.toContain(file);
    if (exists(file)) {
      const legacy = source(file);
      expect(executable(legacy)).not.toContain('ACT.accomplishments=');
      expect(executable(legacy)).not.toContain('openModal=');
      expect(executable(legacy)).not.toContain('new MutationObserver');
    }
  }

  const canonical = source('accomplishments-canonical-v139.js');
  expect(canonical).toContain('__srAccomplishmentsCanonicalV139');
  expect(canonical).toContain('ACT.accomplishments=function');
  expect(canonical).toContain('data-ach-overview-v135');
  expect(canonical).toContain('data-ach-floors-v138');
});
