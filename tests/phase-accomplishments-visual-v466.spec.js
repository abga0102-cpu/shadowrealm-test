const { test, expect } = require('@playwright/test');

async function boot(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srAccomplishmentsCanonicalV139 === true &&
    window.__srAccomplishmentsStabilityV138 === true &&
    window.__srAccomplishmentsClaimV140 === true &&
    typeof ACT !== 'undefined' &&
    typeof ACT.accomplishments === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

async function seedVisualState(page) {
  await page.evaluate(() => {
    S.forge = S.forge || {};
    S.forge.level = 15;
    S.sanctuary = S.sanctuary || {};
    S.sanctuary.mergeCrafts = 75;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.raidWins = 12;
    S.accomplishments.claimed = { forge10: true };
    S.accomplishments.premiumClaimed = {};
    S.bossClears = S.bossClears || {};
    S.bossClears['45'] = true;
    S.recordFloor = Math.max(50, Number(S.recordFloor) || 0);
    ACT.accomplishments();
  });
  await page.waitForFunction(() =>
    document.querySelector('#overlay .srAch139[data-ach-visual-v466="1"]') &&
    document.getElementById('overlay')?.classList.contains('srPassOverlay331')
  );
}

test('V466 adds premium hierarchy, progress readability and mobile-safe geometry', async ({ page }) => {
  await boot(page);
  await seedVisualState(page);

  const root = page.locator('#overlay .srAch139');
  await expect(root.locator('.achHeroStats466')).toHaveCount(1);
  await expect(root.locator('.achHeroStats466')).toContainText('Terminés');
  await expect(root.locator('.achHeroStats466')).toContainText('À réclamer');
  await expect(root.locator('.achCatIcon466').first()).toBeVisible();

  await root.locator('[data-ach-tab="defis"]').click();

  const claimable = root.locator('[data-ach-id="forge15"]');
  const progress = root.locator('[data-ach-id="forge20"]');
  await expect(claimable).toHaveAttribute('data-ach-state', 'claimable');
  await expect(claimable).toHaveClass(/achRowClaimable466/);
  await expect(claimable.locator('.achObjectiveProgress466 i')).toHaveAttribute('style', /width:100%/);
  await expect(progress).toHaveAttribute('data-ach-state', 'progress');
  await expect(progress.locator('.achObjectiveProgress466 i')).toHaveAttribute('style', /width:75%/);

  const geometry = await page.evaluate(() => {
    const root = document.querySelector('#overlay .srAch139');
    const body = document.querySelector('#overlay > .card > .mbody');
    const rows = [...root.querySelectorAll('.achPassRow')];
    return {
      rootOverflow: root.scrollWidth - root.clientWidth,
      bodyOverflow: body.scrollWidth - body.clientWidth,
      widestRow: rows.reduce((m, el) => Math.max(m, el.getBoundingClientRect().width), 0),
      bodyWidth: body.getBoundingClientRect().width
    };
  });
  expect(geometry.rootOverflow).toBeLessThanOrEqual(1);
  expect(geometry.bodyOverflow).toBeLessThanOrEqual(1);
  expect(geometry.widestRow).toBeLessThanOrEqual(geometry.bodyWidth + 1);
});

test('V466 shows transient claim feedback while preserving the exact existing payout', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    S.forge = S.forge || {};
    S.forge.level = 15;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = S.accomplishments.claimed || {};
    delete S.accomplishments.claimed.forge15;
    S.gold = 123;
    ACT.accomplishments();
  });
  await page.locator('#overlay .srAch139 [data-ach-tab="defis"]').click();
  await page.locator('#overlay .srAch139 [data-ach="forge15"]').click();

  await expect(page.locator('#overlay .achClaimFlash466')).toContainText('Récompense récupérée');
  await expect(page.locator('#overlay [data-ach-id="forge15"]')).toHaveAttribute('data-ach-state', 'claimed');

  const state = await page.evaluate(() => ({
    gold: S.gold,
    claimed: !!S.accomplishments.claimed.forge15
  }));
  expect(state).toEqual({ gold: 10123, claimed: true });
});

test('V466 is presentation-only: opening the modal does not change reward resources or claim flags', async ({ page }) => {
  await boot(page);
  const before = await page.evaluate(() => {
    S.gold = 777;
    S.minerai = 222;
    S.essence = 333;
    S.eclat = 444;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = { forge10: true };
    S.accomplishments.premiumClaimed = { floor25: true };
    return JSON.stringify({
      gold:S.gold,minerai:S.minerai,essence:S.essence,eclat:S.eclat,
      claimed:S.accomplishments.claimed,premiumClaimed:S.accomplishments.premiumClaimed
    });
  });
  await page.evaluate(() => ACT.accomplishments());
  await expect(page.locator('#overlay .srAch139[data-ach-visual-v466="1"]')).toBeVisible();
  const after = await page.evaluate(() => JSON.stringify({
    gold:S.gold,minerai:S.minerai,essence:S.essence,eclat:S.eclat,
    claimed:S.accomplishments.claimed,premiumClaimed:S.accomplishments.premiumClaimed
  }));
  expect(after).toBe(before);
});
