const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('V334 preserves the Facile 4-15 Dragon correction and smooths late Easy', async ({ page }) => {
  const source = fs.readFileSync(path.join(root, 'easy-dragon-balance-v333.js'), 'utf8');
  expect(source).toContain('var TARGET_FLOOR=75;');
  expect(source).toContain('var LATE_EASY_START=76;');
  expect(source).toContain('var LATE_EASY_END=100;');
  expect(source).toContain('var HP_MUL=0.76;');
  expect(source).toContain('var BASE_DMG_MUL=0.88;');
  expect(source).toContain("c.ctx==='campaign'&&Number(c.floor)===TARGET_FLOOR");
  expect(source).toContain("if(opts.boss&&floor===TARGET_FLOOR)");
  expect(source).toContain('if(floor>=LATE_EASY_START&&floor<=LATE_EASY_END)');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srEasyDragonBalanceConfigV334);
  const cfg = await page.evaluate(() => window.__srEasyDragonBalanceConfigV334);
  expect(cfg).toMatchObject({
    dragonFloor: 75,
    dragonStage: 'Facile 4-15',
    dragonHpMul: 0.76,
    dragonBaseDamageMul: 0.88,
    dragonBreathMaxHpPct: 33,
    dragonBreathCooldown: 18,
    dragonFlightSeconds: 3,
    dragonFlightCooldown: 22,
    dragonMeleeDamageDuringFlightPct: 40,
    dragonIntimidationPct: 20,
    dragonIntimidationSeconds: 6,
    dragonIntimidationCooldown: 20,
    lateEasy: {
      startFloor: 76,
      endFloor: 100,
      normalHpMulStart: 0.90,
      normalHpMulEnd: 0.52,
      bossHpMulStart: 0.70,
      bossHpMulEnd: 0.35,
      damageMulStart: 0.98,
      damageMulEnd: 0.30
    }
  });
});
