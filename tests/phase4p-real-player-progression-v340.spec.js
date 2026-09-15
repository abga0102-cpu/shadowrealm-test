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

test('V340 models player power from actually attainable progression instead of maxed profiles', async ({ page }) => {
  test.setTimeout(120000);
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const H = window.__smoke;
    const originalRandom = Math.random;

    function seeded(seed) {
      let x = seed >>> 0;
      return function () {
        x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
        return x / 4294967296;
      };
    }

    function enemyBudgetForFloor(floor) {
      if (isBoss(floor)) return 1;
      const waves = campaignWaveCount(floor);
      let total = 0;
      for (let step = 1; step <= waves; step += 1) {
        if (isElite(floor) && step === waves) total += 1;
        else total += Math.max(1, Number(enemyCount(floor, step)) || 1);
      }
      return total;
    }

    function campaignBudget(throughFloor) {
      const fresh = defaultState('V340 budget');
      let gold = Number(fresh.gold) || 0;
      let exp = Number(fresh.exp) || 0;
      let level = Math.max(1, Number(fresh.level) || 1);
      let statPoints = Number(fresh.statPoints) || 0;

      for (let floor = 1; floor <= throughFloor; floor += 1) {
        const count = enemyBudgetForFloor(floor);
        gold += goldReward(floor) * count;
        exp += expReward(floor) * count;
        while (level < RULES.MAX_LEVEL && exp >= expToNext(level)) {
          exp -= expToNext(level);
          level += 1;
          statPoints += RULES.STAT_POINTS_PER_LEVEL;
        }
      }
      return { gold, exp, level, statPoints };
    }

    function scheduledClears(floor, per100) {
      return Math.max(0, Math.floor((Math.max(0, floor) * per100) / 100));
    }

    function raidBudget(type, clears) {
      let amount = 0;
      for (let level = 1; level <= clears; level += 1) amount += raidReward(type, level);
      return amount;
    }

    function affordableForgeLevel(gold) {
      let level = 1;
      let spent = 0;
      for (let i = 0; i < FORGE_UPGRADE_GOLD_COSTS.length; i += 1) {
        const cost = Number(FORGE_UPGRADE_GOLD_COSTS[i]) || 0;
        if (spent + cost > gold) break;
        spent += cost;
        level += 1;
      }
      return { level, spent, remaining: Math.max(0, Math.floor(gold - spent)) };
    }

    function advanceMastery(mastery, progress) {
      let level = Math.max(0, Number(mastery) || 0);
      let p = Math.max(0, Number(progress) || 0) + 1;
      while (level < 50) {
        const need = masteryReq(level);
        if (p < need) break;
        p -= need;
        level += 1;
      }
      return { level, progress: p };
    }

    function rollFromRates(system, mastery, rng) {
      const order = system === 'forge' ? EQUIP_RARITY_ORDER : system === 'pet' ? PET_RARITY_ORDER : RARITY_ORDER;
      const rates = getRates(system, mastery, 0, 0);
      const old = Math.random;
      Math.random = rng;
      try { return rollRarity(rates, order); }
      finally { Math.random = old; }
    }

    function equipRealisticCrafts(st, craftCount, seed) {
      const rng = seeded(seed);
      let mastery = 0;
      let progress = 0;
      const best = {};
      H.SLOTS.forEach((slot) => { best[slot] = null; });

      for (let i = 0; i < craftCount; i += 1) {
        const rarity = rollFromRates('forge', mastery, rng);
        const slot = H.SLOTS[Math.floor(rng() * H.SLOTS.length) % H.SLOTS.length];
        const old = Math.random;
        Math.random = rng;
        let item;
        try { item = makeItem(slot, rarity, st.forge.level); }
        finally { Math.random = old; }
        item.affixes = [];
        if (slot === 'arme') item.weaponType = 'epee';
        const score = (Number(item.damage) || 0) + (Number(item.hp) || 0);
        const current = best[slot];
        const currentScore = current ? (Number(current.damage) || 0) + (Number(current.hp) || 0) : -1;
        if (score > currentScore) best[slot] = item;
        const next = advanceMastery(mastery, progress);
        mastery = next.level;
        progress = next.progress;
      }

      H.SLOTS.forEach((slot) => { st.equipped[slot] = best[slot]; });
      st.forge.masteryLevel = mastery;
      st.forge.masteryProgress = progress;
      st.forge.summonCount = craftCount;
      return { mastery, progress };
    }

    function simulatePet(st, summonCount, seed) {
      const rng = seeded(seed);
      let mastery = 0;
      let progress = 0;
      let best = 'COMMUN';
      let bestRank = PET_RARITY_ORDER.indexOf(best);
      for (let i = 0; i < summonCount; i += 1) {
        const rarity = rollFromRates('pet', mastery, rng);
        const rank = PET_RARITY_ORDER.indexOf(rarity);
        if (rank > bestRank) { best = rarity; bestRank = rank; }
        const next = advanceMastery(mastery, progress);
        mastery = next.level;
        progress = next.progress;
      }
      if (summonCount > 0) {
        st.pets = [{ id: 'v340-pet', rarity: best, level: 0, species: 'dragonnet', element: 'normal' }];
        st.activePetId = 'v340-pet';
      }
      st.petMastery = { level: mastery, count: summonCount, progress };
      return { mastery, rarity: summonCount > 0 ? best : null };
    }

    function simulateSkillProgress(summonCount, seed) {
      const rng = seeded(seed);
      let mastery = 0;
      let progress = 0;
      let best = 'COMMUN';
      let bestRank = RARITY_ORDER.indexOf(best);
      for (let i = 0; i < summonCount; i += 1) {
        const rarity = rollFromRates('skill', mastery, rng);
        const rank = RARITY_ORDER.indexOf(rarity);
        if (rank > bestRank) { best = rarity; bestRank = rank; }
        const next = advanceMastery(mastery, progress);
        mastery = next.level;
        progress = next.progress;
      }
      return { mastery, rarity: summonCount > 0 ? best : null };
    }

    const profiles = {
      low: {
        raidOrPer100: 8, raidMineraiPer100: 4, raidPetPer100: 4, raidSkillPer100: 4,
        mineraiSpend: 0.20, petSpend: 0.30, skillSpend: 0.30,
      },
      normal: {
        raidOrPer100: 16, raidMineraiPer100: 8, raidPetPer100: 8, raidSkillPer100: 8,
        mineraiSpend: 0.30, petSpend: 0.50, skillSpend: 0.50,
      },
      optimized: {
        raidOrPer100: 24, raidMineraiPer100: 16, raidPetPer100: 16, raidSkillPer100: 16,
        mineraiSpend: 0.55, petSpend: 0.85, skillSpend: 0.85,
      },
    };

    const milestones = [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800];

    function snapshot(profileName, profile, floor) {
      const fresh = defaultState('V340 ' + profileName);
      const campaign = campaignBudget(floor);
      const orClears = scheduledClears(floor, profile.raidOrPer100);
      const mineraiClears = scheduledClears(floor, profile.raidMineraiPer100);
      const petClears = scheduledClears(floor, profile.raidPetPer100);
      const skillClears = scheduledClears(floor, profile.raidSkillPer100);
      const totalGold = campaign.gold + raidBudget('or', orClears);
      const forge = affordableForgeLevel(totalGold);
      const minerai = (Number(fresh.minerai) || 0) + raidBudget('minerai', mineraiClears);
      const essence = (Number(fresh.essence) || 0) + raidBudget('familier', petClears);
      const eclat = (Number(fresh.eclat) || 0) + raidBudget('competence', skillClears);
      const craftCost = 10;
      const craftCount = Math.floor((minerai * profile.mineraiSpend) / craftCost);
      const petCost = Number(window.__srFamiliarSummonCostV322A) || 50;
      const skillCost = 25;
      const petSummons = Math.floor((essence * profile.petSpend) / petCost);
      const skillSummons = Math.floor((eclat * profile.skillSpend) / skillCost);

      update((st) => {
        Object.keys(st).forEach((key) => { delete st[key]; });
        Object.assign(st, fresh);
        st.floor = floor;
        st.recordFloor = floor;
        st.checkpoint = floor;
        st.level = campaign.level;
        st.exp = campaign.exp;
        st.statPoints = 0;
        const points = campaign.statPoints;
        st.stats.sante = Math.ceil(points / 2);
        st.stats.degats = Math.floor(points / 2);
        st.stats.crit = 0;
        st.stats.critred = 0;
        st.gold = forge.remaining;
        st.forge.level = forge.level;
        st.inventory = [];
        st.equipped = { arme: null, casque: null, armure: null, gants: null, bottes: null, collier: null, anneau: null, ceinture: null };
        st.tree = { levels: {}, active: null, activeLevel: 0, activeEnd: 0 };
        st.stars = { pet: 0, forge: 0, skill: 0 };
        st.pets = [];
        st.activePetId = null;
      });

      const forgeMastery = equipRealisticCrafts(H.S, craftCount, 340000 + floor * 11 + profileName.length * 97);
      const pet = simulatePet(H.S, petSummons, 341000 + floor * 13 + profileName.length * 101);
      const skill = simulateSkillProgress(skillSummons, 342000 + floor * 17 + profileName.length * 103);
      H.D = computeDerived(H.S);

      const referenceDamage = typeof window.__srV325ExpectedPlayerDamage === 'function'
        ? window.__srV325ExpectedPlayerDamage(floor) : null;
      const referenceHP = typeof window.__srV325ExpectedPlayerHP === 'function'
        ? window.__srV325ExpectedPlayerHP(floor) : null;

      return {
        floor,
        level: H.S.level,
        forgeLevel: H.S.forge.level,
        forgeMastery: forgeMastery.mastery,
        crafts: craftCount,
        petSummons,
        petMastery: pet.mastery,
        petRarity: pet.rarity,
        skillSummons,
        skillMastery: skill.mastery,
        bestSkillRarity: skill.rarity,
        damage: H.D.damage,
        hp: H.D.maxHP,
        power: computePower(H.S),
        referenceDamage,
        referenceHP,
        damageVsReference: referenceDamage ? +(H.D.damage / referenceDamage).toFixed(4) : null,
        hpVsReference: referenceHP ? +(H.D.maxHP / referenceHP).toFixed(4) : null,
        raidClears: { or: orClears, minerai: mineraiClears, pet: petClears, skill: skillClears },
      };
    }

    const out = {};
    try {
      for (const [name, profile] of Object.entries(profiles)) {
        out[name] = milestones.map((floor) => snapshot(name, profile, floor));
      }
    } finally {
      Math.random = originalRandom;
      H.combat = null;
    }
    return out;
  });

  console.log('V340 REAL PLAYER POWER SIMULATION:', JSON.stringify(result));

  const normal75 = result.normal.find((row) => row.floor === 75);
  const optimized75 = result.optimized.find((row) => row.floor === 75);
  expect(normal75).toBeTruthy();
  expect(normal75.level).toBeLessThan(20);
  expect(normal75.forgeLevel).toBeGreaterThanOrEqual(10);
  expect(normal75.forgeLevel).toBeLessThan(15);
  expect(optimized75.forgeLevel).toBeLessThan(20);
  expect(normal75.level).not.toBe(100);
  expect(normal75.forgeLevel).toBeLessThan(35);

  for (const profile of Object.values(result)) {
    for (const row of profile) {
      expect(Number.isFinite(row.damage)).toBe(true);
      expect(Number.isFinite(row.hp)).toBe(true);
      expect(Number.isFinite(row.power)).toBe(true);
      expect(row.damage).toBeGreaterThan(0);
      expect(row.hp).toBeGreaterThan(0);
    }
  }
});
