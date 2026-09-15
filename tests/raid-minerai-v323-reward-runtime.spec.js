const { test, expect } = require('@playwright/test');
test('V323 browser runtime returns validated Minerai rewards',async({page})=>{
 await page.goto('/');
 await page.waitForFunction(()=>typeof raidReward==='function'&&window.__shadowreachRaidMineraiBalance?.version===323);
 const values=await page.evaluate(()=>[1,10,11,20,50,100].map(l=>raidReward('minerai',l)));
 expect(values).toEqual([750,1000,1010,1100,1400,1900]);
});
