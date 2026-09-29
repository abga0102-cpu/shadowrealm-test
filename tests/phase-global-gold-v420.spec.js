const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V470 keeps exact 20 percent Global Gold cap and equipment rollback', async()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const legacy=fs.readFileSync(path.join(root,'familiar-ladder-authority-v295.js'),'utf8');

  expect(legacy).toContain('var GLOBAL_PER={n1_06:0.4,n2_06:0.8,n3_06:1.2,n4_06:1.6}');
  expect(legacy).toContain('var GLOBAL_CAP={n1_06:2,n2_06:4,n3_06:6,n4_06:8}');
  expect(legacy).toContain('globalGoldTierCapsPct:[2,4,6,8]');
  expect(legacy).toContain('globalGoldBranchMaxPct:20');
  expect(legacy).not.toContain("GLOBAL.forEach(function(id){var n=TREE_BY_ID[id];if(!n)return;n.per=1.25");
  expect(index).toContain('shadowreach-build" content="2026.09.29.470');
  expect(index).toContain('familiar-ladder-authority-v295.js?v=2026.09.29.470d');
  expect(index).toContain('game-3.js?v=2026.09.22.417a');
});
