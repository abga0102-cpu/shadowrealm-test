const { test, expect } = require('@playwright/test');

async function clean(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srForgeGoldV470 &&
    typeof forgeSummon === 'function' &&
    typeof goldMul === 'function' &&
    typeof treeSum === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V470 Forge Gold table scales by rarity and existing Gold nodes cap at 20 percent', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    const api = window.__srForgeGoldV470;
    S.tree = S.tree || {};
    S.tree.levels = S.tree.levels || {};
    ['n1_06','n2_06','n3_06','n4_06'].forEach(id => { S.tree.levels[id] = 5; });
    return {
      table: api.baseByRarity,
      goldBonus: treeSum(S,'goldAll'),
      divinWithTree: api.reward(S,'DIVIN'),
      communWithTree: api.reward(S,'COMMUN')
    };
  });
  expect(out.table).toMatchObject({
    COMMUN:10, PEU_COMMUN:15, RARE:18, EPIQUE:33, HEROIQUE:45, MYTHIQUE:60,
    ARTEFACT:105, LEGENDAIRE:180, INFERNAL:300, IMMORTEL:450, DIVIN:650
  });
  expect(out.goldBonus).toBeCloseTo(20, 6);
  expect(out.divinWithTree).toBe(780);
  expect(out.communWithTree).toBe(12);
});

test('V470 pays Gold once per paid Forge and not for the free bonus result', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    S.forge.level = 1;
    S.forge.summonCount = 0;
    S.forge.lifetimeCount = 0;
    S.minerai = 100;
    S.gold = 0;
    S.inventory = [];
    S.tree = S.tree || {};
    S.tree.levels = S.tree.levels || {};
    ['n1_06','n2_06','n3_06','n4_06'].forEach(id => { S.tree.levels[id] = 0; });

    const originalTreeSum = treeSum;
    treeSum = function(s,effect) {
      if (effect === 'forgeFree') return 100;
      return originalTreeSum(s,effect);
    };

    let result;
    try {
      result = forgeSummon(1);
    } finally {
      treeSum = originalTreeSum;
    }
    return {
      minerai:S.minerai,
      gold:S.gold,
      results:result.map(r => ({rarity:r.rarity,free:r.free,gold:r.gold}))
    };
  });

  expect(out.minerai).toBe(90);
  expect(out.results).toHaveLength(2);
  expect(out.results[0]).toMatchObject({rarity:'COMMUN',free:false,gold:10});
  expect(out.results[1]).toMatchObject({rarity:'COMMUN',free:true,gold:0});
  expect(out.gold).toBe(10);
});
