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

async function boot(page, equipV410 = false) {
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1' + (equipV410 ? '&equipV410=1' : ''));
  await page.waitForFunction(() => window.__smoke && typeof drawArena === 'function' && typeof spawnCampaign === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V410 opt-in uses explicit atlas anchors and articulated boot halves', async ({ page }) => {
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
    nav('accueil'); render();
    H.combat = spawnCampaign(H.S);
    drawArena();

    const hero = document.querySelector('#aLayer > .unit');
    const sprite = hero && hero.querySelector(':scope > img');
    const back = hero && hero.querySelector(':scope > .srEquipBackWrap');
    const front = hero && hero.querySelector(':scope > .srEquipFrontWrap');
    const legs = hero && hero.querySelector(':scope > .srEquipLegWrap');
    const torso = hero && hero.querySelector('[data-equip-part="armure_torse_avant"]');
    const boots = hero && hero.querySelector('.srEquipLegIdle [data-equip-part="bottes"]');
    const ring = hero && hero.querySelector('[data-equip-part="anneau"]');
    const halves = hero ? hero.querySelectorAll('.srEquipLegHalf') : [];

    /* drawArena may already have advanced the locomotion class before the
       assertion, depending on engine/rAF timing. Normalize to a known idle
       class state before checking the idle/walk CSS swap. */
    if (hero) hero.classList.remove('srWalkPseudo169');
    const beforeWalk = halves.length ? getComputedStyle(halves[0]).display : '';
    if (hero) {
      hero.classList.add('srWalkPseudo169');
      hero.style.setProperty('--sr-split-top','58%');
      hero.style.setProperty('--sr-left-end','53%');
      hero.style.setProperty('--sr-right-start','47%');
      hero.style.setProperty('--sr-lx','1px'); hero.style.setProperty('--sr-ly','0px'); hero.style.setProperty('--sr-lr','1deg');
      hero.style.setProperty('--sr-rx','-1px'); hero.style.setProperty('--sr-ry','-1px'); hero.style.setProperty('--sr-rr','-1deg');
      hero.style.setProperty('--sr-flip','scaleX(1)');
    }
    const idle = hero && hero.querySelector('.srEquipLegIdle');
    return {
      flag: window.__srEquipV410Enabled,
      spriteZ: sprite && getComputedStyle(sprite).zIndex,
      backZ: back && getComputedStyle(back).zIndex,
      frontZ: front && getComputedStyle(front).zIndex,
      legZ: legs && getComputedStyle(legs).zIndex,
      torsoTop: torso && torso.style.top,
      torsoHeight: torso && torso.style.height,
      torsoFit: torso && torso.style.objectFit,
      bootTop: boots && boots.style.top,
      bootHeight: boots && boots.style.height,
      ringLeft: ring && ring.style.left,
      ringTop: ring && ring.style.top,
      ringTransform: ring && ring.style.transform,
      frontAfterLegs: !!(front && legs && (legs.compareDocumentPosition(front) & Node.DOCUMENT_POSITION_FOLLOWING)),
      halfCount: halves.length,
      beforeWalk,
      afterWalk: halves.length ? getComputedStyle(halves[0]).display : '',
      idleDuringWalk: idle ? getComputedStyle(idle).display : '',
      hiddenBootRule: !![...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch (_) { return []; } })
        .some(r => String(r.cssText || '').includes("src*='bottes'") && String(r.cssText || '').includes('display: none'))
    };
  }, {
    arme: item('w','arme','RARE'),
    casque: item('h','casque','RARE'),
    armure: item('a','armure','RARE'),
    gants: item('g','gants','RARE'),
    bottes: item('b','bottes','RARE'),
    collier: item('c','collier','RARE'),
    anneau: item('r','anneau','RARE'),
    ceinture: item('ce','ceinture','RARE')
  });

  expect(result.flag).toBe(true);
  expect(result.spriteZ).toBe('4');
  expect(result.backZ).toBe('1');
  expect(result.frontZ).toBe('5');
  expect(result.legZ).toBe('5');
  expect(result.torsoTop).toBe('28.125%');
  expect(result.torsoHeight).toBe('41.6667%');
  expect(result.torsoFit).not.toBe('contain');
  expect(result.bootTop).toBe('72.9167%');
  expect(result.bootHeight).toBe('33.3333%');
  expect(result.ringLeft).toBe('17.7083%');
  expect(result.ringTop).toBe('40.6250%');
  expect(result.ringTransform).toBe('scale(0.5)');
  expect(result.frontAfterLegs).toBe(true);
  expect(result.halfCount).toBe(4);
  expect(result.beforeWalk).toBe('none');
  expect(result.afterWalk).toBe('block');
  expect(result.idleDuringWalk).toBe('none');
  expect(result.hiddenBootRule).toBe(false);
});


test('V410 stays dormant on the normal production URL', async ({ page }) => {
  await boot(page, false);
  const result = await page.evaluate((gear) => {
    const H = window.__smoke;
    update((st) => {
      st.level = 40; st.floor = 20; st.step = 1;
      st.stats = { sante:100, degats:100, crit:0, critred:0 };
      st.equipped = gear; st.skills = {}; st.skillSlots = [null,null,null,null,null];
      st.autoSkills = false; st.pets = []; st.activePetId = null;
    });
    H.D = computeDerived(H.S);
    nav('accueil'); render();
    H.combat = spawnCampaign(H.S);
    drawArena();

    const hero = document.querySelector('#aLayer > .unit');
    const sprite = hero && hero.querySelector(':scope > img');
    return {
      flag: window.__srEquipV410Enabled,
      equipmentWraps: hero ? hero.querySelectorAll(':scope > .srEquipBackWrap,:scope > .srEquipFrontWrap,:scope > .srEquipLegWrap').length : -1,
      canaryClass: !!(hero && hero.classList.contains('srEquipV410Enabled')),
      inlinePosition: sprite ? sprite.style.position : '',
      inlineZ: sprite ? sprite.style.zIndex : '',
      src: sprite ? sprite.getAttribute('src') : ''
    };
  }, {
    arme: item('w','arme','RARE'),
    casque: item('h','casque','RARE'),
    armure: item('a','armure','RARE'),
    gants: item('g','gants','RARE'),
    bottes: item('b','bottes','RARE'),
    collier: item('c','collier','RARE'),
    anneau: item('r','anneau','RARE'),
    ceinture: item('ce','ceinture','RARE')
  });

  expect(result.flag).toBe(false);
  expect(result.equipmentWraps).toBe(0);
  expect(result.canaryClass).toBe(false);
  expect(['', 'relative']).toContain(result.inlinePosition);
  expect(result.inlineZ).toBe('');
  expect(result.src).toContain('art/hero.png');
});


test('V411 uses a true bare hero base when no equipment is worn', async ({ page }) => {
  await boot(page, true);
  const result = await page.evaluate(() => {
    const H = window.__smoke;
    update((st) => {
      st.level = 40; st.floor = 20; st.step = 1;
      st.stats = { sante:100, degats:100, crit:0, critred:0 };
      st.equipped = { arme:null, casque:null, armure:null, gants:null, bottes:null, collier:null, anneau:null, ceinture:null };
      st.skills = {}; st.skillSlots = [null,null,null,null,null]; st.autoSkills = false; st.pets = []; st.activePetId = null;
    });
    H.D = computeDerived(H.S);
    nav('accueil'); render(); H.combat = spawnCampaign(H.S); drawArena();
    const hero = document.querySelector('#aLayer > .unit');
    const sprite = hero && hero.querySelector(':scope > img');
    return {
      src: sprite && sprite.getAttribute('src'),
      wraps: hero ? hero.querySelectorAll(':scope > .srEquipBackWrap,:scope > .srEquipFrontWrap,:scope > .srEquipLegWrap').length : -1
    };
  });
  expect(result.src).toContain('art/hero-bare-v411.png');
  expect(result.src).not.toContain('hero_attack');
  expect(result.wraps).toBe(0);
});

test('V411 melee attack keeps every equipment plane locked to the hero transform', async ({ page }) => {
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
    const sprite = hero && hero.querySelector(':scope > img');
    const back = hero && hero.querySelector(':scope > .srEquipBackWrap');
    const front = hero && hero.querySelector(':scope > .srEquipFrontWrap');
    const legs = hero && hero.querySelector(':scope > .srEquipLegWrap');
    return {
      src: sprite && sprite.getAttribute('src'),
      spriteTransform: sprite && sprite.style.transform,
      backTransform: back && back.style.transform,
      frontTransform: front && front.style.transform,
      legTransform: legs && legs.style.transform,
      spriteOrigin: sprite && getComputedStyle(sprite).transformOrigin,
      backOrigin: back && getComputedStyle(back).transformOrigin,
      frontOrigin: front && getComputedStyle(front).transformOrigin,
      legOrigin: legs && getComputedStyle(legs).transformOrigin
    };
  }, {
    arme: item('w','arme','RARE'), casque: item('h','casque','RARE'), armure: item('a','armure','RARE'),
    gants: item('g','gants','RARE'), bottes: item('b','bottes','RARE'), collier: item('c','collier','RARE'),
    anneau: item('r','anneau','RARE'), ceinture: item('ce','ceinture','RARE')
  });
  expect(result.src).toContain('art/hero-bare-v411.png');
  expect(result.src).not.toContain('hero_attack');
  expect(result.spriteTransform).toBeTruthy();
  expect(result.backTransform).toBe(result.spriteTransform);
  expect(result.frontTransform).toBe(result.spriteTransform);
  expect(result.legTransform).toBe(result.spriteTransform);
  expect(result.backOrigin).toBe(result.spriteOrigin);
  expect(result.frontOrigin).toBe(result.spriteOrigin);
  expect(result.legOrigin).toBe(result.spriteOrigin);
});
