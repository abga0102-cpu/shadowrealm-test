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

test('Phase 3D leaves v138 as the sole Accomplishments Development-scope owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const homeScope = source('accomplishments-home-scope-v136.js');
  const stability = source('accomplishments-stability-v138.js');
  const legacy = executable(homeScope);

  expect(homeScope).toContain('__srAccomplishmentsHomeScopeV136');
  expect(legacy).not.toContain('MutationObserver');
  expect(legacy).not.toContain('requestAnimationFrame');
  expect(legacy).not.toContain('textContent');
  expect(legacy).not.toContain('data-sr-accomplishments-entry');

  expect(stability).toContain('__srAccomplishmentsStabilityV138');
  expect(stability).toContain('activeDevelopmentRoute');
  expect(stability).toContain('data-sr-accomplishments-v138');
  expect(stability).toContain('data-sr-accomplishments-entry');
  expect(stability).toContain('new MutationObserver');
});
