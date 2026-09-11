const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const retired = 'ui-mobile-fix-v180.js';

test('retired mobile UI V180 source stays absent from the production graph', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(fs.existsSync(path.join(root, retired))).toBe(false);
  expect(index).not.toContain(retired);
  expect(index).toContain('home-layout-authority-v219.js');
  expect(index).toContain('notification-compact-v105.js');
});
