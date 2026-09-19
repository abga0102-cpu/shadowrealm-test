const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
test('V399 legacy Rebirth Gold is removed and old PR is refunded', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const g2=fs.readFileSync(path.join(root,'game-2.js'),'utf8');
  const defs=g1.slice(g1.indexOf('const REBIRTH_UPGRADES = ['),g1.indexOf('];',g1.indexOf('const REBIRTH_UPGRADES = ['))+2);
  expect(defs).not.toContain('key: "gold"');
  expect(g1).not.toContain('goldBonus: rb(s, "gold")');
  expect(g1).toContain('rebirthGoldRemovedV399');
  expect(g1).toContain('delete merged.rebirth.upgrades.gold');
  expect(g2).not.toContain('dv.goldBonus');
  expect(g2).toContain('Math.floor(rewardAcc.gold * goldMul(s))');
  expect(g2).toContain('Math.floor(skipGoldBase * goldMul(s))');
  expect(g2).toContain('Math.floor(rewardAcc.gold * goldMul(st))');
});