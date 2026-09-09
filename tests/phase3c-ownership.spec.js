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

test('Phase 3C leaves v139 as the sole Accomplishments rendering owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const overview = source('accomplishments-overview-v135.js');
  const floors = source('accomplishments-floors-v137.js');
  const canonical = source('accomplishments-canonical-v139.js');

  expect(overview).toContain('__srAccomplishmentsOverviewV135');
  expect(floors).toContain('__srAccomplishmentsFloorsV137');

  for (const legacy of [executable(overview), executable(floors)]) {
    expect(legacy).not.toContain('ACT.accomplishments=');
    expect(legacy).not.toContain('openModal=');
    expect(legacy).not.toContain('new MutationObserver');
  }

  expect(canonical).toContain('__srAccomplishmentsCanonicalV139');
  expect(canonical).toContain('ACT.accomplishments=function');
  expect(canonical).toContain('data-ach-overview-v135');
  expect(canonical).toContain('data-ach-floors-v138');
});
