const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const retired = [
  'ui-stability-v75.js',
  'ui-stability-v77.js',
  'ui-stability-v78.js',
  'ui-stability-v79.js',
  'ui-stability-v80.js',
  'ui-stability-v81.js',
  'ui-stability-v82.js',
];
const canonical = 'ui-stability-v83.js';

test('retired UI stability generations stay absent while V83 remains canonical', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  for (const file of retired) {
    expect(fs.existsSync(path.join(root, file)), `${file} should stay retired`).toBe(false);
    expect(index, `${file} must stay absent from production loaders`).not.toContain(file);
  }

  expect(fs.existsSync(path.join(root, canonical)), `${canonical} must remain the canonical source`).toBe(true);
  expect(index).toContain(canonical);
});
