const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srEquipmentUpgradePowerV472 &&
    typeof upgradeItem === 'function' &&
    typeof itemUpgradePreview === 'function' &&
    typeof computePower === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V472 successful equipment upgrade adds 3 percent of reference stat and visible global Power', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const it = {
      id:'v472-test', slot:'arme', rarity:'RARE', weaponType:'epee',
      damage:100000, hp:0, level:0, upgradeLevel:0,
      baseDamage:100000, baseHp:0, upgradeBaseLevel:0,
      originalPower:100000, power:100000, name:'Arme Rare',
      affixes:[], equipmentLevelModelVersion:456
    };
    S.equipped.arme = it;
    S.inventory = [];
    S.poussiere = 1000000;
    S.power = computePower(S);
    D = computeDerived(S);
    const beforePower = S.power;
    const preview = itemUpgradePreview(it);
    const result = upgradeItem(it.id);
    const after = S.equipped.arme;
    return {
      preview,
      result,
      beforePower,
      afterPower:S.power,
      damage:after.damage,
      level:after.upgradeLevel,
      cost0:window.__srV283DustCost(0),
      chance0:itemUpgradeChance({upgradeLevel:0,equipmentLevelModelVersion:456})
    };
  });
  expect(out.preview.current).toBe(100000);
  expect(out.preview.next).toBe(103000);
  expect(out.preview.gain).toBe(3000);
  expect(out.result).toMatchObject({ok:true,success:true,statLabel:'ATQ',statGain:3000});
  expect(out.result.globalPowerGain).toBeGreaterThan(0);
  expect(out.afterPower).toBeGreaterThan(out.beforePower);
  expect(out.damage).toBe(103000);
  expect(out.level).toBe(1);
  expect(out.cost0).toBe(15);
  expect(out.chance0).toBe(100);
});

test('V472 upgrades existing enhanced equipment upward without downgrading stronger legacy stats', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const api = window.__srEquipmentUpgradePowerV472;
    const oldCurve = {
      id:'old', slot:'arme', rarity:'RARE', damage:110000, hp:0,
      baseDamage:100000, baseHp:0, upgradeLevel:10, power:110000
    };
    const stronger = {
      id:'strong', slot:'arme', rarity:'RARE', damage:140000, hp:0,
      baseDamage:100000, baseHp:0, upgradeLevel:10, power:140000
    };
    api.applyGrowth(oldCurve);
    api.applyGrowth(stronger);
    return {oldCurve,stronger,config:{version:api.version,perLevelPct:api.perLevelPct,retroactiveUpwardOnly:api.retroactiveUpwardOnly}};
  });
  expect(out.oldCurve.damage).toBe(130000);
  expect(out.oldCurve.power).toBe(130000);
  expect(out.stronger.damage).toBe(140000);
  expect(out.stronger.power).toBe(140000);
  expect(out.config).toEqual({version:472,perLevelPct:3,retroactiveUpwardOnly:true});
});

test('V472 leaves Dust cost and success chance economy unchanged and publishes Power feedback', async () => {
  const progression = fs.readFileSync('progression-overhaul-v283.js','utf8');
  const chance = fs.readFileSync('dust-chance-floor-v301.js','utf8');
  const ui = fs.readFileSync('game-5.js','utf8');
  const index = fs.readFileSync('index.html','utf8');
  expect(progression).toContain('15+9*Math.max');
  expect(chance).toContain('if(level<25)return 100');
  expect(chance).toContain('Math.max(5,95-5*Math.floor((level-25)/2))');
  expect(ui).toContain('" · Puissance +" + fmt(r.globalPowerGain)');
  expect(index).toContain('shadowreach-build" content="2026.09.29.473"');
  expect(index).toContain('progression-qa-authority-v287.js?v=2026.09.29.472c');
});
