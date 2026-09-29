const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V476 keeps exact 50 percent Global Gold cap and equipment rollback', async()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const legacy=fs.readFileSync(path.join(root,'familiar-ladder-authority-v295.js'),'utf8');

  expect(legacy).toContain('var GLOBAL_PER=[1,2,3,4]');
  expect(legacy).toContain('var GLOBAL_CAP=[5,10,15,20]');
  expect(legacy).toContain('globalGoldTierCapsPct:[5,10,15,20]');
  expect(legacy).toContain('globalGoldBranchMaxPct:50');
  expect(legacy).not.toContain("GLOBAL.forEach(function(id){var n=TREE_BY_ID[id];if(!n)return;n.per=1.25");
  expect(index).toContain('shadowreach-build" content="2026.09.29.476');
  expect(index).toContain('familiar-ladder-authority-v295.js?v=2026.09.29.476e');
  expect(index).toContain('game-3.js?v=2026.09.22.417a');
});
