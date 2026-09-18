const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V379 keeps one ready-egg capsule and cleans Home hierarchy', async () => {
  const root = path.join(__dirname, '..');
  const game5 = fs.readFileSync(path.join(root, 'game-5.js'), 'utf8');
  const home = fs.readFileSync(path.join(root, 'home-layout-authority-v219.js'), 'utf8');
  const ui = fs.readFileSync(path.join(root, 'premium-ui-v209.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(game5).toContain('V379: Home owns one consolidated ready-egg capsule.');
  expect(game5).toContain('const homeEggCapsule = route === "accueil"');
  expect(game5).toContain('title === "Œuf prêt à éclore" ? " eggReady"');

  expect(home).toContain('Home layout authority V219 / V379');
  expect(home).toContain('function eggReadyCount()');
  expect(home).toContain("readyCount>1?' · '+readyCount:''");
  expect(home).toContain("readyCount>1?' · voir les autres':''");

  expect(ui).toContain('Premium UI polish V209 / V379');
  const v379 = ui.slice(ui.indexOf('/* V379 CLEAN HOME HIERARCHY'));
  expect(v379).toContain('hue-rotate(18deg)');
  expect(v379).toContain('bottom -15px / 100px');
  expect(v379).toContain('#rewardFeed .rewardPop.eggReady{display:none!important}');
  expect(v379).toContain('min-width:110px!important');
  expect(v379).not.toContain('saveNow');
  expect(v379).not.toContain('localStorage');

  expect(index).toContain('name="shadowreach-build"');
  expect(index).toContain('game-5.js?v=');
});
