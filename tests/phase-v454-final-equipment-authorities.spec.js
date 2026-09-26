const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function openFinalGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof itemUpgradeCost === 'function' &&
    typeof itemUpgradeChance === 'function' &&
    typeof equipmentDisplayName === 'function' &&
    typeof equipmentRomanLevel === 'function' &&
    window.__srEquipmentDisplayV450 &&
    window.__srEquipmentDisplayV450.version === 454 &&
    window.__srProgressionAuditV307
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V454 final runtime keeps half Dust cost and +25 risk after every late authority', async ({ page }) => {
  await openFinalGame(page);
  const result = await page.evaluate(() => ({
    cost0: itemUpgradeCost({ level: 0 }),
    cost1: itemUpgradeCost({ level: 1 }),
    cost10: itemUpgradeCost({ level: 10 }),
    chance24: itemUpgradeChance({ level: 24 }),
    chance25: itemUpgradeChance({ level: 25 }),
    chance27: itemUpgradeChance({ level: 27 }),
    chance999: itemUpgradeChance({ level: 999 }),
    audit: window.__srProgressionAuditV307
  }));
  expect(result.cost0).toBe(30);
  expect(result.cost1).toBe(48);
  expect(result.cost10).toBe(210);
  expect(result.chance24).toBe(100);
  expect(result.chance25).toBe(95);
  expect(result.chance27).toBe(90);
  expect(result.chance999).toBe(5);
  expect(result.audit.dustCost0).toBe(30);
  expect(result.audit.dustCost10).toBe(210);
  expect(result.audit.dustChance25).toBe(95);
});

test('V454 current Equipment renderer visibly uses Roman levels', async ({ page }) => {
  await openFinalGame(page);
  const id = await page.evaluate(() => {
    const it = makeItem('casque', 'RARE', S.forge.level);
    it.level = 3;
    S.inventory = [it];
    route = 'equipement';
    render();
    return it.id;
  });

  const row = page.locator('#screen .itemRow').filter({ hasText: '| III' }).first();
  await expect(row).toContainText('| III');

  await page.evaluate((itemId) => showItemDetail(itemId, 'casque'), id);
  await expect(page.locator('body')).toContainText('| III');
  expect(await page.evaluate((itemId) => {
    const it = S.inventory.find(x => x.id === itemId);
    return { level: it.level, label: equipmentDisplayName(it), roman: equipmentRomanLevel(it.level) };
  }, id)).toEqual({ level: 3, label: 'Casque Rare | III', roman: 'III' });
});

test('V454 Mythique II sacrifice really credits 100 Dust in live state', async ({ page }) => {
  await openFinalGame(page);
  await page.evaluate(() => {
    S.poussiere = 0;
    const st = sanctMergeState();
    const cap = Math.max(16, st.mergeBoard.length || 16);
    st.mergeBoard = Array(cap).fill(null);
    st.mergeBoard[0] = 'MYTHIQUE_II';
    route = 'sanctuaire';
    render();
  });

  const button = page.locator('[data-sanct-v130="sacrifice"][data-rarity="MYTHIQUE_II"]');
  await expect(button).toBeEnabled();
  page.once('dialog', dialog => dialog.accept());
  await button.click();

  await expect.poll(() => page.evaluate(() => S.poussiere)).toBe(100);
  const state = await page.evaluate(() => ({
    dust: S.poussiere,
    stillOnBoard: sanctMergeState().mergeBoard.includes('MYTHIQUE_II')
  }));
  expect(state).toEqual({ dust: 100, stillOnBoard: false });
});

test('V454 removes the stale late Dust override and stale Sanctuary mastery values', async () => {
  const v304 = fs.readFileSync('progression-stability-authority-v304.js', 'utf8');
  const v132 = fs.readFileSync('sanctuary-divine-mastery-v132.js', 'utf8');
  const game5 = fs.readFileSync('game-5.js', 'utf8');

  expect(v304).not.toContain('itemUpgradeCost=function');
  expect(v304).not.toContain('itemUpgradeChance=function');
  expect(v304).not.toContain('60+36*Math.max');
  expect(v304).not.toContain('level<70');
  expect(v132).toContain("if(r==='MYTHIQUE_III')out.mineral=1500");
  expect(v132).toContain("var acc={EPIQUE_I:1,EPIQUE_II:5,MYTHIQUE_III:30");
  expect(game5).toContain('À partir de +25 · échec = niveau conservé');
  expect(game5).toContain('jusqu’au niveau +24.');
});
