const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V420 keeps exact Global Gold caps and the V417 equipment rollback', async()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const authority=fs.readFileSync(path.join(root,'global-gold-authority-v420.js'),'utf8');
  const legacy=fs.readFileSync(path.join(root,'familiar-ladder-authority-v295.js'),'utf8');

  expect(authority).toContain("var perLevel=[1,2,3,4]");
  expect(authority).toContain("var caps=[5,10,15,20]");
  expect(authority).toContain('totalMaxPct:50');
  expect(legacy).toContain('var GLOBAL_PER={n1_06:1,n2_06:2,n3_06:3,n4_06:4}');
  expect(legacy).not.toContain("GLOBAL.forEach(function(id){var n=TREE_BY_ID[id];if(!n)return;n.per=1.25");
  expect(index).toContain('shadowreach-build" content="2026.09.22.420');
  expect(index).toContain('global-gold-authority-v420.js?v=2026.09.22.420a');
  expect(index).toContain('game-3.js?v=2026.09.22.417a');
});
