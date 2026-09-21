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

async function boot(page, equipV410 = null) {
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  const flag = equipV410 === null ? '' : '&equipV410=' + (equipV410 ? '1' : '0');
  await page.goto('/index.html?smoke=1' + flag);
  await page.waitForFunction(() => window.__smoke && typeof drawArena === 'function' && typeof spawnCampaign === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V410 is enabled by default and uses explicit atlas anchors and articulated boot halves', async ({ page }) => {
  await boot(page);
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
  expect(result.torsoTop).toBe('27.0833%');
  expect(result.torsoHeight).toBe('41.6667%');
  expect(result.torsoFit).not.toBe('contain');
  expect(result.bootTop).toBe('72.3958%');
  expect(result.bootHeight).toBe('33.3333%');
  expect(result.ringLeft).toBe('16.6667%');
  expect(result.ringTop).toBe('39.5833%');
  expect(result.ringTransform).toBe('scale(0.55)');
  expect(result.frontAfterLegs).toBe(true);
  expect(result.halfCount).toBe(4);
  expect(result.beforeWalk).toBe('none');
  expect(result.afterWalk).toBe('block');
  expect(result.idleDuringWalk).toBe('none');
  expect(result.hiddenBootRule).toBe(false);
});


test('V410 emergency fallback disables equipment only with explicit equipV410=0', async ({ page }) => {
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
  expect(result.inlinePosition).toBe('');
  expect(result.inlineZ).toBe('');
  expect(result.src).toContain('art/hero.png');
});
