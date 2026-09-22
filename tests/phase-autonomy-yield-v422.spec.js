const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V422 Autonomy yield is 5%/h base and 20%/h max for every reserve resource', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const authority=fs.readFileSync(path.join(root,'familiar-ladder-authority-v295.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

  expect(g1).toContain('const AUTONOMY_BASE_YIELD_PCT_PER_HOUR = 5;');
  expect(g1).toContain('const AUTONOMY_MAX_YIELD_PCT_PER_HOUR = 20;');
  expect(g1).toContain('const TREE_AUTONOMY_YIELD_TIER_CAPS = [1.5, 3, 4.5, 6];');
  expect(g1).toContain('AUTONOMY_BASE_YIELD_PCT_PER_HOUR + Math.max(0, treeSum(s, "afkGain"))');

  const nodes=[...g1.matchAll(/\{[^{}\n]*effect:\s*"afkGain"[^{}\n]*\}/g)].map(m=>m[0]);
  expect(nodes).toHaveLength(4);
  const expected=[0.3,0.6,0.9,1.2];
  nodes.forEach((n,i)=>{
    expect(n).toContain('per: '+expected[i]);
    expect(n).toContain('max: 5');
    expect(n).toContain('tierScale: false');
    expect(n).toContain('Rendement Autonomie');
  });
  expect(expected.reduce((sum,v)=>sum+v*5,0)).toBeCloseTo(15,10);

  const start=g1.indexOf('function harvestRates(s)');
  const end=g1.indexOf('\n}',start)+2;
  const block=g1.slice(start,end);
  expect(block).toContain('const share = autonomyYieldPct(s) / 100;');
  expect(block).toContain('raidReward("minerai", s.raids.minerai.level) * share');
  expect(block).toContain('raidReward("familier", s.raids.familier.level) * share');
  expect(block).toContain('raidReward("competence", s.raids.competence.level) * share');
  expect(block).toContain('raidReward("or", s.raids.or.level) * share');
  expect(block).not.toContain('goldMul(');

  expect(authority).toContain('var AUTO_PER={n1_07:0.3,n2_07:0.6,n3_07:0.9,n4_07:1.2};');
  expect(authority).toContain('var AUTO_CAP={n1_07:1.5,n2_07:3,n3_07:4.5,n4_07:6};');
  expect(authority).toContain("var share=Math.min(20,5+bonus)/100;");
  expect(authority).toContain("resources:['minerai','essence','eclat','gold']");
  expect(authority).toContain('var GLOBAL_PER={n1_06:1,n2_06:2,n3_06:3,n4_06:4};');
  expect(authority).toContain('var GLOBAL_CAP={n1_06:5,n2_06:10,n3_06:15,n4_06:20};');

  expect(index).toContain('shadowreach-build" content="2026.09.22.422');
  expect(index).toContain('game-1.js?v=2026.09.22.422a');
  expect(index).toContain('familiar-ladder-authority-v295.js?v=2026.09.22.422a');
  expect(index).toContain('game-3.js?v=2026.09.22.417a');
});
