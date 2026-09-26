const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof syncEquipmentLevels === 'function' &&
    typeof equipmentUpgradeLevel === 'function' &&
    typeof grantLevels === 'function' &&
    typeof makeItem === 'function' &&
    window.__srEquipmentLevelSyncV455 &&
    window.__srEquipmentDisplayV450 &&
    window.__srEquipmentDisplayV450.version === 455
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V455 migrates old item.level into Dust upgradeLevel before Hero sync', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const legacy = {
      id:'legacy-v455',
      name:'Casque Rare',
      slot:'casque',
      rarity:'RARE',
      level:7,
      baseDamage:0,
      baseHp:1000,
      damage:0,
      hp:1070,
      power:1070,
      originalPower:1000,
      upgradeBaseLevel:0,
      affixes:[]
    };
    const before = { hp:legacy.hp, power:legacy.power };
    const changed = syncEquipmentLevelItem(legacy, 24);
    return {
      changed,
      level:legacy.level,
      upgradeLevel:legacy.upgradeLevel,
      model:legacy.equipmentLevelModelVersion,
      hp:legacy.hp,
      power:legacy.power,
      before,
      label:equipmentDisplayName(legacy),
      upgradeText:equipmentUpgradeText(legacy)
    };
  });
  expect(result).toEqual({
    changed:true,
    level:24,
    upgradeLevel:7,
    model:455,
    hp:1070,
    power:1070,
    before:{hp:1070,power:1070},
    label:'Casque Rare | XXIV',
    upgradeText:'+7 améliorations'
  });
});

test('V455 Hero level-up synchronises worn and stored equipment without changing Dust upgrades', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const st = defaultState('QA');
    st.level = 24;
    st.exp = expToNext(24);
    const worn = {
      id:'worn-v455',name:'Casque Rare',slot:'casque',rarity:'RARE',
      level:24,upgradeLevel:8,equipmentLevelModelVersion:455,
      damage:0,hp:1000,baseDamage:0,baseHp:1000,power:1000,originalPower:1000,upgradeBaseLevel:0,affixes:[]
    };
    const stored = {
      id:'stored-v455',name:'Armure Commune',slot:'armure',rarity:'COMMUN',
      level:24,upgradeLevel:0,equipmentLevelModelVersion:455,
      damage:0,hp:500,baseDamage:0,baseHp:500,power:500,originalPower:500,upgradeBaseLevel:0,affixes:[]
    };
    st.equipped.casque = worn;
    st.inventory = [stored];
    grantLevels(st);
    return {
      hero:st.level,
      worn:{level:worn.level,upgradeLevel:worn.upgradeLevel},
      stored:{level:stored.level,upgradeLevel:stored.upgradeLevel},
      syncVersion:st.equipmentLevelSyncVersion
    };
  });
  expect(result).toEqual({
    hero:25,
    worn:{level:25,upgradeLevel:8},
    stored:{level:25,upgradeLevel:0},
    syncVersion:455
  });
});

test('V455 every new Forge drop is born at the current Hero level', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.level = 24;
    const item = makeItem('armure','COMMUN',S.forge.level);
    return {
      level:item.level,
      upgradeLevel:item.upgradeLevel,
      model:item.equipmentLevelModelVersion,
      label:equipmentDisplayName(item),
      upgradeText:equipmentUpgradeText(item)
    };
  });
  expect(result).toEqual({
    level:24,
    upgradeLevel:0,
    model:455,
    label:'Armure Rouillé | XXIV',
    upgradeText:'Non amélioré'
  });
});

test('V455 Dust improvement increments upgradeLevel only, never Hero equipment level', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.level = 24;
    const item = makeItem('casque','RARE',S.forge.level);
    S.inventory = [item];
    S.poussiere = 1000;
    const before = {
      level:item.level,
      upgradeLevel:item.upgradeLevel,
      label:equipmentDisplayName(item),
      cost:itemUpgradeCost(item)
    };
    const oldRandom = Math.random;
    Math.random = () => 0;
    let outcome;
    try { outcome = upgradeItem(item.id); } finally { Math.random = oldRandom; }
    return {
      before,
      outcome:{ok:outcome.ok,success:outcome.success},
      after:{
        level:item.level,
        upgradeLevel:item.upgradeLevel,
        label:equipmentDisplayName(item),
        upgradeText:equipmentUpgradeText(item)
      }
    };
  });
  expect(result.before).toEqual({level:24,upgradeLevel:0,label:'Casque Rare | XXIV',cost:30});
  expect(result.outcome).toEqual({ok:true,success:true});
  expect(result.after).toEqual({
    level:24,
    upgradeLevel:1,
    label:'Casque Rare | XXIV',
    upgradeText:'+1 amélioration'
  });
});

test('V455 Forge result visibly shows the synced Roman level for drop and worn gear', async ({ page }) => {
  await openCleanGame(page);
  const id = await page.evaluate(() => {
    S.level = 24;
    const worn = makeItem('armure','RARE',S.forge.level);
    const item = makeItem('armure','COMMUN',S.forge.level);
    S.equipped.armure = worn;
    S.inventory = [item];
    showForgeResult([{id:item.id,rarity:item.rarity,slot:item.slot,power:item.power,recycled:false}]);
    return item.id;
  });
  const pop = page.locator('#srForgeArenaPreview146');
  await expect(pop).toBeVisible();
  await expect(pop).toContainText('Armure | XXIV');
  await expect(pop).toContainText('Rare | XXIV');
  await expect(pop).toContainText('Non amélioré');
  expect(await page.evaluate((itemId) => {
    const it=S.inventory.find(x=>x.id===itemId);
    const worn=S.equipped.armure;
    return {
      drop:{level:it.level,upgradeLevel:it.upgradeLevel},
      worn:{level:worn.level,upgradeLevel:worn.upgradeLevel}
    };
  }, id)).toEqual({
    drop:{level:24,upgradeLevel:0},
    worn:{level:24,upgradeLevel:0}
  });
});
