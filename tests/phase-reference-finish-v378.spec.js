const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V378 keeps reference hierarchy and Forge-local Dust feedback', async () => {
  const root = path.join(__dirname, '..');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const auto = fs.readFileSync(path.join(root, 'auto-forge-compare-v199.js'), 'utf8');
  const compare = fs.readFileSync(path.join(root, 'forge-comparison-authority-v146.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(ui).toContain('Premium UI polish V209 / V378');
  const v378 = ui.slice(ui.indexOf('/* V378 TARGETED REFERENCE FINISH'));
  expect(v378).toContain('top:calc(var(--srHudH) + 10px)!important');
  expect(v378).toContain('#app.srHomeFullArena #arena .floorTag');
  expect(v378).toContain('top:calc(var(--srHudH) + 66px)!important');
  expect(v378).toContain('url("art/props/bush.png")');
  expect(v378).toContain('url("art/props/crystal.png")');
  expect(v378).toContain('hue-rotate(-18deg)');
  expect(v378).toContain('srForgeFirePulseV378');
  expect(v378).toContain('clip-path:polygon');
  expect(v378).toContain('#app.srHomeFullArena #skillbar .slot .cdArc');
  expect(v378).not.toContain('saveNow');
  expect(v378).not.toContain('localStorage');

  expect(auto).toContain('Auto-Forge Compare V199 / V378');
  expect(auto).toContain('window.__srShowForgeDustNoticeV378=showForgeDustNotice');
  expect(compare).toContain('Forge comparison authority v146 / V378');
  expect(compare).toContain('forgeDustNoticeV378');
  expect(compare).toContain("forgeDustNoticeV378(dust,'Équipement recyclé')");

  expect(index).toContain('shadowreach-build" content="2026.09.18.378"');
  expect(index).toContain('forge-comparison-authority-v146.js?v=2026.09.18.378');
  expect(index).toContain('auto-forge-compare-v199.js?v=2026.09.18.378');
  expect(index).toContain("var V='2026.09.18.378'");
});
