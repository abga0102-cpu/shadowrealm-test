const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srMegaRewardsV318 && typeof megaRaidUnlocked === 'function');
}

test('V318 Mega Boss unlocks at hero level 18 and only preserves actual Mega history', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const before = defaultState('QA');
    before.level = 17;
    before.bossClears = { '50': true };
    const unlocked = structuredClone(before);
    unlocked.level = 18;
    const legacyMega = structuredClone(before);
    legacyMega.level = 1;
    legacyMega.megaBossClears = { '10': true };
    return {
      unlockLevel: window.__srMegaRewardsV318.unlockLevel,
      before: megaRaidUnlocked(before),
      unlocked: megaRaidUnlocked(unlocked),
      legacyMega: megaRaidUnlocked(legacyMega),
    };
  });
  expect(result).toEqual({ unlockLevel: 18, before: false, unlocked: true, legacyMega: true });
});

test('V318 exposes only the nine approved reward boxes and exact rewards', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const api = window.__srMegaRewardsV318;
    return {
      levels: api.levels,
      rewards: api.levels.map((level) => api.reward(level)),
      no25: api.reward(25),
      no35: api.reward(35),
      accelMinutes: ACCEL_DEFS.map((x) => Number(x.mins)).sort((a, b) => a - b),
    };
  });
  expect(result.levels).toEqual([1, 5, 10, 15, 20, 30, 40, 45, 50]);
  expect(result.rewards).toEqual([
    { level: 1, rarity: 'COMMUN', pieces: 5, mins: 1, qty: 5 },
    { level: 5, rarity: 'COMMUN', pieces: 10, mins: 1, qty: 5 },
    { level: 10, rarity: 'RARE', pieces: 5, mins: 5, qty: 5 },
    { level: 15, rarity: 'RARE', pieces: 10, mins: 5, qty: 5 },
    { level: 20, rarity: 'EPIQUE', pieces: 4, mins: 10, qty: 10 },
    { level: 30, rarity: 'MYTHIQUE', pieces: 1, mins: 10, qty: 15 },
    { level: 40, rarity: 'ARTEFACT', pieces: 1, mins: 20, qty: 15 },
    { level: 45, rarity: 'ARTEFACT', pieces: 2, mins: 20, qty: 20 },
    { level: 50, rarity: 'LEGENDAIRE', pieces: 1, mins: 20, qty: 20 },
  ]);
  expect(result.no25).toBeNull();
  expect(result.no35).toBeNull();
  expect(result.accelMinutes).toContain(10);
  expect(result.accelMinutes).toContain(20);
});

test('V318 first milestone clear pays immediately once and retires old Mega payouts', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S = defaultState('QA');
    S.level = 18;
    S.megaBossClears = { '200': true, '250': true };
    S.sanctuary = { mergeBoard: Array(16).fill(null), weeklyReserve: {} };
    S.accels = {};
    S.megaWeekly = {
      lastEpoch: 0,
      lastLevel: 0,
      lastReward: null,
      directClaimed: {},
      unlockedAt: {},
      rewardStateVersion: 318,
    };
    const direct = { firstClear: true };
    const repeat = { firstClear: true };
    const noReward = { firstClear: true };
    const when = new Date(2026, 8, 16, 12, 0, 0, 0).getTime();
    const paid = window.__srMegaRewardsV318.handleFirstClear(200, direct, when);
    const duplicate = window.__srMegaRewardsV318.handleFirstClear(200, repeat, when + 1000);
    const skipped = window.__srMegaRewardsV318.handleFirstClear(250, noReward, when);
    return {
      paid,
      duplicate,
      skipped,
      epics: S.sanctuary.mergeBoard.filter((x) => x === 'EPIQUE').length,
      accel10: S.accels.a10 || 0,
      directReward: direct.megaReward,
      oldAccel: megaAccelReward(200),
      oldApples: megaAppleFirstClearReward(200, S),
      unlockedAt: S.megaWeekly.unlockedAt['20'],
    };
  });
  expect(result.paid).toMatchObject({ level: 20, rarity: 'EPIQUE', pieces: 4, accelMins: 10, accelQty: 10, source: 'direct' });
  expect(result.duplicate).toBeNull();
  expect(result.skipped).toBeNull();
  expect(result.epics).toBe(4);
  expect(result.accel10).toBe(10);
  expect(result.directReward).toMatchObject({ level: 20, source: 'direct' });
  expect(result.oldAccel).toBeNull();
  expect(result.oldApples).toBe(0);
  expect(result.unlockedAt).toBe(new Date(2026, 8, 16, 12, 0, 0, 0).getTime());
});

test('V318 Monday 02:00 pays only the best checked reward box once', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S = defaultState('QA');
    S.level = 18;
    S.megaBossClears = { '10': true, '50': true, '100': true, '150': true, '200': true, '300': true };
    S.sanctuary = { mergeBoard: Array(16).fill(null), weeklyReserve: {} };
    S.accels = {};
    S.megaWeekly = {
      lastEpoch: 0,
      lastLevel: 0,
      lastReward: null,
      directClaimed: { '1': true, '5': true, '10': true, '15': true, '20': true, '30': true },
      unlockedAt: { '1': 0, '5': 0, '10': 0, '15': 0, '20': 0, '30': 0 },
      rewardStateVersion: 318,
    };
    const monday = new Date(2026, 8, 14, 2, 5, 0, 0).getTime();
    const first = window.__srMegaRewardsV318.grantWeeklyAt(monday);
    const second = window.__srMegaRewardsV318.grantWeeklyAt(monday);
    return {
      first,
      second,
      mythic: S.sanctuary.mergeBoard.filter((x) => x === 'MYTHIQUE').length,
      otherRewardPieces: S.sanctuary.mergeBoard.filter((x) => x && x !== 'MYTHIQUE').length,
      accel10: S.accels.a10 || 0,
      lastLevel: S.megaWeekly.lastLevel,
      lastReward: S.megaWeekly.lastReward,
    };
  });
  expect(result.first).toBe(true);
  expect(result.second).toBe(false);
  expect(result.mythic).toBe(1);
  expect(result.otherRewardPieces).toBe(0);
  expect(result.accel10).toBe(15);
  expect(result.lastLevel).toBe(30);
  expect(result.lastReward).toMatchObject({ level: 30, rarity: 'MYTHIQUE', pieces: 1, accelMins: 10, accelQty: 15, source: 'weekly' });
});

test('V318 a box checked after Monday 02:00 waits until the next Monday for weekly payout', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S = defaultState('QA');
    S.level = 18;
    S.megaBossClears = { '200': true };
    S.sanctuary = { mergeBoard: Array(16).fill(null), weeklyReserve: {} };
    S.accels = {};
    const monday = new Date(2026, 8, 14, 2, 0, 0, 0).getTime();
    const wednesday = new Date(2026, 8, 16, 12, 0, 0, 0).getTime();
    const nextMonday = new Date(2026, 8, 21, 2, 0, 0, 0).getTime();
    S.megaWeekly = {
      lastEpoch: window.__srMegaRewardsV318.weekEpoch(monday - 1),
      lastLevel: 0,
      lastReward: null,
      directClaimed: {},
      unlockedAt: {},
      rewardStateVersion: 318,
    };
    const first = { firstClear: true };
    window.__srMegaRewardsV318.handleFirstClear(200, first, wednesday);
    const currentWeek = window.__srMegaRewardsV318.grantWeeklyAt(monday + 60000);
    const nextWeek = window.__srMegaRewardsV318.grantWeeklyAt(nextMonday + 60000);
    return {
      currentWeek,
      nextWeek,
      epics: S.sanctuary.mergeBoard.filter((x) => x === 'EPIQUE').length,
      accel10: S.accels.a10 || 0,
      lastLevel: S.megaWeekly.lastLevel,
    };
  });
  expect(result.currentWeek).toBe(false);
  expect(result.nextWeek).toBe(true);
  expect(result.epics).toBe(8);
  expect(result.accel10).toBe(20);
  expect(result.lastLevel).toBe(20);
});
