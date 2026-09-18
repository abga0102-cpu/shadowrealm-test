const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V378 globally reduces enemy HP and damage and keeps Mega-Boss ratios', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srGlobalEnemyNerfV378 && window.__srEnemyDamageConfigV289);

  const cfg = await page.evaluate(() => window.__srEnemyDamageConfigV289);
  expect(cfg.globalEnemyNerfV378.hpMul).toBeCloseTo(0.90, 8);
  expect(cfg.globalEnemyNerfV378.damageMul).toBeCloseTo(0.60, 8);
  expect(cfg.campaignHpMulV378).toBeCloseTo(0.54, 8);
  expect(cfg.campaignDamageMulV378).toBeCloseTo(0.36, 8);
  expect(cfg.raidPowerV324.hpMul).toBeCloseTo(1.215, 8);
  expect(cfg.raidPowerV324.damageMul).toBeCloseTo(0.75, 8);
  expect(cfg.globalEnemyNerfV378.appliesTo).toEqual(
    expect.arrayContaining(['normal', 'elite', 'boss', 'raid', 'mega-boss'])
  );
  expect(await page.evaluate(() => window.__srEnemyAbilityDamageV378(100))).toBe(60);

  const mega = await page.evaluate(() => {
    const floor = 50;
    const def = bossFor(floor);
    const type = Object.assign({}, ENEMY_TYPES[1], {
      id: 'v378_test_' + def.id,
      name: def.name,
      img: def.img,
      ranged: !!def.ranged,
      proj: def.proj || 'magic'
    });
    const boss = makeEnemy('campaign', {
      type,
      name: def.name,
      tier: def.tier,
      floor,
      boss: true,
      abils: def.abils,
      noFastback: true,
      x: AW - 60
    });
    const megaBoss = makeMegaBossEnemy(floor);
    return {
      bossHp: boss.maxHP,
      bossDmg: boss.dmg,
      megaHp: megaBoss.maxHP,
      megaDmg: megaBoss.dmg
    };
  });

  expect(mega.megaHp).toBe(mega.bossHp * 10);
  expect(mega.megaDmg).toBe(mega.bossDmg * 10);

  const source = fs.readFileSync(path.join(process.cwd(), 'enemy-damage-authority-v289.js'), 'utf8');
  expect(source).toContain('GLOBAL_HP_MUL_V378=0.90');
  expect(source).toContain('GLOBAL_DAMAGE_MUL_V378=0.60');

  const index = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  expect(index).toContain('enemy-damage-authority-v289.js?v=2026.09.18.378');
  expect(index).toContain('game-2.js?v=2026.09.18.378');
});
