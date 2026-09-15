const { test, expect } = require('@playwright/test');
test('V323 Minerai early ramp matches design',async({page})=>{
 await page.goto('/');
 await page.waitForFunction(()=>typeof raidReward==='function'&&window.__shadowreachRaidMineraiBalance?.version===323);
 const r=await page.evaluate(()=>Array.from({length:10},(_,i)=>raidReward('minerai',i+1)));
 expect(r).toEqual([750,780,810,840,870,900,930,960,980,1000]);
});
