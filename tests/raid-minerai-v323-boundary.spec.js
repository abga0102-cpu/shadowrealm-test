const { test, expect } = require('@playwright/test');
test('V323 Minerai level 10 to 11 boundary is +10',async({page})=>{
 await page.goto('/');
 await page.waitForFunction(()=>typeof raidReward==='function'&&window.__shadowreachRaidMineraiBalance?.version===323);
 const r=await page.evaluate(()=>[raidReward('minerai',10),raidReward('minerai',11)]);
 expect(r).toEqual([1000,1010]);
});
