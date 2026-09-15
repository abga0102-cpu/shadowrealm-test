const { test, expect } = require('@playwright/test');

const expected = new Map([
  [1, 750], [2, 780], [8, 960], [9, 980], [10, 1000],
  [11, 1010], [20, 1100], [50, 1400], [100, 1900]
]);

test('V323 Raid Minerai reward curve and autonomy stay authoritative', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => typeof raidReward === 'function' && window.__shadowreachRaidMineraiBalance?.version === 323);

  for (const [level, reward] of expected) {
    expect(await page.evaluate((lv) => raidReward('minerai', lv), level)).toBe(reward);
  }

  expect(await page.evaluate(() => window.__shadowreachRaidMineraiBalance.autonomySharePerHour)).toBe(0.25);
});
