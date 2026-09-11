const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('V121 stays compatibility-only while V139/V140 own UI and claims', async () => {
  const v121 = read('accomplishments-v121.js');
  const v139 = read('accomplishments-canonical-v139.js');
  const v140 = read('accomplishments-claim-v140.js');

  expect(v121).toContain('showRaidResult=function');
  expect(v121).toContain('ACT.fuse=');
  expect(v121).not.toContain('ACT.accomplishments=');
  expect(v121).not.toContain('openModal(');
  expect(v121).not.toContain('data-ach=');
  expect(v121).not.toContain('function claim(');
  expect(v121).not.toContain('function grant(');

  expect(v139).toContain('ACT.accomplishments=function');
  expect(v139).toContain("openModal(html(),'Accomplissements')");
  expect(v140).toContain('function claim(id,choice)');
  expect(v140).toContain("closest('.srAch139 [data-ach]')");
});
