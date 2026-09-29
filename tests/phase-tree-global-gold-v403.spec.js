const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V470 existing Gold Tree nodes total exactly 20 percent', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const g2=fs.readFileSync(path.join(root,'game-2.js'),'utf8');

  expect(g1).toContain('effect: "goldAll", per: 0.4, unit: "%", max: 5, tierScale: false');
  expect(g1).toContain('effect: "goldAll", per: 0.8, unit: "%", max: 5, tierScale: false');
  expect(g1).toContain('effect: "goldAll", per: 1.2, unit: "%", max: 5, tierScale: false');
  expect(g1).toContain('effect: "goldAll", per: 1.6, unit: "%", max: 5, tierScale: false');
  expect(g1).toContain('function goldMul(s) { return 1 + treeSum(s, "goldAll") / 100; }');

  // Campaign, Gold Raid and paid-Forge Gold all use the same Global Gold multiplier.
  expect(g2).toContain('Math.floor(rewardAcc.gold * goldMul(s))');
  expect(g2).toContain('Math.floor(rewardAcc.gold * goldMul(st))');
  expect(g2).toContain('const amount = Math.floor(reward * goldMul(st));');
  expect(g2).toContain('Math.floor(base * goldMul(s))');
});
