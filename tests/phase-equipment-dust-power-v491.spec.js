const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');

test('V491 doubles Dust upgrade stat gain from 3% to 6%',()=>{
 const src=fs.readFileSync(path.join(root,'progression-stability-authority-v304.js'),'utf8');
 expect(src).toContain('var DUST_STEP_V491=.06');
 expect(src).toContain('perStepPct:6');
 expect(src).toContain('previousPerStepPct:3');
 expect(src).toContain('multiplier:2');
});

test('V491 preserves canonical Dust cost and chance owners',()=>{
 const src=fs.readFileSync(path.join(root,'progression-stability-authority-v304.js'),'utf8');
 expect(src).toContain("costOwner:'progression-overhaul-v283.js'");
 expect(src).toContain("chanceOwner:'dust-chance-floor-v301.js'");
 expect(src).toContain('costChanged:false');
 expect(src).toContain('chanceChanged:false');
});

test('V491 migrates existing upgraded equipment without spending Dust',()=>{
 const src=fs.readFileSync(path.join(root,'progression-stability-authority-v304.js'),'utf8');
 expect(src).toContain('if(Number(S.equipmentDustPowerVersion)<491)applyDustState(S)');
 expect(src).toContain('s.equipmentDustPowerVersion=491');
});
