const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V368 safe reference UI stays presentation-only and cache-busted', async () => {
  const root = path.join(__dirname, '..');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(ui).toContain('Premium UI polish V209');
  expect(ui).toContain('V368 SAFE REFERENCE REBUILD');
  expect(ui).toContain('#app.srHomeFullArena #arenaBg');
  expect(ui).toContain('#app.srHomeFullArena .homeForge.srForgePanel266');
  expect(ui).toContain('#tabs>.tab.on');

  const v368 = ui.slice(ui.indexOf('/* V368 SAFE REFERENCE REBUILD'));
  expect(v368).not.toContain('--srHudH:');
  expect(v368).not.toContain('--srSkillH:');
  expect(v368).not.toContain('--srForgeH:');
  expect(v368).not.toContain('localStorage');
  expect(v368).not.toContain('saveNow');
  expect(v368).not.toContain('S.');

  expect(index).toContain('premium-ui-v209.js');
  expect(index).toContain('home-layout-authority-v219.js');
});
