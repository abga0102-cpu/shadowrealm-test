const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V371 restores green Dust feedback inside Forge without combat-area toast', async () => {
  const root = path.join(__dirname, '..');
  const auto = fs.readFileSync(path.join(root, 'auto-forge-compare-v199.js'), 'utf8');
  const ux = fs.readFileSync(path.join(root, 'forge-ux-v273.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(auto).toContain('Auto-Forge Compare V199 / V378');
  expect(auto).toContain('srAutoDustNoticeV371');
  expect(auto).toContain("color:#78E996");
  expect(auto).toContain("bottom:63px");
  expect(auto).toContain('showForgeDustNotice(expected,count)');
  expect(auto).toContain('greenForgeFeedback:true');

  expect(ux).toContain('Forge UX V273 / V371');
  expect(ux).toContain('color:#78E996');
  expect(ux).toContain('reduced?300:950');

  expect(index).toContain('name="shadowreach-build"');
  expect(index).toContain('auto-forge-compare-v199.js?v=');
  expect(index).toContain('forge-ux-v273.js?v=');
});
