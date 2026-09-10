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

test('V307 consolidated progression audit remains valid', async ({ page }) => {
  await openCleanGame(page);
  const audit = await page.evaluate(() => window.__srProgressionAuditV307 || null);
  expect(audit).not.toBeNull();
  expect(audit.ok).toBe(true);
  expect(audit.ancestralHatchSeconds).toBe(57600);
  expect(audit.ancestralRateBeforeMax).toBe(0);
  expect(audit.ancestralRateAtMax).toBeCloseTo(5, 8);
  expect(audit.raidEvolution1).toBe(100);
  expect(audit.raidEvolution50).toBe(247);
  expect(audit.raidSkill1).toBe(250);
  expect(audit.raidSkill50).toBe(740);
  expect(audit.raidPet1).toBe(250);
  expect(audit.raidPet50).toBe(740);
  expect(audit.dustChanceHigh).toBe(5);
  expect(audit.dustCost0).toBe(60);
  expect(audit.forgeStar1).toBe(2);
  expect(audit.skillStar1).toBe(1.5);
  expect(audit.petStars).toEqual([1.5, 2.1, 3]);
});

test('Skill rarity previews use the explicit stars being evaluated, not live S', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const originalStars = S.stars && S.stars.skill;
    S.stars = S.stars || {};
    try {
      S.stars.skill = 1;
      const previewZeroWhileLiveOne = getRates('skill', 50, 0, 0);
      S.stars.skill = 0;
      const previewOneWhileLiveZero = getRates('skill', 50, 0, 1);
      return {
        v308: window.__srProgressionStateSafetyV308 === true,
        zero: previewZeroWhileLiveOne,
        one: previewOneWhileLiveZero,
      };
    } finally {
      if (originalStars == null) delete S.stars.skill;
      else S.stars.skill = originalStars;
    }
  });

  expect(result.v308).toBe(true);
  expect(result.zero.LEGENDAIRE).toBe(0);
  expect(result.zero.COMMUN).toBe(27);
  expect(result.zero.ARTEFACT).toBe(7);
  expect(result.one.LEGENDAIRE).toBe(5);
  expect(result.one.COMMUN).toBe(25);
  expect(result.one.ARTEFACT).toBe(7);
  expect(Object.values(result.zero).reduce((a, b) => a + Number(b || 0), 0)).toBeCloseTo(100, 8);
  expect(Object.values(result.one).reduce((a, b) => a + Number(b || 0), 0)).toBeCloseTo(100, 8);
});

test('retired Apple and Rebirth systems remain inactive after late dynamic loaders', async ({ page }) => {
  await openCleanGame(page);
  await page.waitForTimeout(700);
  const result = await page.evaluate(() => ({
    appleAuthority: window.__srAppleRetirementV306 === true,
    appleReward: typeof megaAppleBaseReward === 'function' ? megaAppleBaseReward(999) : 0,
    petUpgradeCost: typeof petUpgradeCost === 'function' ? petUpgradeCost({}) : Infinity,
    rebirthAuthority: window.__srRebirthRemovalAuthorityV281 === true,
    canRebirth: typeof canRebirth === 'function' ? canRebirth() : false,
    rebirthUpgrades: typeof REBIRTH_UPGRADES !== 'undefined' && Array.isArray(REBIRTH_UPGRADES) ? REBIRTH_UPGRADES.length : 0,
  }));

  expect(result.appleAuthority).toBe(true);
  expect(result.appleReward).toBe(0);
  expect(result.petUpgradeCost).toBe(Infinity);
  expect(result.rebirthAuthority).toBe(true);
  expect(result.canRebirth).toBe(false);
  expect(result.rebirthUpgrades).toBe(0);
});
