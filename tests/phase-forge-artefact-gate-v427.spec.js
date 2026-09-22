const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V427 Artefact is impossible below Forge 40 in both rate and gate authorities', async ({ page }) => {
  await openCleanGame(page);
  const r = await page.evaluate(() => ({
    rate39: Number(getRates('forge', 39, 0, 0).ARTEFACT) || 0,
    rate40: Number(getRates('forge', 40, 0, 0).ARTEFACT) || 0,
    allowed39: rarityAllowed('ARTEFACT', 39, defaultState('QA')),
    allowed40: rarityAllowed('ARTEFACT', 40, defaultState('QA')),
    min: RARITY_MIN_FORGE.ARTEFACT,
    cfg: window.__srEquipmentBalanceV224 && window.__srEquipmentBalanceV224.forgeRarityV323
  }));

  expect(r.rate39).toBe(0);
  expect(r.rate40).toBeCloseTo(0.25, 8);
  expect(r.allowed39).toBe(false);
  expect(r.allowed40).toBe(true);
  expect(r.min).toBe(40);
  expect(r.cfg.artefactUnlockLevel).toBe(40);
});

test('V427 repairs impossible owned Artefacts below Forge 40 without changing item power', async ({ page }) => {
  await openCleanGame(page);
  const r = await page.evaluate(() => {
    const H = window.__smoke;
    H.S.forge.level = 35;
    const bag = {
      id:'bag-a', slot:'arme', rarity:'ARTEFACT', name:'Arme Artefact',
      damage:123456, hp:0, baseDamage:120000, baseHp:0, originalPower:120000,
      power:123456, level:7, affixes:[{key:'crit',value:4.5}], powerCurveVersion:372
    };
    const worn = {
      id:'worn-a', slot:'casque', rarity:'ARTEFACT', name:'Casque Artefact',
      damage:0, hp:654321, baseDamage:0, baseHp:640000, originalPower:640000,
      power:654321, level:5, affixes:[{key:'hp',value:9}], powerCurveVersion:372
    };
    H.S.inventory = [bag];
    H.S.equipped.casque = worn;

    const before = JSON.parse(JSON.stringify({bag,worn}));
    const changed = window.__srEquipmentBalanceV224.repairPrematureArtefactsV427();
    const afterBag = H.S.inventory[0];
    const afterWorn = H.S.equipped.casque;

    H.S.forge.level = 40;
    const valid = {
      id:'valid-a', slot:'gants', rarity:'ARTEFACT', name:'Gants Artefact',
      damage:222, hp:0, baseDamage:222, baseHp:0, originalPower:222,
      power:222, level:0, affixes:[], powerCurveVersion:372
    };
    H.S.inventory.push(valid);
    const changedAt40 = window.__srEquipmentBalanceV224.repairPrematureArtefactsV427();

    return {
      changed, changedAt40,
      bag:{rarity:afterBag.rarity,name:afterBag.name,damage:afterBag.damage,hp:afterBag.hp,baseDamage:afterBag.baseDamage,originalPower:afterBag.originalPower,level:afterBag.level,affixes:afterBag.affixes},
      worn:{rarity:afterWorn.rarity,name:afterWorn.name,damage:afterWorn.damage,hp:afterWorn.hp,baseHp:afterWorn.baseHp,originalPower:afterWorn.originalPower,level:afterWorn.level,affixes:afterWorn.affixes},
      validRarity:H.S.inventory[1].rarity,
      before
    };
  });

  expect(r.changed).toBe(2);
  expect(r.bag.rarity).toBe('HEROIQUE');
  expect(r.worn.rarity).toBe('HEROIQUE');
  expect(r.bag.name).toContain('Héroïque');
  expect(r.worn.name).toContain('Héroïque');

  expect(r.bag.damage).toBe(r.before.bag.damage);
  expect(r.bag.baseDamage).toBe(r.before.bag.baseDamage);
  expect(r.bag.originalPower).toBe(r.before.bag.originalPower);
  expect(r.bag.level).toBe(r.before.bag.level);
  expect(r.bag.affixes).toEqual(r.before.bag.affixes);

  expect(r.worn.hp).toBe(r.before.worn.hp);
  expect(r.worn.baseHp).toBe(r.before.worn.baseHp);
  expect(r.worn.originalPower).toBe(r.before.worn.originalPower);
  expect(r.worn.level).toBe(r.before.worn.level);
  expect(r.worn.affixes).toEqual(r.before.worn.affixes);

  expect(r.changedAt40).toBe(0);
  expect(r.validRarity).toBe('ARTEFACT');
});
