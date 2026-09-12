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

test('V311 fresh save has a usable progression runway without retired systems', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const fresh = defaultState('QA');
    return {
      level: fresh.level,
      minerai: fresh.minerai,
      forgeCraftCost: forgeCost(fresh.forge.level),
      starterForgeCrafts: Math.floor(fresh.minerai / forgeCost(fresh.forge.level)),
      skillSlots: RULES.SKILL_SLOTS_BASE,
      eggSlots: fresh.eggSlots,
      raidUnlockLevel: RULES.RAID_UNLOCK_LEVEL,
      raidKeys: RAID_IDS.map((id) => fresh.raids[id].keys),
      applesVisibleAsResource: !!(RESOURCE_INFO && RESOURCE_INFO.apples),
      canRebirth: canRebirth(fresh),
      rebirthUpgradeCount: REBIRTH_UPGRADES.length,
      rebirthTutorialPresent: typeof TUTORIAL_FLOWS !== 'undefined' && !!TUTORIAL_FLOWS.rebirth,
    };
  });

  expect(result.level).toBe(1);
  expect(result.minerai).toBe(400);
  expect(result.forgeCraftCost).toBe(10);
  expect(result.starterForgeCrafts).toBe(40);
  expect(result.skillSlots).toBe(3);
  expect(result.eggSlots).toBe(2);
  expect(result.raidUnlockLevel).toBe(5);
  expect(result.raidKeys).toEqual([2, 2, 2, 2, 2]);
  expect(result.applesVisibleAsResource).toBe(false);
  expect(result.canRebirth).toBe(false);
  expect(result.rebirthUpgradeCount).toBe(0);
  expect(result.rebirthTutorialPresent).toBe(false);
});

test('V311 dedicated Raid economy funds the approved PE and summon loops at progression milestones', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const state = defaultState('QA');
    state.tree = state.tree || {};
    state.tree.levels = {};
    const skillCost = skillSummonCost(state);
    const petCost = PET_SUMMON_COST;
    const keys = RULES.RAID_FREE_KEYS;
    const levels = [1, 10, 25, 50];

    return {
      skillCost,
      petCost,
      keys,
      rows: levels.map((level) => {
        const pe = raidReward('evolution', level);
        const skill = raidReward('competence', level);
        const pet = raidReward('familier', level);
        return {
          level,
          pe,
          skill,
          pet,
          dailyPe: pe * keys,
          dailySkillSummons: Math.floor((skill * keys) / skillCost),
          dailyPetSummons: Math.floor((pet * keys) / petCost),
        };
      }),
    };
  });

  expect(result.skillCost).toBe(25);
  expect(result.petCost).toBe(25);
  expect(result.keys).toBe(2);
  expect(result.rows).toEqual([
    { level: 1, pe: 100, skill: 250, pet: 250, dailyPe: 200, dailySkillSummons: 20, dailyPetSummons: 20 },
    { level: 10, pe: 127, skill: 340, pet: 340, dailyPe: 254, dailySkillSummons: 27, dailyPetSummons: 27 },
    { level: 25, pe: 172, skill: 490, pet: 490, dailyPe: 344, dailySkillSummons: 39, dailyPetSummons: 39 },
    { level: 50, pe: 247, skill: 740, pet: 740, dailyPe: 494, dailySkillSummons: 59, dailyPetSummons: 59 },
  ]);
});

test('V311 daily Raid refill restores progression attempts without reducing stored keys', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const empty = defaultState('QA');
    const capped = defaultState('QA');
    empty.lastKeyReset = '1970-01-01';
    capped.lastKeyReset = '1970-01-01';
    RAID_IDS.forEach((id) => {
      empty.raids[id].keys = 0;
      capped.raids[id].keys = RULES.RAID_KEY_CAP;
    });
    applyDailyReset(empty);
    applyDailyReset(capped);
    return {
      refill: RAID_IDS.map((id) => empty.raids[id].keys),
      capped: RAID_IDS.map((id) => capped.raids[id].keys),
      cap: RULES.RAID_KEY_CAP,
    };
  });

  expect(result.refill).toEqual([2, 2, 2, 2, 2]);
  expect(result.capped).toEqual([result.cap, result.cap, result.cap, result.cap, result.cap]);
});

test('V311 personal Tree remains fully reachable with hybrid paths and finite PE costs', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const state = defaultState('QA');
    state.tree = { levels: {}, active: null, activeLevel: 0, activeEnd: 0 };
    state.pe = Number.MAX_SAFE_INTEGER;
    const nodes = TREE_NODES.filter((node) => !node.deprecatedKey);
    let passes = 0;
    let progressed = true;

    while (progressed && passes < nodes.length + 5) {
      progressed = false;
      passes += 1;
      for (const node of nodes) {
        if ((state.tree.levels[node.id] || 0) >= node.max) continue;
        if (!treeReqOk(state, node)) continue;
        state.tree.levels[node.id] = node.max;
        progressed = true;
      }
    }

    const remaining = nodes
      .filter((node) => (state.tree.levels[node.id] || 0) < node.max)
      .map((node) => node.id);
    const initial = defaultState('QA');
    const initiallyReachable = nodes.filter((node) => treeReqOk(initial, node));
    const initialOpeningCosts = initiallyReachable.map((node) => treeNextCost(initial, node).amount);
    const totalPe = treeTotalPE();

    return {
      nodeCount: nodes.length,
      remaining,
      passes,
      initiallyReachable: initiallyReachable.length,
      maxInitialOpeningCost: initialOpeningCosts.length ? Math.max(...initialOpeningCosts) : null,
      totalPe,
      raid1Reward: raidReward('evolution', 1),
    };
  });

  expect(result.nodeCount).toBeGreaterThan(0);
  expect(result.remaining).toEqual([]);
  expect(result.passes).toBeLessThanOrEqual(result.nodeCount + 5);
  expect(result.initiallyReachable).toBeGreaterThan(0);
  expect(result.maxInitialOpeningCost).not.toBeNull();
  expect(result.maxInitialOpeningCost).toBeLessThanOrEqual(result.raid1Reward);
  expect(Number.isFinite(result.totalPe)).toBe(true);
  expect(result.totalPe).toBeGreaterThan(0);
});

test('V311 Mega Boss unlock is exactly Boss 50 and combat power is x10 on both axes', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const before = defaultState('QA');
    before.recordFloor = 50;
    before.floor = 50;
    before.bossClears = { '10': true, '20': true, '30': true, '40': true };
    const after = structuredClone(before);
    after.bossClears['50'] = true;

    const floor = 50;
    const def = bossFor(floor);
    const type = Object.assign({}, ENEMY_TYPES[1], {
      id: 'mega_' + def.id,
      name: 'Méga-' + def.name,
      img: def.img,
      ranged: !!def.ranged,
      proj: def.proj || 'magic',
    });
    const normalReference = makeEnemy('campaign', {
      type,
      name: type.name,
      tier: def.tier,
      floor,
      boss: true,
      abils: def.abils,
      noFastback: true,
      x: AW - 60,
    });
    const mega = makeMegaBossEnemy(floor);

    return {
      beforeClear50: megaRaidUnlocked(before),
      afterClear50: megaRaidUnlocked(after),
      hpReference: normalReference.maxHP,
      hpMega: mega.maxHP,
      dmgReference: normalReference.dmg,
      dmgMega: mega.dmg,
      megaFlag: mega.mega,
    };
  });

  expect(result.beforeClear50).toBe(false);
  expect(result.afterClear50).toBe(true);
  expect(result.megaFlag).toBe(true);
  expect(result.hpMega).toBe(result.hpReference * 10);
  expect(result.dmgMega).toBe(result.dmgReference * 10);
});

test('V311 Familiar progression uses rarity/fusion/Ascension without Apple levels', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => ({
    ancestralBeforeMax: Number(getRates('pet', 49, 0, 0).ANCESTRAL) || 0,
    ancestralAtMax: Number(getRates('pet', 50, 0, 0).ANCESTRAL) || 0,
    ancestralHatchSeconds: Number(EGG_TIMERS.ANCESTRAL) || 0,
    commonFusionNeed: Number(PET_FUSE_NEED.COMMUN) || 0,
    rareFusionNeed: Number(PET_FUSE_NEED.RARE) || 0,
    ancestralFusionNeed: Number(PET_FUSE_NEED.ANCESTRAL) || 0,
    appleUpgradeResult: upgradePet('non-existent'),
    petStars: [ascendPowerMul(1, 'pet'), ascendPowerMul(2, 'pet'), ascendPowerMul(3, 'pet')],
  }));

  expect(result.ancestralBeforeMax).toBe(0);
  expect(result.ancestralAtMax).toBeCloseTo(5, 8);
  expect(result.ancestralHatchSeconds).toBe(16 * 3600);
  expect(result.commonFusionNeed).toBe(4);
  expect(result.rareFusionNeed).toBe(5);
  expect(result.ancestralFusionNeed).toBe(6);
  expect(result.appleUpgradeResult).toBe(false);
  expect(result.petStars).toEqual([1.5, 2.1, 3]);
});

test('V311 Forge long-run economy preserves the approved 1→50 gold ladder and dust safety floor', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => ({
    upgradeCount: FORGE_UPGRADE_GOLD_COSTS.length,
    totalGold: FORGE_UPGRADE_GOLD_COSTS.reduce((sum, cost) => sum + cost, 0),
    firstGold: FORGE_UPGRADE_GOLD_COSTS[0],
    lastGold: FORGE_UPGRADE_GOLD_COSTS[FORGE_UPGRADE_GOLD_COSTS.length - 1],
    dustCost0: itemUpgradeCost({ level: 0 }),
    dustChance70: itemUpgradeChance({ level: 70 }),
    dustChance999: itemUpgradeChance({ level: 999 }),
    forgeStar1: ascendPowerMul(1, 'forge'),
  }));

  expect(result.upgradeCount).toBe(49);
  expect(result.totalGold).toBe(15000000);
  expect(result.firstGold).toBe(3350);
  expect(result.lastGold).toBe(1852100);
  expect(result.dustCost0).toBe(60);
  expect(result.dustChance70).toBe(95);
  expect(result.dustChance999).toBe(5);
  expect(result.forgeStar1).toBe(2);
});
