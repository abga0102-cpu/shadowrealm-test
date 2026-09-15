const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const executable = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

test('Progression Pass stays inside the existing Accomplishments owners', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const stability = executable(source('accomplishments-stability-v138.js'));
  const canonical = executable(source('accomplishments-canonical-v139.js'));
  const claims = executable(source('accomplishments-claim-v140.js'));

  expect(stability).toContain('srAchArenaLauncher138');
  expect(stability).toContain("window.addEventListener('sr:bottomnavrendered'");
  expect(stability).toContain("window.addEventListener('sr:modal-state'");
  expect(stability).not.toContain('MutationObserver');
  expect(stability).not.toMatch(/renderTabs\s*=\s*function/);

  expect(canonical).toContain('Pass Progression');
  expect(canonical).toContain("data-ach-tab=\"etages\"");
  expect(canonical).toContain("data-ach-tab=\"defis\"");
  expect(canonical).toContain('PREMIUM_TEXT');
  expect(canonical).toContain('__srAccomplishmentsLauncherStateV139');
  expect(canonical).toContain('ACT.accomplishments=function()');
  expect(canonical).not.toMatch(/\bopenModal\s*=\s*function/);

  expect(claims).toContain('PREMIUM_REWARDS');
  expect(claims).toContain('premiumClaimed');
  expect(claims).toContain('premiumPass');
  expect(claims).toContain('data-ach-premium');
  expect(claims).toContain('floor400:function(){return bossClear(800);}');
});

test('Premium is additive and does not replace the free reward table', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const claims = source('accomplishments-claim-v140.js');
  expect(claims).toContain('var REWARDS={');
  expect(claims).toContain('var PREMIUM_REWARDS={');
  expect(claims).toContain('floor25:{essence:250}');
  expect(claims).toContain('floor25:{essence:100}');
  expect(claims).toContain('if(!premiumOwned(a)||a.premiumClaimed[id])return false;');
});