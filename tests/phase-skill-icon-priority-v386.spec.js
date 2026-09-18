const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V386 keeps skill art visible while cooldowns stay secondary', async () => {
  const root = path.join(__dirname, '..');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(ui).toContain('Premium UI polish V209 / V387');
  const v386 = ui.slice(ui.indexOf('/* V386 SKILL ICON PRIORITY'));
  expect(v386).toContain('.srSkillRefV383 .skfx>svg');
  expect(v386).toContain('width:30px!important');
  expect(v386).toContain('stroke-width:2.8!important');
  expect(v386).toContain('font-size:9.5px!important');
  expect(v386).toContain('.cdTxt:empty');
  expect(v386).toContain('filter:brightness(.96) saturate(.96)!important');
  expect(v386).toContain(':not(.cooling) .srSkillOrbV383');
  expect(v386).not.toContain('saveNow');
  expect(v386).not.toContain('localStorage');

  expect(index).toContain('name="shadowreach-build"');
  expect(index).toContain("var V='2026.09.19.387'");
});
