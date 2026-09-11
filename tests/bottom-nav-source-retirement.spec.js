const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const owner = fs.readFileSync(path.join(root, 'bottom-nav-layout-v183.js'), 'utf8');
const retired = [
  'bottom-nav-development-v186.js',
  'bottom-nav-active-normalize-v187.js',
];

test('retired BottomNav V186/V187 sources stay absent behind the V209 owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  for (const file of retired) {
    expect(fs.existsSync(path.join(root, file)), `${file} should stay retired`).toBe(false);
    expect(index, `${file} must stay absent from production loaders`).not.toContain(file);
  }

  expect(index).toContain('bottom-nav-layout-v183.js');
  expect(owner).toContain('__srBottomNavGeometryV209');
  expect(owner).toContain('normalizeIconSlot');
  expect(owner).not.toContain('MutationObserver');
});
