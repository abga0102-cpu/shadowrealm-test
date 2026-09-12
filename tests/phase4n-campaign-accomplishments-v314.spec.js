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
    window.__srCampaign400V314 === true &&
    window.__srAccomplishmentsCanonicalV139 === true &&
    window.__srAccomplishmentsClaimV140 === true
  );
}

test('V314 Accomplishments follows the 400-floor campaign and exposes no retired Rebirth or PR milestone', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => ACT.accomplishments());
  const modal = page.locator('.srAch139');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Terminer Divin · étage 400');
  await expect(modal).toContainText('Terminer Cauchemar · étage 200');
  await expect(modal).not.toContainText(/Rebirth/i);
  await expect(modal).not.toContainText(/\bPR\b/i);
  await expect(modal.locator('[data-ach^="rb"]')).toHaveCount(0);
});

test('V314 floor 400 accomplishment pays active progression resources once and never creates PR', async ({ page }) => {
  await openCleanGame(page);

  const before = await page.evaluate(() => {
    S.recordFloor = 400;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = S.accomplishments.claimed || {};
    delete S.accomplishments.claimed.floor400;
    S.accomplishments.mergePieces = S.accomplishments.mergePieces || {};
    S.accomplishments.mergePieces.MYTHIQUE = 0;
    S.eclat = 100;
    S.essence = 200;
    S.universalKeys = 3;
    S.rebirth = S.rebirth || { pr: 0, upgrades: {}, count: 0 };
    S.rebirth.pr = 777;
    ACT.accomplishments();
    return {
      eclat: S.eclat,
      essence: S.essence,
      universal: S.universalKeys,
      pr: S.rebirth.pr,
    };
  });

  await page.locator('.srAch139 [data-ach="floor400"]').click();

  const after = await page.evaluate(() => ({
    eclat: S.eclat,
    essence: S.essence,
    universal: S.universalKeys,
    pr: S.rebirth.pr,
    claimed: !!S.accomplishments.claimed.floor400,
  }));

  expect(after).toEqual({
    eclat: before.eclat + 2500,
    essence: before.essence + 2500,
    universal: before.universal + 1,
    pr: before.pr,
    claimed: true,
  });

  await page.evaluate(() => ACT.accomplishments());
  await expect(page.locator('.srAch139 [data-ach="floor400"]')).toHaveCount(0);
  await expect(page.locator('.srAch139')).toContainText('Récupéré');
});

test('V314 progression guidance never recommends retired Rebirth after dynamic retirement authority loads', async ({ page }) => {
  await openCleanGame(page);
  await page.waitForFunction(() => window.__srRebirthRemovalAuthorityV281 === true);

  const result = await page.evaluate(() => {
    const fresh = defaultState('QA V314');
    fresh.recordFloor = 25;
    fresh.floor = 25;
    const goals = progressionGoals(fresh);
    const unlock = nextUnlockGoal(fresh);
    return {
      ids: goals.map((g) => g.id),
      text: JSON.stringify(goals),
      unlock,
    };
  });

  expect(result.ids.some((id) => /^rebirth/i.test(id))).toBe(false);
  expect(result.text).not.toMatch(/Rebirth|\bPR\b/i);
  expect(result.unlock && result.unlock.title).toBe('Méga-Boss');
});
