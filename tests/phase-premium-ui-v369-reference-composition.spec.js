const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V369 strict reference composition owns geometry in Home authority and keeps UI visual-only', async () => {
  const root = path.join(__dirname, '..');
  const home = fs.readFileSync(path.join(root, 'home-layout-authority-v219.js'), 'utf8');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(home).toContain('Home layout authority V219 / V369');
  expect(home).toContain('--srHudH:108px;--srSkillH:62px;--srForgeH:184px');
  expect(home).toContain('top:calc(var(--srHudH) + 10px)!important');

  expect(ui).toContain('Premium UI polish V209 / V369');
  expect(ui).toContain('V369 STRICT REFERENCE COMPOSITION');
  const v369 = ui.slice(ui.indexOf('/* V369 STRICT REFERENCE COMPOSITION'));
  expect(v369).toContain('.srForgeLootReserve266');
  expect(v369).toContain('height:38px!important');
  expect(v369).toContain('#app.srHomeFullArena>#toast');
  expect(v369).not.toContain('saveNow');
  expect(v369).not.toContain('localStorage');
  expect(v369).not.toContain('S.');

  expect(index).toContain('home-layout-authority-v219.js');
  expect(index).toContain('premium-ui-v209.js');
});
