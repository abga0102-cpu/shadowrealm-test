const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('V329 keeps direct Mega rewards separate from Monday milestone payouts', async ({ page }) => {
  const weekly = fs.readFileSync(path.join(root, 'weekly-mega-v71.js'), 'utf8');
  expect(weekly).toContain('// MEGA_REWARDS_V329');
  expect(weekly).toContain('const STATE_VERSION=329;');
  expect(weekly).toContain("source:source||'weekly'");
  expect(weekly).toContain('function recoverDirectBossRewards()');
  expect(weekly).toContain('const a=megaAccelReward(Number(f));');
  expect(weekly).toContain('function retireAppleOnly()');
  expect(weekly).not.toContain('function handleFirstClear(');
  expect(weekly).not.toContain('megaAccelReward=function(){return null;');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srMegaRewardsV329 && typeof megaRaidUnlocked === 'function');
  const result = await page.evaluate(() => ({
    unlockLevel: window.__srMegaRewardsV329.unlockLevel,
    levels: window.__srMegaRewardsV329.levels.slice(),
    rewardStateVersion: S && S.megaWeekly ? S.megaWeekly.rewardStateVersion : null,
    hasLegacyDirectHandler: typeof window.__srMegaRewardsV329.handleFirstClear === 'function'
  }));
  expect(result.unlockLevel).toBe(18);
  expect(result.levels).toEqual([1, 5, 10, 15, 20, 30, 40, 45, 50]);
  expect(result.rewardStateVersion).toBe(329);
  expect(result.hasLegacyDirectHandler).toBe(false);
});

test('V330 victory UI reports direct and weekly Mega rewards as separate circuits', async ({ page }) => {
  const source = fs.readFileSync(path.join(root, 'mega-victory-reward-v330.js'), 'utf8');
  expect(source).toContain('RÉCOMPENSE DU BOSS · ENCAISSÉE IMMÉDIATEMENT');
  expect(source).toContain('Récompense directe déjà encaissée lors de la première victoire');
  expect(source).toContain('PALIER HEBDOMADAIRE');
  expect(source).toContain('versement le lundi à 01:00 selon le meilleur palier atteint');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srMegaVictoryRewardV330 === true);
  expect(await page.evaluate(() => !!window.__srMegaVictoryRewardV330)).toBe(true);
});
test('V502 weekly Mega epoch flips at Monday 01:00 local time', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srMegaRewardsV329 && typeof window.__srMegaRewardsV329.weekEpoch === 'function');
  const out = await page.evaluate(() => {
    const f = window.__srMegaRewardsV329.weekEpoch;
    const before = new Date(2026, 9, 12, 0, 59, 59, 999);
    const at = new Date(2026, 9, 12, 1, 0, 0, 0);
    const beforeEpoch = new Date(f(before.getTime()));
    const atEpoch = new Date(f(at.getTime()));
    return {
      beforeDay: beforeEpoch.getDay(),
      beforeHour: beforeEpoch.getHours(),
      beforeDate: beforeEpoch.getDate(),
      atDay: atEpoch.getDay(),
      atHour: atEpoch.getHours(),
      atDate: atEpoch.getDate()
    };
  });
  expect(out.beforeDay).toBe(1);
  expect(out.beforeHour).toBe(1);
  expect(out.beforeDate).toBe(5);
  expect(out.atDay).toBe(1);
  expect(out.atHour).toBe(1);
  expect(out.atDate).toBe(12);
});

