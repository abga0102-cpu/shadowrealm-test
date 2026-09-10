const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const executable = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n')
  .trim();

test('post-4G retires the dormant Phase 2B Home bundle without changing current ownership', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  const dormant = source('social-forge-layout-v1.js');
  const homeAuthority = source('home-layout-authority-v219.js');
  const compatibility = source('home-layout-fix-v119.js');

  expect(index).not.toContain('social-forge-layout-v1.js');
  expect(executable(dormant)).toBe('');

  expect(homeAuthority).toContain('__srHomeLayoutAuthorityV219');
  expect(homeAuthority).toContain('__srHomeFramePhase2B');
  expect(homeAuthority).toContain('__srSyncHomeFramePhase2B');
  expect(homeAuthority).toContain('window.renderTabs=function');

  expect(compatibility).toContain('__srHomeLayoutCompatV119');
  expect(compatibility).toContain('__srApplyHomeCompatV119');
  expect(executable(compatibility)).not.toContain('window.renderTabs=function');
});
