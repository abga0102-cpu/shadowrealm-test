const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V383 uses true circular reference skill structure', async () => {
  const root = path.join(__dirname, '..');
  const game4 = fs.readFileSync(path.join(root, 'game-4.js'), 'utf8');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(game4).toContain('srSkillRefV383');
  expect(game4).toContain('srSkillOrbV383');
  expect(game4).toContain('srSkillEmptyV383');
  expect(game4).toContain('srWeaponSlotV383');
  expect(game4).toContain('srAutoRefV383');
  expect(game4).toContain('--srSkillColor:');
  expect(game4).not.toContain(`class="slot' + (sealed ? " sealed" : "")`);

  expect(ui).toContain('Premium UI polish V209 / V383');
  const v383 = ui.slice(ui.indexOf('/* V383 TRUE REFERENCE SKILLS'));
  expect(v383).toContain('.srSkillRefV383');
  expect(v383).toContain('border-radius:50%');
  expect(v383).toContain('0 0 0 3px var(--srSkillColor)');
  expect(v383).toContain('.slot::after');
  expect(v383).toContain('display:none!important');
  expect(v383).toContain('.srAutoRefV383');
  expect(v383).not.toContain('saveNow');
  expect(v383).not.toContain('localStorage');

  expect(index).toContain('shadowreach-build" content="2026.09.19.383"');
  expect(index).toContain('game-4.js?v=2026.09.19.383');
  expect(index).toContain("var V='2026.09.19.383'");
});
