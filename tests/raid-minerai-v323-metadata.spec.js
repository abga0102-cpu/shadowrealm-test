const { test, expect } = require('@playwright/test');
const fs=require('fs');
test('V323 exposes Minerai balance metadata',async()=>{
 const src=fs.readFileSync('raid-minerai-active-balance-v282.js','utf8');
 expect(src).toContain('version: 323');
 expect(src).toContain('level1: 750');
 expect(src).toContain('level10: 1000');
 expect(src).toContain('postLevel10PerLevel: 10');
});
