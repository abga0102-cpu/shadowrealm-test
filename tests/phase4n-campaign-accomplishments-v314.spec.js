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
  await page.waitForFunction(() =>
    window.__srCampaign800V322 === true &&
    window.__srAccomplishmentsCanonicalV139 === true &&
    window.__srAccomplishmentsClaimV140 === true
  );
}

test('V322 Accomplishments uses 20-stage local notation and preserved milestone rewards', async ({ page }) => {
  await openCleanGame(page);
  await page.evaluate(() => ACT.accomplishments());
  const modal = page.locator('.srAch139');
  await expect(modal).toBeVisible();
  await expect(modal.locator('[title="Terminer Divin · 5-20"]')).toHaveCount(1);
  await expect(modal.locator('[title="Terminer Cauchemar · 5-20"]')).toHaveCount(1);
  await expect(modal.locator('[title="Vaincre Difficile · 3-5"]')).toHaveCount(1);
  await expect(modal).not.toContainText('40-10');
  await expect(modal).not.toContainText('Rebirth');
  await expect(modal).not.toContainText('1 000 PR');
  await expect(modal.locator('[data-ach^="rb"]')).toHaveCount(0);
});

test('V322 first boss accomplishment stays locked until the mapped Boss is actually defeated', async ({ page }) => {
  await openCleanGame(page);
  await page.evaluate(() => {
    S.recordFloor = 45;
    S.bossClears = S.bossClears || {};
    delete S.bossClears['45'];
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = S.accomplishments.claimed || {};
    delete S.accomplishments.claimed.floor25;
    ACT.accomplishments();
  });
  await expect(page.locator('.srAch139 [data-ach="floor25"]')).toHaveCount(0);
  await page.locator('.srAch139 [data-act="closeModal"]').click();
  await page.evaluate(() => { S.bossClears['45'] = true; ACT.accomplishments(); });
  await expect(page.locator('.srAch139 [data-ach="floor25"]')).toBeVisible();
});

test('V322 final difficulty reward stays locked until Divin Boss 5-20 is actually defeated', async ({ page }) => {
  await openCleanGame(page);
  await page.evaluate(() => {
    S.recordFloor = 800;
    S.bossClears = S.bossClears || {};
    delete S.bossClears['800'];
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = S.accomplishments.claimed || {};
    delete S.accomplishments.claimed.floor400;
    ACT.accomplishments();
  });
  await expect(page.locator('.srAch139 [data-ach="floor400"]')).toHaveCount(0);
  await expect(page.locator('.srAch139 [title="Terminer Divin · 5-20"]')).toHaveCount(1);
  await page.locator('.srAch139 [data-act="closeModal"]').click();
  await page.evaluate(() => { S.bossClears['800'] = true; ACT.accomplishments(); });
  await expect(page.locator('.srAch139 [data-ach="floor400"]')).toBeVisible();
});

test('V322 Divin Boss accomplishment pays the same active progression resources once and never creates PR', async ({ page }) => {
  await openCleanGame(page);
  const before = await page.evaluate(() => {
    S.recordFloor = 800;
    S.bossClears = S.bossClears || {};
    S.bossClears['800'] = true;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = S.accomplishments.claimed || {};
    delete S.accomplishments.claimed.floor400;
    S.accomplishments.mergePieces = S.accomplishments.mergePieces || {};
    S.accomplishments.mergePieces.MYTHIQUE = 0;
    S.eclat = 100; S.essence = 200; S.universalKeys = 3;
    S.rebirth = S.rebirth || { pr: 0, upgrades: {}, count: 0 };
    S.rebirth.pr = 777;
    ACT.accomplishments();
    return { eclat:S.eclat, essence:S.essence, universal:S.universalKeys, pr:S.rebirth.pr };
  });
  await page.locator('.srAch139 [data-ach="floor400"]').click();
  const after = await page.evaluate(() => ({ eclat:S.eclat, essence:S.essence, universal:S.universalKeys, pr:S.rebirth.pr, claimed:!!S.accomplishments.claimed.floor400 }));
  expect(after).toEqual({ eclat:before.eclat+2500, essence:before.essence+2500, universal:before.universal+1, pr:before.pr, claimed:true });
  await expect(page.locator('.srAch139 [data-ach="floor400"]')).toHaveCount(0);
  await expect(page.locator('.srAch139')).toContainText('Récupéré');
});

test('V322 progression guidance preserves the Mega Boss floor-50 gate under new notation', async ({ page }) => {
  await openCleanGame(page);
  await page.waitForFunction(() => window.__srRebirthRemovalAuthorityV281 === true);
  const result = await page.evaluate(() => {
    const fresh = defaultState('QA V322');
    fresh.recordFloor = 25; fresh.floor = 25;
    const goals = progressionGoals(fresh);
    const unlock = nextUnlockGoal(fresh);
    const retiredRefs = goals.filter((g) => {
      const id=String(g.id||''),go=String(g.go||''),title=String(g.title||''),why=String(g.why||'');
      return /^rebirth/i.test(id)||go.toLowerCase()==='rebirth'||/rebirth/i.test(title)||/(^|\s)PR(\s|$)/.test(title+' '+why);
    });
    return { ids:goals.map((g)=>g.id), titles:goals.map((g)=>g.title), retiredRefs, unlock };
  });
  expect(result.ids.some((id) => /^rebirth/i.test(id))).toBe(false);
  expect(result.retiredRefs).toEqual([]);
  expect(result.titles.some((t) => /Boss 2-5/.test(String(t)) || /Boss 3-5/.test(String(t)))).toBe(true);
  expect(result.unlock && result.unlock.title).toBe('Méga-Boss');
  expect(result.unlock && result.unlock.note).toBe('Vaincre le Boss 3-10');
});
