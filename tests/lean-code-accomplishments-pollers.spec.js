const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Accomplishments uses event/startup hooks instead of perpetual polling or global render wrappers', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const v121 = source('accomplishments-v121.js');
  const v126 = source('accomplishments-merge-v126.js');
  const v140 = source('accomplishments-claim-v140.js');

  expect(v121).not.toContain('setInterval(');
  expect(v121).not.toContain('oldRender=render');
  expect(v121).not.toMatch(/render\s*=\s*function/);
  expect(v121).toContain("if(typeof S!=='undefined'&&S)ensure(S)");
  expect(v121).toContain('oldShowRaidResult');
  expect(v121).toContain('seenRaidResults');
  expect(v121).toContain('raidWins++');
  expect(v121).not.toContain("document.getElementById('app').addEventListener('click'");
  expect(v140).toContain("closest('.srAch139 [data-ach]')");
  expect(v140).toContain('stopImmediatePropagation');

  expect(v126).not.toContain('setInterval(');
  expect(v126).not.toContain('oldRender=render');
  expect(v126).not.toMatch(/\brender\s*=\s*function/);
  expect(v126).toContain('__srSyncAccomplishmentMergeV126');
  expect(v126).toContain("closest('.srAch139 [data-ach]')");
  expect(v126).toContain('oldScrSanctuaire=scrSanctuaire');
  expect(v126).toContain('SCREENS.sanctuaire=scrSanctuaire');
  expect(v126).toContain('syncRewards(S)');
  expect(v126).toContain('refill(st)');
});
