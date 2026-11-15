const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
test('V398 later Tree depths give stronger percentage bonuses only', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const g5=fs.readFileSync(path.join(root,'game-5.js'),'utf8');
  expect(g1).toContain('const TREE_TIER_PERCENT_MUL = [1.00, 1.15, 1.30, 1.50]');
  expect(g1).toContain('if (node.unit !== "%" || node.special || node.tierScale === false) return node.per');
  expect(g1).toContain('treeLv(s, n.id) * treeEffectivePer(n)');
  expect(g5).toContain('const v = treeEffectivePer(node) * level');
  expect(g5).toContain('Math.round(v * 100) / 100');
});