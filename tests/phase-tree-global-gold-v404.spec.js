const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V470 Global Gold caps are exactly 2/4/6/8 and +20 total', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const g2=fs.readFileSync(path.join(root,'game-2.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

  expect(g1).toContain('const TREE_GOLD_TIER_CAPS = [2, 4, 6, 8];');
  const nodes=[...g1.matchAll(/\{[^{}\n]*effect:\s*"goldAll"[^{}\n]*\}/g)].map(m=>m[0]);
  expect(nodes).toHaveLength(4);
  const expected=[{tier:1,per:0.4},{tier:2,per:0.8},{tier:3,per:1.2},{tier:4,per:1.6}];
  nodes.forEach((n,i)=>{
    expect(n).toContain('tier: '+expected[i].tier);
    expect(n).toContain('per: '+expected[i].per);
    expect(n).toContain('max: 5');
    expect(n).toContain('tierScale: false');
  });
  expect(expected.reduce((sum,x)=>sum+x.per*5,0)).toBe(20);
  expect(g1).toContain('function goldMul(s) { return 1 + treeSum(s, "goldAll") / 100; }');
  expect(g2).toContain('Math.floor(rewardAcc.gold * goldMul(s))');
  expect(g2).toContain('Math.floor(rewardAcc.gold * goldMul(st))');
  expect(index).toContain("var V='2026.09.29.470'");
  expect(index).toContain('game-1.js?v=2026.09.29.470a');
  expect(index).toContain('game-2.js?v=2026.09.29.470b');
});
