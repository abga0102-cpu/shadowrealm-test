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
  await page.waitForFunction(() => window.__srFamiliarSummonCostV322A === 50);
  await page.evaluate(() => {
    try { if (typeof clearTutorialGuide === 'function') clearTutorialGuide(); } catch (_) {}
    const card = document.getElementById('tutorialCard');
    if (card) card.remove();
    S.tutorial = null;
  });
}

test('V322A requires 50 Essence for one paid Familiar summon', async ({ page }) => {
  await openCleanGame(page);

  const blocked = await page.evaluate(() => {
    update((st) => {
      st.essence = 49;
      st.eggs = [];
      st.petMastery.count = 0;
      st.petMastery.progress = 0;
    });
    const before = S.petMastery.count;
    const results = summonEgg(1);
    return {
      results: results.length,
      essence: S.essence,
      masteryDelta: S.petMastery.count - before,
      eggs: S.eggs.length,
    };
  });
  expect(blocked).toEqual({ results: 0, essence: 49, masteryDelta: 0, eggs: 0 });

  const paid = await page.evaluate(() => {
    update((st) => { st.essence = 50; st.eggs = []; });
    const before = S.petMastery.count;
    const results = summonEgg(1);
    return {
      results: results.length,
      essence: S.essence,
      masteryDelta: S.petMastery.count - before,
      eggs: S.eggs.length,
    };
  });
  expect(paid.results).toBeGreaterThanOrEqual(1);
  expect(paid.essence).toBe(0);
  expect(paid.masteryDelta).toBe(1);
  expect(paid.eggs).toBe(paid.results);
});

test('V322A keeps Double Egg free while charging only one 50-Essence paid summon', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const eggNodes = (typeof TREE_NODES !== 'undefined' ? TREE_NODES : []).filter((n) => n.effect === 'eggFree');
    update((st) => {
      st.essence = 50;
      st.eggs = [];
      st.tree = st.tree || {};
      st.tree.levels = st.tree.levels || {};
      eggNodes.forEach((n) => { st.tree.levels[n.id] = n.max; });
    });
    const chance = typeof treeSum === 'function' ? treeSum(S, 'eggFree') : 0;
    const before = S.petMastery.count;
    const oldRandom = Math.random;
    Math.random = () => 0;
    let results;
    try { results = summonEgg(1); }
    finally { Math.random = oldRandom; }
    return {
      chance,
      results: results.length,
      essence: S.essence,
      masteryDelta: S.petMastery.count - before,
      eggs: S.eggs.length,
    };
  });

  expect(result.chance).toBeGreaterThan(0);
  expect(result.results).toBe(2);
  expect(result.essence).toBe(0);
  expect(result.masteryDelta).toBe(1);
  expect(result.eggs).toBe(2);
});

test('V322A Familiar UI and resource help show 50 / 500 and enforce the new thresholds', async ({ page }) => {
  await openCleanGame(page);

  const at49 = await page.evaluate(() => {
    update((st) => { st.essence = 49; });
    const html = scrFamiliers();
    const one = (html.match(/<button[^>]*data-act="summonEgg"[^>]*data-arg="1"[^>]*>/) || [''])[0];
    const ten = (html.match(/<button[^>]*data-act="summonEgg"[^>]*data-arg="10"[^>]*>/) || [''])[0];
    return {
      has50: html.includes('Invoquer · 50'),
      has500: html.includes('x10 · 500'),
      oneDisabled: /\sdisabled(?:\s|=|>)/.test(one),
      tenDisabled: /\sdisabled(?:\s|=|>)/.test(ten),
      info: RESOURCE_INFO.essence.desc,
    };
  });
  expect(at49.has50).toBe(true);
  expect(at49.has500).toBe(true);
  expect(at49.oneDisabled).toBe(true);
  expect(at49.tenDisabled).toBe(true);
  expect(at49.info).toContain('50 Essence');

  const thresholds = await page.evaluate(() => {
    update((st) => { st.essence = 50; });
    let html = scrFamiliers();
    const one50 = (html.match(/<button[^>]*data-act="summonEgg"[^>]*data-arg="1"[^>]*>/) || [''])[0];
    const ten50 = (html.match(/<button[^>]*data-act="summonEgg"[^>]*data-arg="10"[^>]*>/) || [''])[0];
    update((st) => { st.essence = 500; });
    html = scrFamiliers();
    const ten500 = (html.match(/<button[^>]*data-act="summonEgg"[^>]*data-arg="10"[^>]*>/) || [''])[0];
    return {
      oneAt50Disabled: /\sdisabled(?:\s|=|>)/.test(one50),
      tenAt50Disabled: /\sdisabled(?:\s|=|>)/.test(ten50),
      tenAt500Disabled: /\sdisabled(?:\s|=|>)/.test(ten500),
    };
  });
  expect(thresholds).toEqual({ oneAt50Disabled: false, tenAt50Disabled: true, tenAt500Disabled: false });
});

test('V322A leaves Skill/Familiar Raid reward curves unchanged', async ({ page }) => {
  await openCleanGame(page);
  const rewards = await page.evaluate(() => ({
    competence1: raidReward('competence', 1),
    competence10: raidReward('competence', 10),
    familiar1: raidReward('familier', 1),
    familiar10: raidReward('familier', 10),
    configCost: __srRaidSummonEconomyConfigV291.familier.paidSummonCost,
  }));
  expect(rewards).toEqual({ competence1: 250, competence10: 340, familiar1: 250, familiar10: 340, configCost: 50 });
});
