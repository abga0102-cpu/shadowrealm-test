const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srGlobalEquipmentUpgradeV455 &&
    window.__srGlobalEquipmentUpgradeV455.version === 455 &&
    typeof makeItem === 'function' &&
    typeof upgradeItem === 'function' &&
    typeof equipmentDisplayName === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V455 one Dust upgrade raises worn, stored and future equipment together', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    S.inventory = [];
    Object.keys(S.equipped).forEach(k => { S.equipped[k] = null; });
    S.equipmentUpgradeLevel = 2;

    const worn = makeItem('armure', 'RARE', S.forge.level);
    const stored = makeItem('arme', 'RARE', S.forge.level);
    S.equipped.armure = worn;
    S.inventory = [stored];
    S.poussiere = 1000;
    S.power = computePower(S);
    D = computeDerived(S);

    const costBefore = itemUpgradeCost(worn);
    const oldRandom = Math.random;
    Math.random = () => 0;
    let outcome;
    try {
      outcome = upgradeItem(worn.id);
    } finally {
      Math.random = oldRandom;
    }

    const future = makeItem('casque', 'COMMUN', S.forge.level);
    const expectedWorn = Math.round(worn.baseHp * 1.03 * 100) / 100;
    const expectedStored = Math.round(stored.baseDamage * 1.03 * 100) / 100;
    const expectedFuture = Math.round(future.baseHp * 1.03 * 100) / 100;

    return {
      outcome,
      globalLevel: S.equipmentUpgradeLevel,
      costBefore,
      dustAfter: S.poussiere,
      levels: [worn.level, stored.level, future.level],
      stats: [worn.hp, stored.damage, future.hp],
      expected: [expectedWorn, expectedStored, expectedFuture],
      futureName: equipmentDisplayName(future),
      chance: itemUpgradeChance(future),
      nextCost: itemUpgradeCost(future)
    };
  });

  expect(result.outcome.ok).toBe(true);
  expect(result.outcome.success).toBe(true);
  expect(result.outcome.globalLevel).toBe(3);
  expect(result.globalLevel).toBe(3);
  expect(result.costBefore).toBe(66);
  expect(result.dustAfter).toBe(934);
  expect(result.levels).toEqual([3, 3, 3]);
  expect(result.stats).toEqual(result.expected);
  expect(result.futureName).toContain('| III');
  expect(result.chance).toBe(100);
  expect(result.nextCost).toBe(84);
});

test('V455 migration keeps the highest old equipment level and never downgrades owned stats', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    S.inventory = [];
    Object.keys(S.equipped).forEach(k => { S.equipped[k] = null; });
    S.equipmentUpgradeLevel = 0;

    const high = makeItem('casque', 'RARE', S.forge.level);
    const legacyStrong = makeItem('arme', 'RARE', S.forge.level);
    high.level = 7;
    high.hp = Math.round(high.baseHp * 1.07 * 100) / 100;
    high.power = high.hp;
    legacyStrong.level = 2;
    legacyStrong.damage = Math.round(legacyStrong.baseDamage * 1.50 * 100) / 100;
    legacyStrong.power = legacyStrong.damage;
    const strongBefore = legacyStrong.damage;

    S.equipped.casque = high;
    S.inventory = [legacyStrong];
    const sync = window.__srGlobalEquipmentUpgradeV455.syncState(S);

    return {
      sync,
      globalLevel: S.equipmentUpgradeLevel,
      equippedLevel: high.level,
      storedLevel: legacyStrong.level,
      strongBefore,
      strongAfter: legacyStrong.damage
    };
  });

  expect(result.globalLevel).toBe(7);
  expect(result.equippedLevel).toBe(7);
  expect(result.storedLevel).toBe(7);
  expect(result.strongAfter).toBeGreaterThanOrEqual(result.strongBefore);
  expect(result.sync.count).toBe(2);
});

test('V455 imported equipment is synchronized by the import authority', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const imported = JSON.parse(JSON.stringify(S));
    imported.inventory = [makeItem('arme', 'RARE', imported.forge.level), makeItem('armure', 'RARE', imported.forge.level)];
    Object.keys(imported.equipped).forEach(k => { imported.equipped[k] = null; });
    imported.equipmentUpgradeLevel = 0;
    imported.inventory[0].level = 5;
    imported.inventory[1].level = 1;

    const normalized = window.__srNormalizeImportedProgressionV299(imported);
    return {
      globalLevel: normalized.equipmentUpgradeLevel,
      levels: normalized.inventory.map(it => it.level)
    };
  });

  expect(result.globalLevel).toBe(5);
  expect(result.levels).toEqual([5, 5]);
});

test('V455 Forge comparison and item detail explain the inherited shared level', async () => {
  const forge = fs.readFileSync('forge-comparison-authority-v146.js', 'utf8');
  const detail = fs.readFileSync('game-5.js', 'utf8');
  const index = fs.readFileSync('index.html', 'utf8');

  expect(forge).toContain("return 'Niveau '+(roman||lv)");
  expect(forge).toContain("equipmentRomanLevel(lv)");
  expect(forge).toContain("it.damage!=null?it.damage");
  expect(forge).toContain("it.hp!=null?it.hp");
  expect(forge).toContain("esc2(upgradeText(it))");
  expect(detail).toContain('NIVEAU D’ÉQUIPEMENT GLOBAL');
  expect(detail).toContain('Améliorer tous les équipements');
  expect(index).toContain('shadowreach-build" content="2026.09.26.455"');
  expect(index).toContain('game-5.js?v=2026.09.26.455h');
  expect(index).toContain("var V='2026.09.26.455'");
});
