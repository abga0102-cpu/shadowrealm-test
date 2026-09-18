const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V382 visibly redesigns Home skill buttons to the approved reference', async () => {
  const root = path.join(__dirname, '..');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(ui).toContain('Premium UI polish V209 / V387');
  const v382 = ui.slice(ui.indexOf('/* V382 REFERENCE SKILL BUTTONS'));
  expect(v382).toContain('border:2px solid #D9AC4D');
  expect(v382).toContain('.slot[data-skill] .skfx');
  expect(v382).toContain('border-radius:50%');
  expect(v382).toContain('stroke-width:4.5');
  expect(v382).toContain('.slot .lv');
  expect(v382).toContain('#skillbar>.slot:first-child');
  expect(v382).toContain('#skillbar .autoSk');
  expect(v382).not.toContain('saveNow');
  expect(v382).not.toContain('localStorage');

  // Later gameplay builds may advance while the current visual bundle remains V387.
  expect(index).toContain('name="shadowreach-build"');
  expect(index).toContain("var V='2026.09.19.387'");
});
