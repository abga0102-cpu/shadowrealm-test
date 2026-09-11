const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const retired = 'social-bot-testers-v1.js';

test('retired Social bot tester V1 stays absent while conditional V5 remains canonical', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(fs.existsSync(path.join(root, retired))).toBe(false);
  expect(index).not.toContain(retired);
  expect(index).toContain('social-bot-testers-v5.js');
});
