const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const exists = (name) => fs.existsSync(path.join(root, name));

test('post-4G retires the dormant Phase 2B Home bundle without changing current ownership', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  const homeAuthority = source('home-layout-authority-v219.js');

  expect(index).not.toContain('social-forge-layout-v1.js');
  expect(index).not.toContain('home-layout-fix-v119.js');
  expect(exists('social-forge-layout-v1.js')).toBe(false);
  expect(exists('home-layout-fix-v119.js')).toBe(false);

  expect(homeAuthority).toContain('__srHomeLayoutAuthorityV219');
  expect(homeAuthority).toContain('__srHomeFramePhase2B');
  expect(homeAuthority).toContain('__srHomeLayoutPhase2B');
  expect(homeAuthority).toContain('__srSyncHomeFramePhase2B');
  expect(homeAuthority).toContain('__srHomeLayoutCompatV119');
  expect(homeAuthority).toContain('__srApplyHomeCompatV119');
  expect(homeAuthority).toContain("addEventListener('sr:bottomnavrendered',schedule)");
  expect(homeAuthority).not.toContain('window.renderTabs=function');
});
