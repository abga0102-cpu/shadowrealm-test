const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('shadowreach.save.local');
      localStorage.removeItem('shadowreach.social.v1.messages');
    } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__srDefenseSystemV435 && typeof window.__srDamageHeroV435 === 'function');
}

test('V435 owns permanent Defense without adding a save field or a parallel runtime module', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source contract is engine-independent.');
  const g1 = fs.readFileSync(path.join(root, 'game-1.js'), 'utf8');
  const g2 = fs.readFileSync(path.join(root, 'game-2.js'), 'utf8');

  expect(g1).toContain('const DEFENSE_RATING_K = 100;');
  expect(g1).toContain('const DEFENSE_REDUCTION_CAP = 70;');
  expect(g1).toContain('function equipmentDefenseRating(it)');
  expect(g1).toContain('function defenseReductionPct(rating)');
  expect(g1).toContain('maxHP, damage, defense, defenseReduction');
  expect(g2).toContain('function damageHero(c, amount, opts)');
  expect((g2.match(/c\.heroHP\s*-=|c\.heroHP-=/g) || []).length).toBe(1);

  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  expect(index).toContain('shadowreach-build" content="2026.09.24.435"');
  expect(index).toContain('game-1.js?v=2026.09.24.435a');
  expect(index).toContain('game-2.js?v=2026.09.24.435b');
  expect(index).toContain('game-4.js?v=2026.09.24.435c');
  expect(index).toContain('game-5.js?v=2026.09.24.435d');
  expect(index).toContain('forge-comparison-authority-v146.js?v=2026.09.24.435e');
});

test('V435 derives Defense from legacy-compatible HP gear and caps permanent reduction at 70%', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const fresh = defaultState('Defense QA');
    const defensive = ['casque', 'armure', 'bottes', 'ceinture'];
    defensive.forEach((slot, i) => {
      fresh.equipped[slot] = {
        id: 'legacy-' + i,
        slot,
        rarity: 'EPIQUE',
        hp: 16000,
        baseHp: 16000,
        damage: 0,
        baseDamage: 0,
        level: 0,
        power: 16000,
        affixes: [],
      };
    });
    const epic = computeDerived(fresh);

    defensive.forEach((slot, i) => {
      fresh.equipped[slot] = {
        id: 'end-' + i,
        slot,
        rarity: 'DIVIN',
        hp: 1e15,
        baseHp: 1e15,
        damage: 0,
        baseDamage: 0,
        level: 0,
        power: 1e15,
        affixes: [],
      };
    });
    const end = computeDerived(fresh);
    return {
      epicDefense: epic.defense,
      epicReduction: epic.defenseReduction,
      capReduction: end.defenseReduction,
      config: {
        ratingK: window.__srDefenseSystemV435.ratingK,
        capPct: window.__srDefenseSystemV435.capPct,
        hpScale: window.__srDefenseSystemV435.hpScale,
      },
      persistedDefenseField: Object.prototype.hasOwnProperty.call(fresh.equipped.casque, 'defense'),
    };
  });

  expect(result.epicDefense).toBeGreaterThan(0);
  expect(result.epicReduction).toBeGreaterThan(10);
  expect(result.epicReduction).toBeLessThan(25);
  expect(result.capReduction).toBe(70);
  expect(result.config.ratingK).toBe(100);
  expect(result.persistedDefenseField).toBe(false);
});

test('V435 Defense is multiplicative after existing temporary reduction and displayed in Equipment UI', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const originalD = D;
    D = Object.assign({}, D, { defense: 100, defenseReduction: 50 });
    const c = { heroHP: 1000 };
    const afterExistingRempart = 200 * 0.70;
    const dealt = damageHero(c, afterExistingRempart);

    const fresh = defaultState('Defense UI');
    fresh.equipped.armure = {
      id: 'ui-armure',
      slot: 'armure',
      rarity: 'MYTHIQUE',
      hp: 71680,
      baseHp: 71680,
      damage: 0,
      baseDamage: 0,
      level: 0,
      power: 71680,
      affixes: [],
      name: 'Armure QA',
    };
    Object.keys(S).forEach((key) => { delete S[key]; });
    Object.assign(S, fresh);
    D = computeDerived(S);
    S.power = computePower(S);
    const html = scrEquipement();
    D = originalD;
    return { dealt, hp: c.heroHP, html };
  });

  expect(result.dealt).toBe(70);
  expect(result.hp).toBe(930);
  expect(result.html).toContain('Défense');
  expect(result.html).toContain('Réduc. Défense');
});
