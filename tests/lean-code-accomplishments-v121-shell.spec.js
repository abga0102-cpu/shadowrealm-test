const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Accomplishments V121 is compatibility tracking only', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const legacy = source('accomplishments-v121.js');
  const canonical = source('accomplishments-canonical-v139.js');
  const claims = source('accomplishments-claim-v140.js');

  expect(legacy).toContain("if(typeof S!=='undefined'&&S)ensure(S)");
  expect(legacy).toContain('oldShowRaidResult');
  expect(legacy).toContain('seenRaidResults');
  expect(legacy).toContain('raidWins++');
  expect(legacy).toContain('oldFuse=ACT.fuse');
  expect(legacy).toContain('fusedPetRank=Math.max');

  expect(legacy).not.toContain('const A=[');
  expect(legacy).not.toContain('function rewardText(');
  expect(legacy).not.toContain('function grant(');
  expect(legacy).not.toContain('function row(');
  expect(legacy).not.toContain('function open(');
  expect(legacy).not.toContain('function claim(');
  expect(legacy).not.toContain('ACT.accomplishments=');
  expect(legacy).not.toContain('data-ach=');

  expect(canonical).toContain('ACT.accomplishments=function()');
  expect(canonical).toContain('var ITEMS=');
  expect(claims).toContain('var REWARDS=');
  expect(claims).toContain('function claim(');
});
