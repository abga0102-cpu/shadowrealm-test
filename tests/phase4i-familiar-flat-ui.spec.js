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

test('V309 keeps the final asynchronous Familiar renderer on flat stats with no Apple/level UI', async ({ page }) => {
  await openCleanGame(page);

  await page.waitForFunction(() => (
    window.__srFamNaturalScrollV246 === true &&
    window.__srFamiliarFlatUIV309 === true &&
    typeof SCREENS === 'object' &&
    typeof SCREENS.familiers === 'function' &&
    SCREENS.familiers.__srV309 === true
  ), null, { timeout: 12000 });

  const result = await page.evaluate(() => {
    S.stars = S.stars || {};
    S.stars.pet = 1;
    S.pets = [{
      id: 'qa-flat-pet',
      rarity: 'RARE',
      species: 'dragonnet',
      element: 'normal',
      level: 0,
      legacyLevel: 27,
      petCurveVersion: 286,
    }];
    S.activePetId = 'qa-flat-pet';
    if (typeof nav === 'function') nav('familiers');
    if (typeof render === 'function') render();

    const active = S.pets[0];
    const expected = window.__srV305PetStats(active, S);
    const screen = document.getElementById('screen');
    const statBox = screen.querySelector('.fam240HeroStats,[data-fam-flat-damage]');
    return {
      ownerV309: !!(SCREENS.familiers && SCREENS.familiers.__srV309),
      installCount: Number(window.__srFamiliarFlatUIInstallCountV309 || 0),
      appleNodes: screen.querySelectorAll('[data-arg="apples"],.fam240Res.apple').length,
      upgradeNodes: screen.querySelectorAll('[data-act="upgradePet"]').length,
      hasAppleText: /🍎|Pommes?/i.test(screen.textContent || ''),
      hasLegacyLevelText: /\bNiv\./i.test(screen.textContent || ''),
      damageAttr: statBox ? Number(statBox.getAttribute('data-fam-flat-damage')) : null,
      hpAttr: statBox ? Number(statBox.getAttribute('data-fam-flat-hp')) : null,
      statText: statBox ? statBox.textContent : '',
      expectedDamage: expected.damage,
      expectedHP: expected.hp,
      helperPositive: expected.damage > 0 && expected.hp > 0,
    };
  });

  expect(result.ownerV309).toBe(true);
  expect(result.installCount).toBeGreaterThan(0);
  expect(result.appleNodes).toBe(0);
  expect(result.upgradeNodes).toBe(0);
  expect(result.hasAppleText).toBe(false);
  expect(result.hasLegacyLevelText).toBe(false);
  expect(result.helperPositive).toBe(true);
  expect(result.damageAttr).toBe(result.expectedDamage);
  expect(result.hpAttr).toBe(result.expectedHP);
  expect(result.statText).toContain('DGT');
  expect(result.statText).toContain('PV');
  expect(result.statText).not.toContain('%');
});

test('V309 is presentation-only and preserves the V307/V308 progression contracts', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => ({
    v307: window.__srProgressionAuditV307 || null,
    v308: window.__srProgressionStateSafetyConfigV308 || null,
    v309: window.__srFamiliarFlatUIConfigV309 || null,
    appleReward: typeof megaAppleBaseReward === 'function' ? megaAppleBaseReward(999) : 0,
    petUpgradeCost: typeof petUpgradeCost === 'function' ? petUpgradeCost({}) : Infinity,
  }));

  expect(result.v307).not.toBeNull();
  expect(result.v307.ok).toBe(true);
  expect(result.v308).not.toBeNull();
  expect(result.v308.skillRatesUseExplicitStars).toBe(true);
  expect(result.v309).not.toBeNull();
  expect(result.v309.destructiveMigration).toBe(false);
  expect(result.v309.economyRebalanced).toBe(false);
  expect(result.v309.saveSchemaChanged).toBe(false);
  expect(result.appleReward).toBe(0);
  expect(result.petUpgradeCost).toBe(Infinity);
});
