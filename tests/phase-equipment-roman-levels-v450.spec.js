const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srEquipmentDisplayV450 && typeof S !== 'undefined');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V450 equipment names have no suffix when fresh and Roman suffix after upgrades', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const api=window.__srEquipmentDisplayV450;
    return {
      fresh:api.name({name:'Épée rare',level:0}),
      one:api.name({name:'Épée rare',level:1}),
      two:api.name({name:'Épée rare',level:2}),
      four:api.name({name:'Épée rare',level:4}),
      nine:api.name({name:'Épée rare',level:9}),
      twentyFive:api.name({name:'Épée rare',level:25}),
      rawLevel:25
    };
  });
  expect(result).toEqual({fresh:'Épée rare',one:'Épée rare | I',two:'Épée rare | II',four:'Épée rare | IV',nine:'Épée rare | IX',twentyFive:'Épée rare | XXV',rawLevel:25});
});

test('V450 is presentation-only and does not rewrite item.level', async ({ page }) => {
  await openCleanGame(page);
  const result=await page.evaluate(() => {
    const item={name:'Casque',level:3};
    const label=window.__srEquipmentDisplayV450.name(item);
    return {label,level:item.level};
  });
  expect(result).toEqual({label:'Casque | III',level:3});
});
