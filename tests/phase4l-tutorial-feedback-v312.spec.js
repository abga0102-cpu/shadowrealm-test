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

function currentSeen(overrides = {}) {
  return Object.assign({
    combat: true,
    equipement: true,
    competence: true,
    familier: true,
    forge: true,
    raid: true,
    megaBoss: true,
    tree: true,
  }, overrides);
}

test('V312 tutorial runway follows current progression and never revives retired Rebirth or Apple guidance', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const setSeen = (overrides) => {
      S.tutorial = S.tutorial || {};
      S.tutorial.seen = Object.assign({
        combat: true,
        equipement: true,
        competence: true,
        familier: true,
        forge: true,
        raid: true,
        megaBoss: true,
        tree: true,
      }, overrides || {});
    };

    setSeen({ raid: false });
    S.level = Math.max(Number(S.level) || 1, RULES.RAID_UNLOCK_LEVEL);
    const raid = pendingTutorialStep();

    setSeen({ megaBoss: false });
    S.bossClears = Object.assign({}, S.bossClears, { '50': true });
    S.recordFloor = Math.max(Number(S.recordFloor) || 1, 50);
    S.floor = Math.max(Number(S.floor) || 1, 50);
    const mega = pendingTutorialStep();

    setSeen({ tree: false });
    S.pe = Math.max(1, Number(S.pe) || 0);
    S.floor = Math.max(Number(S.floor) || 1, Number(RULES.REBIRTH_UNLOCK_FLOOR) || 25);
    const tree = pendingTutorialStep();

    return {
      raidKey: raid && raid.key,
      megaKey: mega && mega.key,
      treeKey: tree && tree.key,
      rebirthFlowPresent: typeof TUTORIAL_FLOWS !== 'undefined' && !!TUTORIAL_FLOWS.rebirth,
      mentionsApple: typeof TUTORIAL_FLOWS !== 'undefined' && /pomme|apple/i.test(JSON.stringify(TUTORIAL_FLOWS)),
      currentKeyIsRebirth: [raid, mega, tree].some((step) => step && step.key === 'rebirth'),
    };
  });

  expect(result.raidKey).toBe('raid');
  expect(result.megaKey).toBe('megaBoss');
  expect(result.treeKey).toBe('tree');
  expect(result.rebirthFlowPresent).toBe(false);
  expect(result.mentionsApple).toBe(false);
  expect(result.currentKeyIsRebirth).toBe(false);
});

test('V312 tutorial takes priority on Home, then the useful recommendation returns after the step is seen', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    if (!S.tutorial || typeof S.tutorial !== 'object') S.tutorial = { seen: {} };
    S.tutorial.seen = {
      combat: true,
      equipement: true,
      competence: true,
      familier: true,
      forge: true,
      raid: true,
      megaBoss: true,
      tree: false,
    };
    S.pe = Math.max(1, Number(S.pe) || 0);
    S.forge.upgradeEnd = Date.now() - 1000;
    const old = document.getElementById('tutorialCard');
    if (old) old.remove();
    if (typeof clearTutorialGuide === 'function') clearTutorialGuide();
    if (typeof tutorialCurrentKey !== 'undefined') tutorialCurrentKey = null;
    nav('accueil');
    scheduleRender();
  });

  await expect(page.locator('#tutorialCard')).toContainText('Arbre personnel', { timeout: 5000 });
  await expect(page.locator('.recommendedActionCard')).toHaveCount(0);

  await page.evaluate(() => {
    S.tutorial.seen.tree = true;
    const card = document.getElementById('tutorialCard');
    if (card) card.remove();
    if (typeof clearTutorialGuide === 'function') clearTutorialGuide();
    if (typeof tutorialCurrentKey !== 'undefined') tutorialCurrentKey = null;
    scheduleRender();
  });

  await expect(page.locator('#tutorialCard')).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator('.recommendedActionCard')).toContainText('Récupérer la Forge', { timeout: 5000 });
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('V312 combat reward feedback separates Gold and EXP without retired progression resources', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    const old = document.getElementById('rewardFeed');
    if (old) old.remove();
    rewardNotice = { gold: 1234, exp: 567, boss: true, floor: 50 };
    checkRewardNotice();
  });

  const feed = page.locator('#rewardFeed');
  await expect(feed.locator('.rewardPop')).toHaveCount(2);
  await expect(feed.locator('.rewardPop.gold')).toHaveCount(1);
  await expect(feed.locator('.rewardPop.exp')).toHaveCount(1);
  await expect(feed.locator('.rewardPop.gold')).toContainText('Or obtenu');
  await expect(feed.locator('.rewardPop.exp')).toContainText('EXP obtenue');
  await expect(feed.locator('.rewardPop.gold')).toHaveClass(/boss/);
  await expect(feed.locator('.rewardPop.exp')).toHaveClass(/boss/);
  await expect(feed).not.toContainText(/Pomme|Apple|Rebirth|\bPR\b/i);
});

test('V312 completed Tree research and eggs surface distinct clickable feedback without blocking combat', async ({ page }) => {
  await openCleanGame(page);

  const state = await page.evaluate(() => {
    const old = document.getElementById('rewardFeed');
    if (old) old.remove();
    const node = TREE_NODES.find((entry) => entry && !entry.deprecatedKey);
    if (!node) return { node: false };

    timerNoticeSeen.tree = null;
    timerNoticeSeen.eggs = {};
    S.tree.active = node.id;
    S.tree.activeEnd = Date.now() - 1000;
    S.eggs = [{
      id: 'qa-v312-ready-egg',
      rarity: 'RARE',
      species: 'loup',
      hatchEnd: Date.now() - 1000,
    }];
    checkTimerNotifications();
    return { node: true };
  });

  expect(state.node).toBe(true);
  const feed = page.locator('#rewardFeed');
  await expect(feed.locator('.rewardPop')).toHaveCount(2);
  await expect(feed).toContainText('Recherche terminée');
  await expect(feed).toContainText('Œuf prêt à éclore');
  await expect(feed.locator('.rewardPop.clickable')).toHaveCount(2);
  await expect(page.locator('#overlay')).toHaveCount(0);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
