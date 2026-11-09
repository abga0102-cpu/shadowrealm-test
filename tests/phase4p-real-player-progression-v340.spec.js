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

    function simulateFamiliars(st, paidSummons, seed) {
      const rng = seeded(seed);
      const old = Math.random;
      let summoned = [];
      Math.random = rng;
      try {
        summoned = paidSummons > 0 ? summonEgg(paidSummons) : [];
      } finally {
        Math.random = old;
      }

      // At a milestone, eggs the player could already have funded are treated as
      // hatched. Hatch-time pacing is a separate axis; rarity/species/element,
      // fusion costs and final Familiar stats remain the live game authorities.
      st.pets = (st.eggs || []).map((egg, index) => ({
        id: `v340-pet-${index}`,
        rarity: egg.rarity,
        level: 0,
        applesInvested: 0,
        species: egg.species,
        element: egg.element,
        name: `V340 ${index + 1}`,
      }));
      st.eggs = [];
      st.activePetId = null;

      let fusions = 0;
      for (let i = 0; i < PET_RARITY_ORDER.length - 1; i += 1) {
        const rarity = PET_RARITY_ORDER[i];
        const need = petFuseNeed(rarity);
        if (!need) continue;
        while (st.pets.filter((pet) => pet.rarity === rarity).length >= need) {
          const fused = fusePets(rarity);
          if (!fused || !fused.ok) break;
          fusions += 1;
        }
      }

      let bestPet = null;
      let bestStats = { damage: 0, hp: 0 };
      let bestScore = -1;
      for (const pet of st.pets) {
        const stats = typeof window.__srV286PetStats === 'function'
          ? window.__srV286PetStats(pet, st)
          : { damage: 0, hp: 0 };
        const score = Math.sqrt(Math.max(1, Number(stats.damage) || 0) * Math.max(1, Number(stats.hp) || 0));
        if (score > bestScore) {
          bestScore = score;
          bestPet = pet;
          bestStats = stats;
        }
      }
      st.activePetId = bestPet ? bestPet.id : null;

      return {
        mastery: Number(st.petMastery && st.petMastery.level) || 0,
        paidSummons: Number(st.petMastery && st.petMastery.count) || 0,
        results: summoned.length,
        fusions,
        rarity: bestPet ? bestPet.rarity : null,
        damage: Number(bestStats.damage) || 0,
        hp: Number(bestStats.hp) || 0,
      };
    }

    function simulateSkills(st, paidSummons, seed) {
      const rng = seeded(seed);
      const old = Math.random;
      Math.random = rng;
      try {
        if (paidSummons > 0) summonSkill(paidSummons);
      } finally {
        Math.random = old;
      }

      const loadout = (st.skillSlots || []).filter(Boolean).map((id) => {
        const def = SKILL_BY_ID[id];
        const owned = st.skills && st.skills[id];
        if (!def || !owned) return null;
        const level = Math.max(1, Number(owned.level) || 1);
        const offensive = def.cat === 'ATTAQUE' || def.cat === 'ULTIME';
        const damage = offensive && typeof window.__srV284SkillDamage === 'function'
          ? window.__srV284SkillDamage(def, level)
          : 0;
        const cooldown = Math.max(0.1, Number(def.cd) || 1);
        return {
          id,
          category: def.cat,
          rarity: def.rarity,
          level,
          damage,
          dps: damage / cooldown,
        };
      }).filter(Boolean);

      let bestRarity = null;
      let bestRank = -1;
      Object.keys(st.skills || {}).forEach((id) => {
        const def = SKILL_BY_ID[id];
        const rank = def ? RARITY_ORDER.indexOf(def.rarity) : -1;
        if (rank > bestRank) {
          bestRank = rank;
          bestRarity = def.rarity;
        }
      });

      return {
        mastery: Number(st.skillMastery && st.skillMastery.level) || 0,
        paidSummons: Number(st.skillMastery && st.skillMastery.count) || 0,
        rarity: bestRarity,
        equipped: loadout.length,
        loadout,
        directDps: loadout.reduce((sum, skill) => sum + skill.dps, 0),
      };
    }

    function nominalBasicDps(derived) {
      const weapon = (typeof WEAPON_TYPES !== 'undefined' && (WEAPON_TYPES[derived.weapon] || WEAPON_TYPES.epee))
        || { speed: 1, hit: 1 };
      const critFactor = 1 + (Math.max(0, Number(derived.critChance) || 0) / 100)
        * Math.max(0, (Number(derived.critMult) || 1) - 1);
      const doubleFactor = 1 + Math.min(100, Math.max(0, Number(derived.doubleAtk) || 0)) / 100;
      return (Number(derived.damage) || 0)
        * (Number(derived.attackSpeed) || 0)
        * (Number(weapon.speed) || 1)
        * (Number(weapon.hit) || 1)
        * critFactor
        * doubleFactor;
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
      const skillCost = typeof skillSummonCost === 'function' ? skillSummonCost(fresh) : 25;
      const petSpend = Math.floor(essence * profile.petSpend);
      const skillSpend = Math.floor(eclat * profile.skillSpend);
      const petSummons = Math.floor(petSpend / petCost);
      const skillSummons = Math.floor(skillSpend / skillCost);

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
        st.eggs = [];
        st.activePetId = null;
        st.petMastery = { level: 0, count: 0, progress: 0 };
        st.skills = {};
        st.skillSlots = [null, null, null, null, null];
        st.skillMastery = { level: 0, count: 0, progress: 0 };
        st.essence = petSummons * petCost;
        st.eclat = skillSummons * skillCost;
      });

      const forgeMastery = equipRealisticCrafts(H.S, craftCount, 340000 + floor * 11 + profileName.length * 97);
      const pet = simulateFamiliars(H.S, petSummons, 341000 + floor * 13 + profileName.length * 101);
      const skill = simulateSkills(H.S, skillSummons, 342000 + floor * 17 + profileName.length * 103);
      H.D = computeDerived(H.S);

      const basicDps = nominalBasicDps(H.D);
      const directSkillDps = skill.directDps;
      const directCombatDps = basicDps + directSkillDps;
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
        petSummons: pet.paidSummons,
        petResults: pet.results,
        petFusions: pet.fusions,
        petMastery: pet.mastery,
        petRarity: pet.rarity,
        petDamage: pet.damage,
        petHP: pet.hp,
        skillSummons: skill.paidSummons,
        skillMastery: skill.mastery,
        bestSkillRarity: skill.rarity,
        equippedSkills: skill.equipped,
        skillLoadout: skill.loadout,
        directSkillDps: +directSkillDps.toFixed(2),
        basicDps: +basicDps.toFixed(2),
        directCombatDps: +directCombatDps.toFixed(2),
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
  expect(normal75).toBeTruthy();
  expect(normal75.level).toBeLessThan(20);
  expect(normal75.forgeLevel).toBeGreaterThanOrEqual(8);
  expect(normal75.forgeLevel).toBeLessThanOrEqual(12);

  // Facile 4-15 must include the two other large progression systems. A test
  // that silently drops Familiars or equipped Skills is not a valid balance reference.
  expect(normal75.petSummons).toBeGreaterThan(0);
  expect(normal75.petRarity).not.toBeNull();
  expect(normal75.petDamage + normal75.petHP).toBeGreaterThan(0);
  expect(normal75.skillSummons).toBeGreaterThan(0);
  expect(normal75.equippedSkills).toBeGreaterThan(0);

  expect(normal75.level).not.toBe(100);
  expect(normal75.forgeLevel).toBeLessThan(35);

  for (const profile of Object.values(result)) {
    for (const row of profile) {
      expect(Number.isFinite(row.damage)).toBe(true);
      expect(Number.isFinite(row.hp)).toBe(true);
      expect(Number.isFinite(row.power)).toBe(true);
      expect(Number.isFinite(row.directCombatDps)).toBe(true);
      expect(row.damage).toBeGreaterThan(0);
      expect(row.hp).toBeGreaterThan(0);
      expect(row.directCombatDps).toBeGreaterThan(0);
    }
  }
});
