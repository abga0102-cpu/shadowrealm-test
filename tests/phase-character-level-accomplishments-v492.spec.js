const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
test('V492 defines approved Hero level mineral ladder and exact 25% Premium lane',()=>{
 const src=fs.readFileSync(path.join(root,'accomplishments-character-level-v492.js'),'utf8');
 const expected='[10,250],[15,350],[20,500],[25,700],[30,1000],[35,1200],[40,1500],\n [50,2000],[60,2500],[70,3000],[80,3500],[90,4000],[100,5000]';
 expect(src).toContain(expected);
 expect(src).toContain('return Number(v)*0.25');
 expect(src).toContain("levelSource:'S.level'");
});
test('V492 uses existing claimed save maps and is loaded by Progression Pass owner',()=>{
 const src=fs.readFileSync(path.join(root,'accomplishments-character-level-v492.js'),'utf8');
 const loader=fs.readFileSync(path.join(root,'accomplishments-launcher-compact-v332.js'),'utf8');
 expect(src).toContain('a.claimed[key]=true');
 expect(src).toContain('a.premiumClaimed[key]=true');
 expect(loader).toContain('accomplishments-character-level-v492.js?v=2026.10.02.492');
});
