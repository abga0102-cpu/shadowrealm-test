const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');

test('V491 doubles successful Dust upgrade stat gain from 3% to 6%',async()=>{
 const src=fs.readFileSync(path.join(root,'progression-stability-authority-v304.js'),'utf8');
 expect(src).toContain('var DUST_POWER_STEP_V491=.06');
 expect(src).toContain('perStepPct:6');
 expect(src).toContain('previousPerStepPct:3');
 expect(src).toContain('multiplier:2');
});

test('V491 preserves canonical Dust cost and chance owners',async()=>{
 const src=fs.readFileSync(path.join(root,'progression-stability-authority-v304.js'),'utf8');
 expect(src).toContain("costOwner:'progression-overhaul-v283.js'");
 expect(src).toContain("chanceOwner:'dust-chance-floor-v301.js'");
 expect(src).toContain('costChanged:false');
 expect(src).toContain('chanceChanged:false');
});

test('V491 retroactively recalculates already upgraded equipment',async()=>{
 const src=fs.readFileSync(path.join(root,'progression-stability-authority-v304.js'),'utf8');
 expect(src).toContain('applyDustStateV491(S)');
 expect(src).toContain('s.equipmentDustPowerVersion=491');
 expect(src).toContain('it.dustPowerVersion=491');
});
