const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
test('retired Rebirth never refunds or creates PR', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const g2=fs.readFileSync(path.join(root,'game-2.js'),'utf8');
  expect(g1).toContain('Rebirth and PR are retired from gameplay');
  expect(g1).toContain('const REBIRTH_UPGRADES = [];');
  expect(g1).toContain('function rb() { return 0; }');
  expect(g2).toContain('function doRebirth() { return 0; }');
  expect(g2).toContain('function buyRebirth() { return false; }');
  expect(g1).not.toContain('rebirthGoldRemovedNoticeV399');
  expect(g1).not.toContain('legacyGoldCostsV399');
});
