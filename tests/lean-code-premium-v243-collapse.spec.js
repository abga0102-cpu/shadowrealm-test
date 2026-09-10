const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Premium UI owns the final recommendation styling without loading v243', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  const premium = source('premium-ui-v209.js');

  expect(fs.existsSync(path.join(root, 'premium-recommendation-cleanup-v243.js'))).toBe(false);
  expect(index).toContain('premium-ui-v209.js');
  expect(index).not.toContain('premium-recommendation-cleanup-v243.js');
  expect(premium).toContain('__srPremiumUiV209');
  expect(premium).toContain('V243 final recommendation policy');
  expect(premium).toContain('.recommendedKicker{display:none!important}');
  expect(premium).toContain('[data-primary-action="true"]:not([data-primary="true"])::after');
});
