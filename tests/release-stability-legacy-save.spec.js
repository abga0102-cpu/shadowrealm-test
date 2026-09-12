const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const legacySave = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'fixtures', 'saves', 'minimal-old-save.json'),
  'utf8'
));

async function openLegacyGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript((save) => {
    localStorage.setItem('shadowreach.save.local', JSON.stringify(save));
    localStorage.removeItem('shadowreach.social.v1.messages');
  }, legacySave);

  // Deliberately do not use ?smoke=1: smoke mode bypasses loadSave(), while
  // this contract validates the real startup path used by returning players.
  await page.goto('/index.html');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await page.waitForFunction(() =>
    typeof S !== 'undefined' &&
    window.__srAppleRetirementV306 === true &&
    window.__srRebirthRemovalAuthorityV281 === true,
    null,
    { timeout: 10000 }
  );
}

test('legacy localStorage save boots through current migration without losing core progress', async ({ page }) => {
  await openLegacyGame(page);

  const state = await page.evaluate(() => ({
    level: S.level,
    gold: S.gold,
    floor: S.floor,
    raidsReady: !!S.raids && typeof S.raids === 'object',
    forgeReady: !!S.forge && typeof S.forge === 'object',
    treeReady: !!S.tree && typeof S.tree === 'object',
    tutorialReady: !!S.tutorial && typeof S.tutorial === 'object',
    starsReady: !!S.stars && typeof S.stars === 'object',
    raidAllocationReady: !!S.raidKeyAlloc && typeof S.raidKeyAlloc === 'object',
  }));

  expect(state.level).toBe(7);
  expect(state.gold).toBe(321);
  expect(state.floor).toBe(4);
  expect(state.raidsReady).toBe(true);
  expect(state.forgeReady).toBe(true);
  expect(state.treeReady).toBe(true);
  expect(state.tutorialReady).toBe(true);
  expect(state.starsReady).toBe(true);
  expect(state.raidAllocationReady).toBe(true);
});

test('retired Apple and Rebirth systems stay retired after a real legacy-save boot', async ({ page }) => {
  await openLegacyGame(page);

  const retired = await page.evaluate(() => ({
    appleReward: typeof megaAppleBaseReward === 'function' ? megaAppleBaseReward(999) : 0,
    petUpgradeCost: typeof petUpgradeCost === 'function' ? petUpgradeCost({}) : Infinity,
    canRebirth: typeof canRebirth === 'function' ? canRebirth() : false,
    rebirthUpgradeCount: typeof REBIRTH_UPGRADES !== 'undefined' && Array.isArray(REBIRTH_UPGRADES)
      ? REBIRTH_UPGRADES.length
      : 0,
  }));

  expect(retired.appleReward).toBe(0);
  expect(retired.petUpgradeCost).toBe(Infinity);
  expect(retired.canRebirth).toBe(false);
  expect(retired.rebirthUpgradeCount).toBe(0);
});

test('modern timer feedback remains usable immediately after migrating a legacy save', async ({ page }) => {
  await openLegacyGame(page);

  const prepared = await page.evaluate(() => {
    const old = document.getElementById('rewardFeed');
    if (old) old.remove();

    const node = TREE_NODES.find((entry) => entry && !entry.deprecatedKey);
    if (!node) return false;

    timerNoticeSeen.tree = null;
    timerNoticeSeen.eggs = {};
    S.tree.active = node.id;
    S.tree.activeEnd = Date.now() - 1000;
    S.eggs = [{
      id: 'release-stability-ready-egg',
      rarity: 'RARE',
      species: 'loup',
      hatchEnd: Date.now() - 1000,
    }];
    checkTimerNotifications();
    return true;
  });

  expect(prepared).toBe(true);
  const feed = page.locator('#rewardFeed');
  await expect(feed.locator('.rewardPop')).toHaveCount(2);
  await expect(feed).toContainText('Recherche terminée');
  await expect(feed).toContainText('Œuf prêt à éclore');
  await expect(feed.locator('.rewardPop.clickable')).toHaveCount(2);
  await expect(page.locator('#overlay')).toHaveCount(0);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
