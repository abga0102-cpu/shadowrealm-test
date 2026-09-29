const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V476 Autonomy yield is independent at 5%/h base and 20%/h max per resource', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const authority=fs.readFileSync(path.join(root,'familiar-ladder-authority-v295.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

  expect(g1).toContain('const AUTONOMY_BASE_YIELD_PCT_PER_HOUR = 5;');
  expect(g1).toContain('const AUTONOMY_MAX_YIELD_PCT_PER_HOUR = 20;');
  expect(g1).toContain('const TREE_AUTONOMY_YIELD_TIER_CAPS = [1.5, 3, 4.5, 6];');
  expect(g1).toContain('const TREE_AUTONOMY_YIELD_TIER_PER = [0.3, 0.6, 0.9, 1.2];');

  const effects=['afkGold','afkMinerai','afkEssence','afkEclat'];
  effects.forEach(effect=>{
    expect((g1.match(new RegExp('effect: "'+effect+'"','g'))||[]).length).toBe(4);
  });

  const start=g1.indexOf('function harvestRates(s)');
  const end=g1.indexOf('\n}',start)+2;
  const block=g1.slice(start,end);
  expect(block).toContain('autonomyYieldPct(s, "afkMinerai")');
  expect(block).toContain('autonomyYieldPct(s, "afkEssence")');
  expect(block).toContain('autonomyYieldPct(s, "afkEclat")');
  expect(block).toContain('autonomyYieldPct(s, "afkGold")');
  expect(block).not.toContain('goldMul(');

  expect(authority).toContain("AUTO_GOLD=['n1_07','n2_07','n3_07','n4_07']");
  expect(authority).toContain("AUTO_MIN=['n1_am','n2_am','n3_am','n4_am']");
  expect(authority).toContain("AUTO_ESS=['n1_ae','n2_ae','n3_ae','n4_ae']");
  expect(authority).toContain("AUTO_ECL=['n1_as','n2_as','n3_as','n4_as']");
  expect(authority).toContain('var AUTO_PER=[0.3,0.6,0.9,1.2];');
  expect(authority).toContain('var AUTO_CAP=[1.5,3,4.5,6];');
  expect(authority).toContain("resources:{minerai:'afkMinerai',essence:'afkEssence',eclat:'afkEclat',gold:'afkGold'}");
  expect(authority).toContain('globalGoldBranchMaxPct:50');

  expect(index).toContain('shadowreach-build" content="2026.09.29.476');
  expect(index).toContain('game-1.js?v=2026.09.29.476a');
  expect(index).toContain('familiar-ladder-authority-v295.js?v=2026.09.29.476e');
});
