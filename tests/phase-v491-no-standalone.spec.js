const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
test('V491 has one loaded authority and no duplicate standalone file',()=>{
 expect(fs.existsSync(path.join(root,'equipment-dust-power-v491.js'))).toBe(false);
 const src=fs.readFileSync(path.join(root,'progression-stability-authority-v304.js'),'utf8');
 expect(src).toContain('window.__srEquipmentDustPowerV491');
});
