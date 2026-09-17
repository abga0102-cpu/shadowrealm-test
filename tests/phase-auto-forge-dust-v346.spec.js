const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
}

async function runOneAutoCycle(page, forgeImpl) {
  return page.evaluate(async ({ forgeImplSource }) => {
    try {
      if (typeof autoForgeTimer !== 'undefined' && autoForgeTimer !== null) {
        clearTimeout(autoForgeTimer);
        autoForgeTimer = null;
      }
    } catch (_) {}

    S.forge.autoForge = false;
    S.forge.autoBatch = 1;
    S.forge.level = Math.max(10, Number(S.forge.level) || 10);
    S.minerai = 9999;
    S.poussiere = 0;

    const previousForgeSummon = forgeSummon;
    forgeSummon = (0, eval)('(' + forgeImplSource + ')');
    try {
      S.forge.autoForge = true;
      scheduleAutoForge(0);
      await new Promise((resolve) => setTimeout(resolve, 140));
      return {
        dust: Number(S.poussiere) || 0,
        authority350: !!window.__srAutoForgeDustV350,
      };
    } finally {
      S.forge.autoForge = false;
      try {
        if (typeof autoForgeTimer !== 'undefined' && autoForgeTimer !== null) {
          clearTimeout(autoForgeTimer);
          autoForgeTimer = null;
        }
      } catch (_) {}
      forgeSummon = previousForgeSummon;
    }
  }, { forgeImplSource: forgeImpl.toString() });
}

test('V350 Dust rarity table returns the canonical values', async ({ page }) => {
  await openCleanGame(page);
  const values = await page.evaluate(() => {
    const cfg = window.__srDustEconomyConfigV293;
    const rarities = ['COMMUN','RARE','EPIQUE','MYTHIQUE','ARTEFACT','LEGENDAIRE','INFERNAL','IMMORTEL','DIVIN'];
    return Object.fromEntries(rarities.map((r) => [r, cfg.valueForRarity(r)]));
  });

  expect(values).toEqual({
    COMMUN: 1,
    RARE: 2,
    EPIQUE: 4,
    MYTHIQUE: 10,
    ARTEFACT: 25,
    LEGENDAIRE: 60,
    INFERNAL: 150,
    IMMORTEL: 400,
    DIVIN: 1000,
  });
});

test('V350 Auto-Forge overrides stale +1 payload with canonical rarity value', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.poussiere = 6000;
    const before = Number(S.poussiere) || 0;
    const missing = window.__srAutoForgeDustV350.settle(
      [{ rarity: 'RARE', slot: 'gants', recycled: true, dust: 1 }],
      before,
      false
    );
    return {
      dust: Number(S.poussiere) || 0,
      missing,
      canonical: window.__srAutoForgeDustV350.canonical === true,
    };
  });

  expect(result.canonical).toBe(true);
  expect(result.missing).toBe(2);
  expect(result.dust).toBe(6002);
});

test('V350 Auto-Forge scheduler restores canonical Dust when result was not credited', async ({ page }) => {
  await openCleanGame(page);
  const result = await runOneAutoCycle(page, function () {
    return [{ rarity: 'MYTHIQUE', slot: 'gants', recycled: true, dust: 1 }];
  });

  expect(result.authority350).toBe(true);
  expect(result.dust).toBe(10);
});

test('V350 Auto-Forge never double-credits canonical Dust already paid by forgeSummon', async ({ page }) => {
  await openCleanGame(page);
  const result = await runOneAutoCycle(page, function () {
    S.poussiere += 4;
    return [{ rarity: 'EPIQUE', slot: 'gants', recycled: true, dust: 1 }];
  });

  expect(result.authority350).toBe(true);
  expect(result.dust).toBe(4);
});
