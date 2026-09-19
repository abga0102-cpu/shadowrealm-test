const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V391 polishes V388 skill tiles without changing structure', async () => {
  const root = path.join(__dirname, '..');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(ui).toContain('Premium UI polish V209 / V391');
  const v391 = ui.slice(ui.indexOf('/* V391 SKILL BAND POLISH'));
  expect(v391).toContain('.srSkillRefV388 .skfx>svg');
  expect(v391).toContain('width:32px!important');
  expect(v391).toContain('top:45px!important');
  expect(v391).toContain('font-size:7.3px!important');
  expect(v391).toContain('.srSkillLevelV388');
  expect(v391).toContain('top:3px!important');
  expect(v391).toContain('.srSkillEffectV388');
  expect(v391).toContain('left:-1px!important');
  expect(v391).not.toContain('saveNow');
  expect(v391).not.toContain('localStorage');

  expect(index).toContain('shadowreach-build" content="2026.09.19.391"');
  expect(index).toContain("var V='2026.09.19.391'");
});
