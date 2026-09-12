const { test, expect } = require('@playwright/test');

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
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
}

test('V313 real combat keeps the approved weak / normal / max 0★ / Ascension runway', async ({ page }) => {
  test.setTimeout(120000);
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const H = window.__smoke;
    const originalRandom = Math.random;
    const originalNow = Date.now;

    function seeded(seed) {
      let x = seed >>> 0;
      return function () {
        x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
        return x / 4294967296;
      };
    }

    function resetState() {
      const fresh = defaultState('QA V313');
      update((st) => {
        Object.keys(st).forEach((key) => { delete st[key]; });
        Object.assign(st, fresh);
      });
    }

    function equipDeterministic(rarity, forgeLevel, stars) {
      const rng = seeded(31300 + rarity.length * 97 + stars * 997);
      Math.random = rng;
      H.SLOTS.forEach((slot) => {
        const item = makeItem(slot, rarity, forgeLevel);
        // V313 measures the progression axes themselves. Random affixes are a
        // bonus layer, so strip them to keep the profile stable across engines.
        item.affixes = [];
        if (slot === 'arme') item.weaponType = 'epee';
        H.S.equipped[slot] = item;
      });
      Math.random = originalRandom;
    }

    const profiles = {
      weak: {
        gear: 'ARTEFACT', pet: 'RARE', stars: 0, skillLevel: 10,
        skills: ['taillade', 'chaine', 'soin'], maxBoss: 60,
      },
      normal: {
        gear: 'LEGENDAIRE', pet: 'EPIQUE', stars: 0, skillLevel: 25,
        skills: ['frappe', 'force', 'benediction'], maxBoss: 80,
      },
      max0: {
        gear: 'IMMORTEL', pet: 'LEGENDAIRE', stars: 0, skillLevel: 50,
        skills: ['execution', 'meteore', 'regeneration'], maxBoss: 100,
      },
      ascension: {
        gear: 'DIVIN', pet: 'DIVIN', stars: 1, skillLevel: 50,
        skills: ['cataclysme', 'force', 'rempart'], maxBoss: 150,
      },
    };

    function loadProfile(name, profile) {
      resetState();
      update((st) => {
        st.level = 100;
        st.forge.level = 50;
        st.stats = { sante: 50, degats: 50, crit: 0, critred: 0 };
        st.stars = { pet: profile.stars, forge: profile.stars, skill: profile.stars };
        st.skills = {};
        profile.skills.forEach((id) => {
          st.skills[id] = { level: profile.skillLevel, count: 0 };
        });
        st.skillSlots = [...profile.skills, null, null];
        st.autoSkills = true;
        st.pets = [{
          id: 'v313-' + name,
          rarity: profile.pet,
          level: 0,
          species: 'dragonnet',
          element: 'normal',
        }];
        st.activePetId = 'v313-' + name;
        st.tree = { levels: {}, active: null, activeLevel: 0, activeEnd: 0 };
        st.inventory = [];
      });
      equipDeterministic(profile.gear, 50, profile.stars);
      H.D = computeDerived(H.S);
      return {
        damage: H.D.damage,
        hp: H.D.maxHP,
        attackSpeed: H.D.attackSpeed,
        power: computePower(H.S),
        gear: profile.gear,
        pet: profile.pet,
        stars: profile.stars,
        skills: profile.skills.slice(),
      };
    }

    function fightBoss(floor, seed) {
      let now = 1700000000000 + floor * 1000;
      Date.now = () => now;
      Math.random = seeded(seed);
      H.S.floor = floor;
      H.S.step = 1;
      H.D = computeDerived(H.S);
      H.combat = spawnCampaign(H.S);
      H.lastTick = now;

      let status = 'timeout';
      let frames = 0;
      // 120 seconds simulated at 50 ms. tick() itself caps dt at 100 ms, so
      // combat cadence, movement and delayed hit events all use the live path.
      for (let i = 0; i < 2400; i += 1) {
        now += 50;
        frames = i + 1;
        tick();
        if (!H.combat) {
          status = 'ended';
          break;
        }
        if (H.combat.status !== 'fight') {
          status = H.combat.status;
          break;
        }
      }
      const snapshot = H.combat ? {
        heroHP: Math.max(0, Math.round(H.combat.heroHP || 0)),
        enemyHP: Math.round((H.combat.enemies || []).filter((e) => e.alive)
          .reduce((sum, e) => sum + Math.max(0, e.hp || 0), 0)),
      } : { heroHP: 0, enemyHP: 0 };
      H.combat = null;
      return { floor, status, secs: +(frames * 0.05).toFixed(1), ...snapshot };
    }

    function scan(name, profile) {
      const derived = loadProfile(name, profile);
      const fights = [];
      let firstFail = null;
      for (let floor = 10; floor <= profile.maxBoss; floor += 10) {
        const one = fightBoss(floor, 313000 + name.length * 1000 + floor);
        fights.push(one);
        if (one.status !== 'won') {
          firstFail = floor;
          break;
        }
      }
      return { derived, firstFail, fights };
    }

    let out;
    try {
      out = Object.fromEntries(Object.entries(profiles).map(([name, profile]) => [name, scan(name, profile)]));
    } finally {
      Math.random = originalRandom;
      Date.now = originalNow;
      H.combat = null;
      H.D = computeDerived(H.S);
    }
    return out;
  });

  console.log('V313 combat profile results:', JSON.stringify(result));

  // The ranges are deliberately coarse design bands, not exact-floor tuning.
  // Boss checkpoints are every 10 floors, so a weak profile should first stop
  // around 40, normal around 50–60, and a max pre-Ascension build around 70–80.
  expect(result.weak.firstFail).toBe(40);
  expect([50, 60]).toContain(result.normal.firstFail);
  expect([70, 80]).toContain(result.max0.firstFail);
  expect(result.ascension.firstFail).toBeNull();
  expect(result.ascension.fights.at(-1).floor).toBe(150);
  expect(result.ascension.fights.at(-1).status).toBe('won');

  // Progression systems must produce a strictly stronger real combat profile.
  expect(result.normal.derived.damage).toBeGreaterThan(result.weak.derived.damage);
  expect(result.normal.derived.hp).toBeGreaterThan(result.weak.derived.hp);
  expect(result.max0.derived.damage).toBeGreaterThan(result.normal.derived.damage);
  expect(result.max0.derived.hp).toBeGreaterThan(result.normal.derived.hp);
  expect(result.ascension.derived.damage).toBeGreaterThan(result.max0.derived.damage);
  expect(result.ascension.derived.hp).toBeGreaterThan(result.max0.derived.hp);
});
