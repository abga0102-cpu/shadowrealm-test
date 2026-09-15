const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('V324 strengthens Raids without changing Campaign scaling', async ({ page }) => {
  const source = fs.readFileSync(path.join(root, 'enemy-damage-authority-v289.js'), 'utf8');
  expect(source).toContain('var RAID_HP_MUL=1.35;');
  expect(source).toContain('var RAID_DAMAGE_MUL=1.25;');
  expect(source).toContain("if(mode==='raid' && enemy)");
  expect(source).toContain('raidPowerV324:{hpMul:RAID_HP_MUL,damageMul:RAID_DAMAGE_MUL,campaignUnchanged:true}');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srEnemyDamageConfigV289 && window.__srEnemyDamageConfigV289.raidPowerV324);
  const cfg = await page.evaluate(() => window.__srEnemyDamageConfigV289.raidPowerV324);
  expect(cfg).toEqual({ hpMul: 1.35, damageMul: 1.25, campaignUnchanged: true });
});
