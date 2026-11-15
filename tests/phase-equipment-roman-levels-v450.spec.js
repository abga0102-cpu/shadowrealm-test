const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srEquipmentDisplayV450 &&
    window.__srEquipmentDisplayV450.version === 456 &&
    window.__srForgeLifetimeMasteryV445 &&
    window.__srEquipmentMasterySyncV456
  );
}

test('V456 equipment Roman level is the Equipment Mastery rank I through IX', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const api=window.__srEquipmentDisplayV450;
    return {
      none:api.name({name:'Épée rare',level:0}),
      one:api.name({name:'Épée rare',level:1}),
      two:api.name({name:'Épée rare',level:2}),
      four:api.name({name:'Épée rare',level:4}),
      nine:api.name({name:'Épée rare',level:9}),
      model:api.version
    };
  });
  expect(result).toEqual({
    none:'Épée rare',
    one:'Épée rare | I',
    two:'Épée rare | II',
    four:'Épée rare | IV',
    nine:'Épée rare | IX',
    model:456
  });
});

test('V456 keeps Dust enhancement separate from mastery Roman level', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const item={name:'Casque',level:2,upgradeLevel:7,equipmentLevelModelVersion:456};
    return {
      label:equipmentDisplayName(item),
      roman:equipmentRomanLevel(item.level),
      upgrade:equipmentUpgradeText(item),
      level:item.level,
      upgradeLevel:item.upgradeLevel
    };
  });
  expect(result).toEqual({
    label:'Casque | II',
    roman:'II',
    upgrade:'+7 améliorations',
    level:2,
    upgradeLevel:7
  });
});
