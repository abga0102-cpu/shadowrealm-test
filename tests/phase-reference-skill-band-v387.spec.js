const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V387 matches the approved skill-band hierarchy', async () => {
  const root = path.join(__dirname, '..');
  const game4 = fs.readFileSync(path.join(root, 'game-4.js'), 'utf8');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(game4).toContain('srSkillRefV387');
  expect(game4).toContain('srSkillOrbV387');
  expect(game4).toContain('srSkillCooldownV387');
  expect(game4).toContain('srSkillEffectV387');
  expect(game4).toContain('srSkillLevelV387');
  expect(game4).toContain('srWeaponSlotV387');
  expect(game4).toContain('srAutoRefV387');

  expect(ui).toContain('Premium UI polish V209 / V387');
  const v387 = ui.slice(ui.indexOf('/* V387 REFERENCE SKILL BAND'));
  expect(v387).toContain('top:42px!important');
  expect(v387).toContain('background:transparent!important');
  expect(v387).toContain('stroke-width:2.15!important');
  expect(v387).toContain('width:29px!important');
  expect(v387).toContain('.srSkillCooldownV387:empty');
  expect(v387).toContain('.srSkillEffectV387');
  expect(v387).not.toContain('saveNow');
  expect(v387).not.toContain('localStorage');

  expect(index).toContain('shadowreach-build" content="2026.09.19.387"');
  expect(index).toContain('game-4.js?v=2026.09.19.387');
  expect(index).toContain("var V='2026.09.19.387'");
});
