const { test, expect } = require('@playwright/test');
const fs=require('fs');
test('V323 Minerai wrapper owns only Minerai',async()=>{
 const s=fs.readFileSync('raid-minerai-active-balance-v282.js','utf8');
 expect(s).toContain("if (type === 'minerai') return mineraiReward(level);");
});
