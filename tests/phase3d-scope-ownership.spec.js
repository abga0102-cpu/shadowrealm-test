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

test('Phase 4F keeps v138 as the sole route-driven Accomplishments Development-scope owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const retired = 'accomplishments-home-scope-v136.js';
  expect(index, `${retired} must remain absent from the runtime loader`).not.toContain(retired);
  if (exists(retired)) {
    const legacy = executable(source(retired));
    expect(legacy).not.toContain('MutationObserver');
    expect(legacy).not.toContain('requestAnimationFrame');
    expect(legacy).not.toContain('textContent');
    expect(legacy).not.toContain('data-sr-accomplishments-entry');
  }

  const stability = source('accomplishments-stability-v138.js');
  const canonicalScope = executable(stability);
  expect(stability).toContain('__srAccomplishmentsStabilityV138');
  expect(stability).toContain('activeDevelopmentRoute');
  expect(stability).toContain('data-sr-accomplishments-v138');
  expect(stability).toContain('data-sr-accomplishments-entry');
  expect(canonicalScope).not.toContain('MutationObserver');
  expect(canonicalScope).not.toContain('textContent');
  expect(canonicalScope).toContain('window.renderTabs');
  expect(canonicalScope).toContain('schedulePlace');
  expect(canonicalScope).toContain('requestAnimationFrame');
});
