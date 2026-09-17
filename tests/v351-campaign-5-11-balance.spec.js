const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('V351 lowers Campaign pressure from 5-11 without going below 5-8', async ({ page }) => {
  const enemySource = fs.readFileSync(path.join(root, 'enemy-damage-authority-v289.js'), 'utf8');
  const bossSource = fs.readFileSync(path.join(root, 'boss-final-authority-v288.js'), 'utf8');
  const easySource = fs.readFileSync(path.join(root, 'easy-dragon-balance-v333.js'), 'utf8');

  expect(enemySource).toContain('var CAMPAIGN_BALANCE_START=91;');
  expect(enemySource).toContain('var CAMPAIGN_BALANCE_MIN=88;');
  expect(enemySource).toContain('var CAMPAIGN_BALANCE_OFFSET=3;');
  expect(bossSource).toContain('campaignBalanceFloorV351');
  expect(easySource).toContain('var balanceFloor=campaignBalanceFloorV351(floor);');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srEnemyDamageConfigV289 &&
    window.__srBossFinalConfigV288 &&
    window.__srEasyDragonBalanceConfigV334
  );

  const result = await page.evaluate(() => {
    const cfg = window.__srEnemyDamageConfigV289;
    const shift = cfg.campaign5_11Balance;
    const bossShift = window.__srBossFinalConfigV288.campaign5_11Balance;
    const easyShift = window.__srEasyDragonBalanceConfigV334.campaign5_11Balance;

    const oldBaseHp91 = Math.max(1, Math.round(cfg.expectedPlayerDamage(91) * cfg.targetHitsToKill));
    const oldBaseDmg91 = Math.max(1, Math.round(cfg.expectedPlayerHP(91) / cfg.targetHitsToDefeatReference));

    const type = { id: 'test', name: 'Test', hpMul: 1, dmgMul: 1, ranged: false, img: 'enemy_goblin' };
    const spawn = (floor) => makeEnemy('campaign', {
      type, name: 'Test', tier: 'COMMUN', floor, elite: false, boss: false, x: 700
    });
    const e88 = spawn(88);
    const e91 = spawn(91);
    const e92 = spawn(92);

    return {
      map90: shift.balanceFloor(90),
      map91: shift.balanceFloor(91),
      map92: shift.balanceFloor(92),
      map800: shift.balanceFloor(800),
      boss95: bossShift.balanceFloor(95),
      easy91: easyShift.balanceFloor(91),
      hp88: cfg.enemyHP(88), hp91: cfg.enemyHP(91), hp92: cfg.enemyHP(92),
      dmg88: cfg.enemyDamage(88), dmg91: cfg.enemyDamage(91), dmg92: cfg.enemyDamage(92),
      oldBaseHp91, oldBaseDmg91,
      final88: { hp: e88.maxHP, dmg: e88.dmg },
      final91: { hp: e91.maxHP, dmg: e91.dmg },
      final92: { hp: e92.maxHP, dmg: e92.dmg }
    };
  });

  expect(result.map90).toBe(90);
  expect(result.map91).toBe(88);
  expect(result.map92).toBe(89);
  expect(result.map800).toBe(797);
  expect(result.boss95).toBe(92);
  expect(result.easy91).toBe(88);

  expect(result.hp91).toBe(result.hp88);
  expect(result.dmg91).toBe(result.dmg88);
  expect(result.hp91).toBeLessThan(result.oldBaseHp91);
  expect(result.dmg91).toBeLessThan(result.oldBaseDmg91);
  expect(result.hp92).toBeGreaterThan(result.hp91);
  expect(result.dmg92).toBeGreaterThan(result.dmg91);

  expect(result.final91).toEqual(result.final88);
  expect(result.final92.hp).toBeGreaterThanOrEqual(result.final91.hp);
  expect(result.final92.dmg).toBeGreaterThanOrEqual(result.final91.dmg);
});
