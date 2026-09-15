const { test, expect } = require('@playwright/test');
test('V323 Minerai high-level scaling stays +10',async({page})=>{
 await page.goto('/');
 await page.waitForFunction(()=>typeof raidReward==='function'&&window.__shadowreachRaidMineraiBalance?.version===323);
 const r=await page.evaluate(()=>[20,50,100].map(l=>raidReward('minerai',l)));
 expect(r).toEqual([1100,1400,1900]);
});
