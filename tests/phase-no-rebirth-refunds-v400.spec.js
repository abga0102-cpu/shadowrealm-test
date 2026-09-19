const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
test('V400 retired Rebirth never refunds or creates PR', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  expect(g1).toContain('Rebirth and PR are retired');
  expect(g1).not.toContain('rebirthGoldRemovedNoticeV399');
  expect(g1).not.toContain('legacyGoldCostsV399');
  const caps=g1.slice(g1.indexOf('// Rebirth/PR retired: keep old compatibility markers'),
    g1.indexOf('// La Prospection d\'Or autonome'));
  expect(caps).not.toContain('merged.rebirth.pr');
  expect(caps).not.toContain('refundPR');
  expect(g1).not.toContain('goldBonus: rb(s, "gold")');
});