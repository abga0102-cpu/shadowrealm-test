const { test, expect } = require('@playwright/test');
test('V323 Minerai authority loads in browser',async({page})=>{
 await page.goto('/');
 await page.waitForFunction(()=>window.__shadowreachRaidMineraiBalance);
 const meta=await page.evaluate(()=>window.__shadowreachRaidMineraiBalance);
 expect(meta.version).toBe(323);
 expect(meta.level1).toBe(750);
 expect(meta.level10).toBe(1000);
 expect(meta.postLevel10PerLevel).toBe(10);
});
