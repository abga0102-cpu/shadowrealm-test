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
    typeof ACT !== 'undefined' &&
    typeof ACT.accomplishments === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V481 visibly restacks floor accomplishments into mobile cards', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    S.recordFloor = 100;
    S.bossClears = S.bossClears || {};
    S.bossClears['45'] = true;
    S.bossClears['100'] = true;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = {};
    S.accomplishments.premiumClaimed = {};
    ACT.accomplishments();
  });

  const root = page.locator('#overlay .srAch139');
  await expect(root).toHaveAttribute('data-ach-visual-v481','1');
  await expect(root.locator('.srPassRibbon481')).toContainText('TABLEAU DES EXPLOITS');
  await expect(root.locator('.achPassTitle')).toContainText('Accomplissements');

  const first = root.locator('.srPassFloor331').first();
  await expect(first).toHaveClass(/achRowClaimable466/);
  await expect(first.locator('.srAchStatus481')).toContainText('À réclamer');
  await expect(first.locator('.srRewardLane481')).toHaveCount(2);
  await expect(first.locator('.srStageProgress481')).toHaveCount(1);

  const geometry = await first.evaluate(row => {
    const obj = row.querySelector('.achObjective').getBoundingClientRect();
    const rewards = [...row.querySelectorAll('.achReward')].map(el => el.getBoundingClientRect());
    const rr = row.getBoundingClientRect();
    return {
      rowWidth: rr.width,
      objectiveWidth: obj.width,
      objectiveBottom: obj.bottom,
      rewardTops: rewards.map(r => r.top),
      rewardWidths: rewards.map(r => r.width)
    };
  });
  expect(geometry.objectiveWidth).toBeGreaterThan(geometry.rowWidth * 0.9);
  expect(Math.min(...geometry.rewardTops)).toBeGreaterThanOrEqual(geometry.objectiveBottom - 1);
  expect(Math.abs(geometry.rewardWidths[0] - geometry.rewardWidths[1])).toBeLessThanOrEqual(2);

  const overflow = await root.evaluate(el => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('V481 gives challenge rows obvious status and reward lanes without changing claims', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    S.forge = S.forge || {};
    S.forge.level = 15;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = { forge10: true };
    S.accomplishments.premiumClaimed = {};
    ACT.accomplishments();
  });

  await page.locator('#overlay [data-ach-tab="defis"]').click();
  const row = page.locator('#overlay [data-ach-id="forge15"]');
  await expect(row).toHaveAttribute('data-ach-state','claimable');
  await expect(row.locator('.srAchStatus481')).toContainText('À réclamer');
  await expect(row.locator('.srRewardLane481').nth(0)).toContainText('Gratuit');
  await expect(row.locator('.srRewardLane481').nth(1)).toContainText('Premium');
  await expect(row.locator('.achObjectiveProgress466 i')).toHaveAttribute('style', /width:100%/);

  const claimed = page.locator('#overlay [data-ach-id="forge10"]');
  await expect(claimed.locator('.srAchStatus481')).toContainText('Récupéré');

  const before = await page.evaluate(() => ({
    gold:S.gold,
    forge15:!!S.accomplishments.claimed.forge15
  }));
  expect(before.forge15).toBe(false);
});
