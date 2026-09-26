const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof equipmentMasteryInfo === 'function' &&
    typeof equipmentUpgradeLevel === 'function' &&
    typeof grantLevels === 'function' &&
    typeof makeItem === 'function' &&
    window.__srEquipmentMasterySyncV456 &&
    window.__srForgeLifetimeMasteryV445 &&
    window.__srEquipmentDisplayV450 &&
    window.__srEquipmentDisplayV450.version === 456
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V456 corrects V455 Hero level labels to the current mastery rank without losing Dust upgrades', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.level = 24;
    S.forge.lifetimeCount = 329; // Mastery II
    const item = {
      id:'v455-item',name:'Collier Commun',slot:'collier',rarity:'COMMUN',
      level:24,upgradeLevel:1,equipmentLevelModelVersion:455,
      baseDamage:240,baseHp:0,damage:242.4,hp:0,power:242.4,originalPower:200,
      upgradeBaseLevel:0,statQuality:.4,affixes:[],forgeLifetimeMasteryPct:20,forgeLifetimeMasteryVersion:445
    };
    S.inventory=[item];
    const changed=window.__srEquipmentMasterySyncV456.applyState(S);
    return {
      changed,
      hero:S.level,
      rank:equipmentMasteryInfo(S).rank,
      level:item.level,
      upgradeLevel:item.upgradeLevel,
      model:item.equipmentLevelModelVersion,
      label:equipmentDisplayName(item),
      upgradeText:equipmentUpgradeText(item)
    };
  });
  expect(result).toEqual({
    changed:true,
    hero:24,
    rank:2,
    level:2,
    upgradeLevel:1,
    model:456,
    label:'Collier Commun | II',
    upgradeText:'+1 amélioration'
  });
});

test('V456 Hero level-up never changes equipment mastery rank', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.level=24;
    S.exp=expToNext(24);
    S.forge.lifetimeCount=329;
    const item=makeItem('armure','RARE',S.forge.level);
    S.inventory=[item];
    const before={hero:S.level,rank:item.level,label:equipmentDisplayName(item)};
    grantLevels(S);
    return {
      before,
      after:{hero:S.level,rank:item.level,label:equipmentDisplayName(item)}
    };
  });
  expect(result.before).toEqual({hero:24,rank:2,label:'Armure Rare | II'});
  expect(result.after).toEqual({hero:25,rank:2,label:'Armure Rare | II'});
});

test('V456 every owned and future equipment piece uses mastery II and includes its +20 percent base boost', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const api=window.__srForgeLifetimeMasteryV445;
    S.forge.lifetimeCount=329; // Mastery II, +20%
    S.inventory=[];
    Object.keys(S.equipped).forEach(k=>S.equipped[k]=null);

    const old=makeItem('arme','RARE',S.forge.level);
    const worn=makeItem('armure','RARE',S.forge.level);
    S.inventory=[old];
    S.equipped.armure=worn;
    api.applyState(S);
    const future=makeItem('collier','COMMUN',S.forge.level);

    const expectedOld=api.statsFor(old.slot,old.rarity,old.statQuality,starMul(S,'forge'),20);
    const expectedWorn=api.statsFor(worn.slot,worn.rarity,worn.statQuality,starMul(S,'forge'),20);
    const expectedFuture=api.statsFor(future.slot,future.rarity,future.statQuality,starMul(S,'forge'),20);
    return {
      info:api.info(S),
      old:{level:old.level,pct:old.forgeLifetimeMasteryPct,baseDamage:old.baseDamage,expected:expectedOld.d},
      worn:{level:worn.level,pct:worn.forgeLifetimeMasteryPct,baseHp:worn.baseHp,expected:expectedWorn.h},
      future:{level:future.level,pct:future.forgeLifetimeMasteryPct,baseDamage:future.baseDamage,expected:expectedFuture.d,label:equipmentDisplayName(future)}
    };
  });
  expect(result.info).toMatchObject({rank:2,roman:'II',bonusPct:20});
  expect(result.old).toMatchObject({level:2,pct:20});
  expect(result.old.baseDamage).toBe(result.old.expected);
  expect(result.worn).toMatchObject({level:2,pct:20});
  expect(result.worn.baseHp).toBe(result.worn.expected);
  expect(result.future).toMatchObject({level:2,pct:20,label:'Collier Rouillé | II'});
  expect(result.future.baseDamage).toBe(result.future.expected);
});

test('V456 every mastery tier I through IX maps to the same Roman level and included base boost', async ({ page }) => {
  await openCleanGame(page);
  const rows=await page.evaluate(() => {
    const api=window.__srForgeLifetimeMasteryV445;
    return api.tiers.slice(1).map(t=>{
      S.forge.lifetimeCount=t.need;
      const it=makeItem('arme','COMMUN',S.forge.level);
      const raw=api.rawStats('arme','COMMUN',it.statQuality,starMul(S,'forge'));
      return {
        need:t.need,rank:t.rank,roman:t.roman,bonus:t.bonusPct,
        itemLevel:it.level,label:equipmentDisplayName(it),
        base:it.baseDamage,raw:raw.d,pct:it.forgeLifetimeMasteryPct
      };
    });
  });
  const expected=[
    [1,'I',10],[2,'II',20],[3,'III',30],[4,'IV',40],[5,'V',50],
    [6,'VI',60],[7,'VII',70],[8,'VIII',75],[9,'IX',80]
  ];
  expect(rows.map(r=>[r.rank,r.roman,r.bonus])).toEqual(expected);
  rows.forEach(r=>{
    expect(r.itemLevel).toBe(r.rank);
    expect(r.label).toContain('| '+r.roman);
    expect(r.pct).toBe(r.bonus);
    expect(r.base).toBe(Math.floor(r.raw*(1+r.bonus/100)));
  });
});

test('V456 moving from mastery II to III updates worn, stored and future gear together', async ({ page }) => {
  await openCleanGame(page);
  const out=await page.evaluate(() => {
    const api=window.__srForgeLifetimeMasteryV445;
    S.forge.lifetimeCount=329;
    const stored=makeItem('arme','RARE',S.forge.level);
    const worn=makeItem('armure','RARE',S.forge.level);
    stored.upgradeLevel=4;
    stored.damage=Math.round(stored.baseDamage*1.04*100)/100;
    stored.power=stored.damage;
    S.inventory=[stored];S.equipped.armure=worn;

    S.forge.lifetimeCount=600;
    const applied=api.applyState(S);
    const future=makeItem('casque','RARE',S.forge.level);
    return {
      info:applied.info,
      stored:{level:stored.level,upgrade:stored.upgradeLevel,pct:stored.forgeLifetimeMasteryPct,label:equipmentDisplayName(stored)},
      worn:{level:worn.level,pct:worn.forgeLifetimeMasteryPct,label:equipmentDisplayName(worn)},
      future:{level:future.level,pct:future.forgeLifetimeMasteryPct,label:equipmentDisplayName(future)}
    };
  });
  expect(out.info).toMatchObject({rank:3,roman:'III',bonusPct:30});
  expect(out.stored).toMatchObject({level:3,upgrade:4,pct:30,label:'Arme Rare | III'});
  expect(out.worn).toMatchObject({level:3,pct:30,label:'Armure Rare | III'});
  expect(out.future).toMatchObject({level:3,pct:30,label:'Casque Rare | III'});
});

test('V456 item detail explicitly shows mastery rank and its included boost', async ({ page }) => {
  await openCleanGame(page);
  const id=await page.evaluate(() => {
    S.forge.lifetimeCount=329;
    const it=makeItem('collier','COMMUN',S.forge.level);
    S.inventory=[it];
    showItemDetail(it.id,'collier');
    return it.id;
  });
  await expect(page.locator('body')).toContainText('Collier Rouillé | II');
  await expect(page.locator('body')).toContainText('MAÎTRISE ÉQUIPEMENT II · +20% base');
  expect(await page.evaluate(itemId=>{
    const it=S.inventory.find(x=>x.id===itemId);
    return {level:it.level,pct:it.forgeLifetimeMasteryPct};
  },id)).toEqual({level:2,pct:20});
});
