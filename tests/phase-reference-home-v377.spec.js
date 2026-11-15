const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V377 locks Home to annotated dark reference without gameplay ownership', async () => {
  const root = path.join(__dirname, '..');
  const home = fs.readFileSync(path.join(root, 'home-layout-authority-v219.js'), 'utf8');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(home).toContain('Home layout authority V219 / V377');
  expect(home).toContain('srEggReadyV377');
  expect(home).toContain("art/eggs/");
  expect(home).toContain("--srForgeH:180px");
  expect(home).not.toContain('saveNow');

  expect(ui).toContain('Premium UI polish V209 / V377');
  expect(ui).toContain('V377 REFERENCE LOCK');
  const v377 = ui.slice(ui.indexOf('/* V377 REFERENCE LOCK'));
  expect(v377).toContain('background-image:url("art/env_ruins.jpg")!important');
  expect(v377).toContain('.srEggReadyV377');
  expect(v377).toContain('url("art/props/brazier.png") 84% 58% / 142px');
  expect(v377).toContain('#app.srHomeFullArena #skillbar .slot');
  expect(v377).toContain('background:linear-gradient(180deg,#0E2F50');
  expect(v377).not.toContain('saveNow');
  expect(v377).not.toContain('localStorage');

  expect(index).toContain('shadowreach-build" content="2026.09.18.377"');
  expect(index).toContain("var V='2026.09.18.377'");
});
