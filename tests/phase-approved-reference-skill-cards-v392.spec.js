const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V392 matches the approved reference skill card composition', async () => {
  const root = path.join(__dirname, '..');
  const game4 = fs.readFileSync(path.join(root, 'game-4.js'), 'utf8');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(game4).toContain('srSkillRefV392');
  expect(game4).toContain('srSkillCardV392');
  expect(game4).toContain('srSkillCooldownV392');
  expect(game4).toContain('srSkillEffectV392');
  expect(game4).toContain('srSkillLevelV392');
  expect(game4).toContain('srWeaponSlotV392');
  expect(game4).toContain('srAutoRefV392');

  expect(ui).toContain('Premium UI polish V209 / V392');
  const v392 = ui.slice(ui.indexOf('/* V392 APPROVED REFERENCE SKILL CARDS'));
  expect(v392).toContain('border-radius:12px!important');
  expect(v392).toContain('width:38px!important');
  expect(v392).toContain('top:11px!important');
  expect(v392).toContain('font-size:13.2px!important');
  expect(v392).toContain('background:transparent!important');
  expect(v392).toContain('bottom:-3px!important');
  expect(v392).toContain('.srSkillLevelV392');
  expect(v392).not.toContain('saveNow');
  expect(v392).not.toContain('localStorage');

  expect(index).toContain('shadowreach-build" content="2026.09.19.392"');
  expect(index).toContain('game-4.js?v=2026.09.19.392');
  expect(index).toContain("var V='2026.09.19.392'");
});
