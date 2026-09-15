const { test, expect } = require('@playwright/test');

function item(id, slot, rarity, extra = {}) {
  const damageSlot = ['arme', 'gants', 'collier', 'anneau'].includes(slot);
  return Object.assign({
    id,
    slot,
    rarity,
    level: 0,
    affixes: [],
    damage: damageSlot ? 20 : 0,
    baseDamage: damageSlot ? 20 : 0,
    hp: damageSlot ? 0 : 60,
    baseHp: damageSlot ? 0 : 60,
    originalPower: damageSlot ? 20 : 60,
    power: damageSlot ? 20 : 60,
  }, extra);
}

async function bootCombat(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__smoke && typeof spawnCampaign === 'function' && typeof drawArena === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('equipped hero renders every canonical slot with rarity-driven visuals and real weapon art', async ({ page }) => {
  await bootCombat(page);

  const result = await page.evaluate((gear) => {
    const H = window.__smoke;
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
    H.D = computeDerived(H.S);
    nav('accueil');
    render();
    H.combat = spawnCampaign(H.S);
    drawArena();

    const hero = document.querySelector('#aLayer > .unit');
    const sprite = hero && hero.querySelector(':scope > img');
    const bodySlots = hero ? [...new Set([...hero.querySelectorAll('.srHeroGear338 [data-slot]')].map((n) => n.dataset.slot))].sort() : [];
    const weapon = hero && hero.querySelector(':scope > .srGearWeapon338');
    const commonHelmet = hero && hero.querySelector('.srHeroGear338 [data-slot="casque"]');
    const infernalArmor = hero && hero.querySelector('.srHeroGear338 [data-slot="armure"]');
    const immortalBoots = hero && hero.querySelector('.srHeroGear338 [data-slot="bottes"]');
    return {
      bodySlots,
      equipped: hero ? hero.getAttribute('data-equipped-slots') : '',
      weaponType: weapon ? weapon.dataset.weapon : '',
      weaponRarity: weapon ? weapon.dataset.rarity : '',
      weaponTier: weapon ? Number(weapon.dataset.tier) : -1,
      weaponSrc: weapon && weapon.querySelector('img') ? weapon.querySelector('img').getAttribute('src') : '',
      commonHelmetTier: commonHelmet ? Number(commonHelmet.dataset.tier) : -1,
      infernalArmorTier: infernalArmor ? Number(infernalArmor.dataset.tier) : -1,
      immortalBootsTier: immortalBoots ? Number(immortalBoots.dataset.tier) : -1,
      spriteVisible: !!(sprite && getComputedStyle(sprite).display !== 'none'),
      retiredVisuals: hero ? hero.querySelectorAll('.heroEqVisual,.hevBody,.heroOriginalSprite').length : -1,
      animationError: window.__srWalkV169Error || '',
    };
  }, {
    arme: item('w', 'arme', 'DIVIN', { weaponType: 'hache' }),
    casque: item('h', 'casque', 'COMMUN'),
    armure: item('a', 'armure', 'INFERNAL'),
    gants: item('g', 'gants', 'RARE'),
    bottes: item('b', 'bottes', 'IMMORTEL'),
    collier: item('c', 'collier', 'EPIQUE'),
    anneau: item('r', 'anneau', 'LEGENDAIRE'),
    ceinture: item('ce', 'ceinture', 'ARTEFACT'),
  });

  expect(result.bodySlots).toEqual(['anneau', 'armure', 'bottes', 'casque', 'ceinture', 'collier', 'gants']);
  expect(result.equipped.split(',').sort()).toEqual(['anneau', 'arme', 'armure', 'bottes', 'casque', 'ceinture', 'collier', 'gants']);
  expect(result.weaponType).toBe('hache');
  expect(result.weaponRarity).toBe('DIVIN');
  expect(result.weaponTier).toBe(10);
  expect(result.weaponSrc).toContain('art/weapons/hache.png');
  expect(result.commonHelmetTier).toBe(0);
  expect(result.infernalArmorTier).toBe(8);
  expect(result.immortalBootsTier).toBe(9);
  expect(result.spriteVisible).toBe(true);
  expect(result.retiredVisuals).toBe(0);
  expect(result.animationError).toBe('');
});

test('visual renderer supports Peu commun and Héroïque art tiers without changing Forge rarity ownership', async ({ page }) => {
  await bootCombat(page);

  const result = await page.evaluate(() => {
    const H = window.__smoke;
    nav('accueil');
    render();
    H.combat = spawnCampaign(H.S);
    H.S.equipped.casque = { id:'pc', slot:'casque', rarity:'PEU_COMMUN', hp:10, baseHp:10, damage:0, baseDamage:0, level:0, affixes:[] };
    H.S.equipped.armure = { id:'hero', slot:'armure', rarity:'HEROIQUE', hp:10, baseHp:10, damage:0, baseDamage:0, level:0, affixes:[] };
    drawArena();
    const hero = document.querySelector('#aLayer > .unit');
    const helmet = hero && hero.querySelector('.srHeroGear338 [data-slot="casque"]');
    const armor = hero && hero.querySelector('.srHeroGearFront338 [data-slot="armure"]');
    return {
      helmetTier: helmet ? Number(helmet.dataset.tier) : -1,
      helmetRarity: helmet ? helmet.dataset.rarity : '',
      armorTier: armor ? Number(armor.dataset.tier) : -1,
      armorRarity: armor ? armor.dataset.rarity : '',
      animationError: window.__srWalkV169Error || '',
    };
  });

  expect(result.helmetRarity).toBe('PEU_COMMUN');
  expect(result.helmetTier).toBe(1);
  expect(result.armorRarity).toBe('HEROIQUE');
  expect(result.armorTier).toBe(5);
  expect(result.animationError).toBe('');
});
