const { test, expect } = require('@playwright/test');

function item(id, slot, rarity, extra = {}) {
  const damageSlot = ['arme', 'gants', 'collier', 'anneau'].includes(slot);
  return Object.assign({
    id,
    slot,
    rarity,
    level: 0,
    affixes: [],
    damage: damageSlot ? 10 : 0,
    baseDamage: damageSlot ? 10 : 0,
    hp: damageSlot ? 0 : 30,
    baseHp: damageSlot ? 0 : 30,
    power: damageSlot ? 10 : 30,
  }, extra);
}

test('all eight equipped slots are represented on the live hero without replacing the painted sprite', async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__smoke && typeof spawnCampaign === 'function' && typeof drawArena === 'function');

  const result = await page.evaluate((gear) => {
    update((st) => {
      st.level = 40;
      st.floor = 20;
      st.step = 1;
      st.stats = { sante: 100, degats: 100, crit: 0, critred: 0 };
      st.equipped = gear;
      st.skills = {};
      st.skillSlots = [null, null, null, null, null];
      st.autoSkills = false;
      st.pets = [];
      st.activePetId = null;
    });
    refreshDerived();
    nav('accueil');
    render();
    window.__smoke.combat = spawnCampaign(window.__smoke.S);
    drawArena();

    const hero = document.querySelector('#aLayer > .unit');
    const sprite = hero && hero.querySelector(':scope > img');
    const gearLayer = hero && hero.querySelector(':scope > .srHeroGear169');
    const slots = gearLayer ? [...gearLayer.querySelectorAll('[data-slot]')].map((n) => n.getAttribute('data-slot')).sort() : [];
    const weapon = hero && hero.querySelector(':scope > .srWeapon');
    return {
      slots,
      equipped: hero ? hero.getAttribute('data-equipped-slots') : '',
      weapon: weapon ? weapon.getAttribute('data-weapon') : '',
      weaponSrc: weapon && weapon.querySelector('img') ? weapon.querySelector('img').getAttribute('src') : '',
      spriteVisible: sprite ? getComputedStyle(sprite).display !== 'none' : false,
      retiredBody: hero ? hero.querySelectorAll('.heroEqVisual,.hevBody,.heroOriginalSprite').length : -1,
      error: window.__srWalkV169Error || '',
    };
  }, {
    arme: item('w', 'arme', 'RARE', { weaponType: 'hache' }),
    casque: item('h', 'casque', 'EPIQUE'),
    armure: item('a', 'armure', 'MYTHIQUE'),
    gants: item('g', 'gants', 'RARE'),
    bottes: item('b', 'bottes', 'LEGENDAIRE'),
    collier: item('c', 'collier', 'ARTEFACT'),
    anneau: item('r', 'anneau', 'INFERNAL'),
    ceinture: item('ce', 'ceinture', 'IMMORTEL'),
  });

  expect(result.slots).toEqual(['anneau', 'armure', 'bottes', 'casque', 'ceinture', 'collier', 'gants']);
  expect(result.equipped.split(',').sort()).toEqual(['anneau', 'arme', 'armure', 'bottes', 'casque', 'ceinture', 'collier', 'gants']);
  expect(result.weapon).toBe('hache');
  expect(result.weaponSrc).toContain('art/weapons/hache.png');
  expect(result.spriteVisible).toBe(true);
  expect(result.retiredBody).toBe(0);
  expect(result.error).toBe('');
});

test('hero presentation exposes hit and defeat states without changing combat ownership', async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__smoke && typeof spawnCampaign === 'function' && typeof drawArena === 'function');

  const state = await page.evaluate(() => {
    nav('accueil');
    render();
    window.__smoke.combat = spawnCampaign(window.__smoke.S);
    window.__smoke.combat.heroHit = 0.15;
    drawArena();
    const first = document.querySelector('#aLayer > .unit');
    const hit = !!(first && first.classList.contains('srHeroHit169'));

    window.__smoke.combat.heroHP = 0;
    window.__smoke.combat.status = 'lost';
    drawArena();
    const second = document.querySelector('#aLayer > .unit');
    return {
      hit,
      lost: !!(second && second.classList.contains('srHeroLost169')),
      spriteVisible: !!(second && second.querySelector(':scope > img') && getComputedStyle(second.querySelector(':scope > img')).display !== 'none'),
      error: window.__srWalkV169Error || '',
    };
  });

  expect(state.hit).toBe(true);
  expect(state.lost).toBe(true);
  expect(state.spriteVisible).toBe(true);
  expect(state.error).toBe('');
});
