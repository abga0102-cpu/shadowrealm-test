const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V415 Autonomy caps at 16h with exactly +100% Tree boost', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

  expect(g1).toContain('AFK_BASE_HOURS: 8');
  expect(g1).toContain('const TREE_AUTONOMY_TIER_CAPS = [10, 20, 30, 40];');
  expect(g1).toContain('function afkCapHours(s) { return Math.min(16, RULES.AFK_BASE_HOURS * (1 + treeSum(s, "afkTime") / 100)); }');

  const nodes=[...g1.matchAll(/\{[^{}\n]*effect:\s*"afkTime"[^{}\n]*\}/g)].map(m=>m[0]);
  expect(nodes).toHaveLength(4);
  const expected=[{tier:1,per:2},{tier:2,per:4},{tier:3,per:6},{tier:4,per:8}];
  nodes.forEach((n,i)=>{
    expect(n).toContain('tier: '+expected[i].tier);
    expect(n).toContain('per: '+expected[i].per);
    expect(n).toContain('max: 5');
    expect(n).toContain('tierScale: false');
  });
  expect(expected.reduce((sum,x)=>sum+x.per*5,0)).toBe(100);
  expect(index).toContain("var V='2026.09.22.415'");
  expect(index).toContain('game-1.js?v=2026.09.22.415a');
});
