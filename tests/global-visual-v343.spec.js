const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const premium = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('V343 keeps the global bright-fantasy refresh inside canonical Premium UI owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(premium).toContain('Premium UI polish V209 / V343');
  expect(premium).toContain('--arcade-surface:#12335B');
  expect(premium).toContain('--primary-action-ring:#D7AE58');
  expect(premium).toContain('.frame::before,.frame::after{display:block!important}');
  expect(premium).toContain('.btn.blue{');
  expect(premium).toContain('#app.srHomeFullArena .homeForge.srForgePanel266');
  expect(premium).toContain('#tabs{');
  expect(premium).toContain('.recommendedActionCard{');

  expect(premium).not.toContain('MutationObserver');
  expect(premium).not.toContain('setInterval(');
  expect(premium).not.toContain('renderTabs=');
  expect(premium).not.toContain('openModal=');
  expect(premium).not.toContain('ACT.');

  // Preserve the current save-safety/recovery integration while changing presentation only.
  expect(index).toContain('save-safety-v340.js');
  expect(index).toContain('save-recovery-v341.js');
  expect(index).toContain('premium-ui-v209.js');
});
