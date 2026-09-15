const { test, expect } = require('@playwright/test');
test('V323 exposes 25 percent Minerai autonomy share',async({page})=>{
 await page.goto('/');
 await page.waitForFunction(()=>window.__shadowreachRaidMineraiBalance?.version===323);
 expect(await page.evaluate(()=>window.__shadowreachRaidMineraiBalance.autonomySharePerHour)).toBe(0.25);
});
