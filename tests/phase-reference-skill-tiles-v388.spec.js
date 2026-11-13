const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V388 matches framed reference skill tiles and keeps cooldown off artwork', async () => {
  const root = path.join(__dirname, '..');
  const game4 = fs.readFileSync(path.join(root, 'game-4.js'), 'utf8');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(game4).toContain('srSkillRefV388');
  expect(game4).toContain('srSkillTileV388');
  expect(game4).toContain('srSkillCooldownV388');
  expect(game4).toContain('srWeaponSlotV388');
  expect(game4).toContain('srAutoRefV388');
  expect(game4).not.toContain('srSkillRingBaseV388');

  expect(ui).toContain('Premium UI polish V209 / V388');
  const v388 = ui.slice(ui.indexOf('/* V388 REFERENCE SKILL TILES'));
  expect(v388).toContain('border-radius:10px!important');
  expect(v388).toContain('top:43px!important');
  expect(v388).toContain('background:transparent!important');
  expect(v388).toContain('cooling .skfx');
  expect(v388).toContain('filter:none!important');
  expect(v388).not.toContain('.cdArc');
  expect(v388).not.toContain('saveNow');
  expect(v388).not.toContain('localStorage');

  expect(index).toContain('shadowreach-build" content="2026.09.19.388"');
  expect(index).toContain('game-4.js?v=2026.09.19.388');
  expect(index).toContain("var V='2026.09.19.388'");
});
