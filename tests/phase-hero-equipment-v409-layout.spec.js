const { test, expect } = require('@playwright/test');

function item(id, slot, rarity) {
  const damageSlot = ['arme','gants','collier','anneau'].includes(slot);
  return {
    id, slot, rarity, level:0, affixes:[],
    damage: damageSlot ? 20 : 0, baseDamage: damageSlot ? 20 : 0,
    hp: damageSlot ? 0 : 60, baseHp: damageSlot ? 0 : 60,
    originalPower: damageSlot ? 20 : 60, power: damageSlot ? 20 : 60
  };
}

async function boot(page, enabled = false) {
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1' + (enabled ? '&equipV410=1' : ''));
  await page.waitForFunction(() => window.__smoke && typeof drawArena === 'function' && typeof spawnCampaign === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

function fullGear() {
  return {
    arme: item('w','arme','RARE'),
    casque: item('h','casque','RARE'),
    armure: item('a','armure','RARE'),
    gants: item('g','gants','RARE'),
    bottes: item('b','bottes','RARE'),
    collier: item('c','collier','RARE'),
    anneau: item('r','anneau','RARE'),
    ceinture: item('ce','ceinture','RARE')
  };
}

test('V412 remains private on the normal production URL', async ({ page }) => {
  await boot(page, false);
  const result = await page.evaluate(() => ({
    flag: window.__srEquipV410Enabled,
    src: document.querySelector('#aLayer > .unit > img')?.getAttribute('src') || ''
  }));
  expect(result.flag).toBe(false);
  expect(result.src).toContain('art/hero.png');
});

test('V412 unequipped hero uses one bare base and renders no ghost weapon', async ({ page }) => {
  await boot(page, true);
  const result = await page.evaluate(() => {
    const H = window.__smoke;
    update((st) => {
      st.level = 40; st.floor = 20; st.step = 1;
      st.stats = { sante:100, degats:100, crit:0, critred:0 };
      st.equipped = { arme:null, casque:null, armure:null, gants:null, bottes:null, collier:null, anneau:null, ceinture:null };
      st.skills = {}; st.skillSlots = [null,null,null,null,null];
      st.autoSkills = false; st.pets = []; st.activePetId = null;
    });
    H.D = computeDerived(H.S);
    nav('accueil'); render(); H.combat = spawnCampaign(H.S); drawArena();
    const hero = document.querySelector('#aLayer > .unit');
    const sprite = hero?.querySelector(':scope > img');
    return {
      src: sprite?.getAttribute('src') || '',
      equipmentWraps: hero?.querySelectorAll(':scope > .srEquipBackWrap,:scope > .srEquipFrontWrap,:scope > .srEquipLegWrap').length ?? -1,
      weapons: hero?.querySelectorAll(':scope > .srWeapon').length ?? -1,
      pseudoClass: !!hero?.classList.contains('srWalkPseudo169')
    };
  });
  expect(result.src).toContain('art/hero-bare-v412.png');
  expect(result.src).not.toContain('hero_attack');
  expect(result.equipmentWraps).toBe(0);
  expect(result.weapons).toBe(0);
  expect(result.pseudoClass).toBe(false);
});

test('V415 equipment uses calibrated live-hero anchors', async ({ page }) => {
  await boot(page, true);
  const result = await page.evaluate((gear) => {
    const H = window.__smoke;
    update((st) => {
      st.level = 40; st.floor = 20; st.step = 1;
      st.stats = { sante:100, degats:100, crit:0, critred:0 };
      st.equipped = gear; st.skills = {}; st.skillSlots = [null,null,null,null,null];
      st.autoSkills = false; st.pets = []; st.activePetId = null;
    });
    H.D = computeDerived(H.S);
    nav('accueil'); render(); H.combat = spawnCampaign(H.S); drawArena();
    const hero = document.querySelector('#aLayer > .unit');
    const torso = hero?.querySelector('[data-equip-part="armure_torse_avant"]');
    const helmet = hero?.querySelector('[data-equip-part="casque"]');
    const boots = hero?.querySelector('.srEquipLegIdle [data-equip-part="bottes"]');
    const ring = hero?.querySelector('[data-equip-part="anneau"]');
    return {
      torsoTop: torso?.style.top,
      torsoTransform: torso?.style.transform,
      helmetTop: helmet?.style.top,
      helmetTransform: helmet?.style.transform,
      bootTop: boots?.style.top,
      bootTransform: boots?.style.transform,
      ringLeft: ring?.style.left,
      ringTop: ring?.style.top,
      ringTransform: ring?.style.transform
    };
  }, fullGear());
  expect(result.torsoTop).toBe('28.6458%');
  expect(result.torsoTransform).toBe('scale(1)');
  expect(result.helmetTop).toBe('7.8125%');
  expect(result.helmetTransform).toBe('scale(1)');
  expect(result.bootTop).toBe('71.3542%');
  expect(result.bootTransform).toBe('scale(1)');
  expect(result.ringLeft).toBe('65.6250%');
  expect(result.ringTop).toBe('42.7083%');
  expect(result.ringTransform).toBe('scale(1)');
});

test('V412 WebKit-safe walk never clones a second hero face', async ({ page }) => {
  await boot(page, true);
  const result = await page.evaluate((gear) => {
    const H = window.__smoke;
    update((st) => {
      st.level = 40; st.floor = 20; st.step = 1;
      st.stats = { sante:100, degats:100, crit:0, critred:0 };
      st.equipped = gear; st.skills = {}; st.skillSlots = [null,null,null,null,null];
      st.autoSkills = false; st.pets = []; st.activePetId = null;
    });
    H.D = computeDerived(H.S);
    nav('accueil'); render(); H.combat = spawnCampaign(H.S); drawArena();
    H.combat.heroX = Number(H.combat.heroX || 0) + 16;
    drawArena();
    const hero = document.querySelector('#aLayer > .unit');
    const sprite = hero?.querySelector(':scope > img');
    const back = hero?.querySelector(':scope > .srEquipBackWrap');
    const front = hero?.querySelector(':scope > .srEquipFrontWrap');
    const legs = hero?.querySelector(':scope > .srEquipLegWrap');
    return {
      pseudoClass: !!hero?.classList.contains('srWalkPseudo169'),
      clipPath: sprite?.style.clipPath || '',
      spriteTransform: sprite?.style.transform || '',
      backTransform: back?.style.transform || '',
      frontTransform: front?.style.transform || '',
      legTransform: legs?.style.transform || ''
    };
  }, fullGear());
  expect(result.pseudoClass).toBe(false);
  expect(result.clipPath).toBe('');
  expect(result.spriteTransform).toBeTruthy();
  expect(result.backTransform).toBe(result.spriteTransform);
  expect(result.frontTransform).toBe(result.spriteTransform);
  expect(result.legTransform).toBe(result.spriteTransform);
});

test('V412 melee attack locks body, equipment and equipped weapon together', async ({ page }) => {
  await boot(page, true);
  const result = await page.evaluate((gear) => {
    const H = window.__smoke;
    update((st) => {
      st.level = 40; st.floor = 20; st.step = 1;
      st.stats = { sante:100, degats:100, crit:0, critred:0 };
      st.equipped = gear; st.skills = {}; st.skillSlots = [null,null,null,null,null];
      st.autoSkills = false; st.pets = []; st.activePetId = null;
    });
    H.D = computeDerived(H.S);
    H.D.weapon = 'epee';
    nav('accueil'); render(); H.combat = spawnCampaign(H.S);
    H.combat.heroAttacking = ATTACK_WINDOW * 0.46;
    drawArena();
    const hero = document.querySelector('#aLayer > .unit');
    const sprite = hero?.querySelector(':scope > img');
    const back = hero?.querySelector(':scope > .srEquipBackWrap');
    const front = hero?.querySelector(':scope > .srEquipFrontWrap');
    const legs = hero?.querySelector(':scope > .srEquipLegWrap');
    return {
      src: sprite?.getAttribute('src') || '',
      spriteTransform: sprite?.style.transform || '',
      backTransform: back?.style.transform || '',
      frontTransform: front?.style.transform || '',
      legTransform: legs?.style.transform || '',
      weaponCount: hero?.querySelectorAll(':scope > .srWeapon').length ?? -1,
      pseudoClass: !!hero?.classList.contains('srWalkPseudo169')
    };
  }, fullGear());
  expect(result.src).toContain('art/hero-bare-v412.png');
  expect(result.spriteTransform).toBeTruthy();
  expect(result.backTransform).toBe(result.spriteTransform);
  expect(result.frontTransform).toBe(result.spriteTransform);
  expect(result.legTransform).toBe(result.spriteTransform);
  expect(result.weaponCount).toBe(1);
  expect(result.pseudoClass).toBe(false);
});
