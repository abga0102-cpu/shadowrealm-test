const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srEquipmentDisplayV450 && window.__srEquipmentDisplayV450.version === 455);
}

test('V455 equipment names use the Hero-synchronised Roman level', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const api=window.__srEquipmentDisplayV450;
    return {
      one:api.name({name:'Épée rare',level:1}),
      two:api.name({name:'Épée rare',level:2}),
      four:api.name({name:'Épée rare',level:4}),
      nine:api.name({name:'Épée rare',level:9}),
      twentyFive:api.name({name:'Épée rare',level:25}),
      model:api.version
    };
  });
  expect(result).toEqual({
    one:'Épée rare | I',
    two:'Épée rare | II',
    four:'Épée rare | IV',
    nine:'Épée rare | IX',
    twentyFive:'Épée rare | XXV',
    model:455
  });
});

test('V455 keeps Dust enhancement separate from Roman equipment level', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const item={name:'Casque',level:24,upgradeLevel:7};
    return {
      label:equipmentDisplayName(item),
      roman:equipmentRomanLevel(item.level),
      upgrade:equipmentUpgradeText(item),
      level:item.level,
      upgradeLevel:item.upgradeLevel
    };
  });
  expect(result).toEqual({
    label:'Casque | XXIV',
    roman:'XXIV',
    upgrade:'+7 améliorations',
    level:24,
    upgradeLevel:7
  });
});
