const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
test('retired Rebirth cannot modify campaign gold', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const g2=fs.readFileSync(path.join(root,'game-2.js'),'utf8');
  expect(g1).not.toContain('goldBonus: rb(s, "gold")');
  expect(g2).not.toContain('dv.goldBonus');
  expect(g2).toContain('Math.floor(rewardAcc.gold * goldMul(s))');
  expect(g2).toContain('Math.floor(rewardAcc.gold * goldMul(st))');
});
