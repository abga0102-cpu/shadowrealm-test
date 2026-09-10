const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Accomplishments uses event/startup hooks instead of perpetual polling or a V121 render wrapper', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const v121 = source('accomplishments-v121.js');
  const v126 = source('accomplishments-merge-v126.js');

  expect(v121).not.toContain('setInterval(');
  expect(v121).not.toContain('oldRender=render');
  expect(v121).not.toMatch(/render\s*=\s*function/);
  expect(v121).toContain("if(typeof S!=='undefined'&&S)ensure(S)");
  expect(v121).toContain('oldShowRaidResult');
  expect(v121).toContain('seenRaidResults');
  expect(v121).toContain('raidWins++');

  expect(v126).not.toContain('setInterval(');
  expect(v126).toContain('oldRender=render');
  expect(v126).toContain('syncRewards(S)');
  expect(v126).toContain('refill(st)');
});
