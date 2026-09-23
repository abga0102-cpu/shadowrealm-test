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

test('V429 Dust rarity table returns the scarce canonical values', async ({ page }) => {
  await openCleanGame(page);
  const values = await page.evaluate(() => {
    const cfg = window.__srDustEconomyConfigV293;
    const rarities = ['COMMUN','RARE','EPIQUE','MYTHIQUE','ARTEFACT','LEGENDAIRE','INFERNAL','IMMORTEL','DIVIN'];
    return Object.fromEntries(rarities.map((r) => [r, cfg.valueForRarity(r)]));
  });

  expect(values).toEqual({
    COMMUN: 1,
    RARE: 4,
    EPIQUE: 8,
    MYTHIQUE: 20,
    ARTEFACT: 35,
    LEGENDAIRE: 60,
    INFERNAL: 100,
    IMMORTEL: 160,
    DIVIN: 250,
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
  expect(result.missing).toBe(4);
  expect(result.dust).toBe(6004);
});

test('V350 Auto-Forge scheduler restores canonical Dust when result was not credited', async ({ page }) => {
  await openCleanGame(page);
  const result = await runOneAutoCycle(page, function () {
    return [{ rarity: 'MYTHIQUE', slot: 'gants', recycled: true, dust: 1 }];
  });

  expect(result.authority350).toBe(true);
  expect(result.dust).toBe(20);
});

test('V350 Auto-Forge never double-credits canonical Dust already paid by forgeSummon', async ({ page }) => {
  await openCleanGame(page);
  const result = await runOneAutoCycle(page, function () {
    S.poussiere += 8;
    return [{ rarity: 'EPIQUE', slot: 'gants', recycled: true, dust: 1 }];
  });

  expect(result.authority350).toBe(true);
  expect(result.dust).toBe(8);
});

test('V351 global Dust authority normalizes rarity names and never falls back unknown rarity to +1', async ({ page }) => {
  await openCleanGame(page);
  const values = await page.evaluate(() => ({
    commun: dustValue(S, { rarity: 'COMMUN' }),
    rare: dustValue(S, { rarity: 'Rare' }),
    epiqueAccent: dustValue(S, { rarity: 'ÉPIQUE' }),
    mythique: dustValue(S, { rarity: 'MYTHIQUE' }),
    artefact: dustValue(S, { rarity: 'Artefact' }),
    legendaireAccent: dustValue(S, { rarity: 'LÉGENDAIRE' }),
    infernal: dustValue(S, { rarity: 'INFERNAL' }),
    immortel: dustValue(S, { rarity: 'IMMORTEL' }),
    divin: dustValue(S, { rarity: 'DIVIN' }),
    unknown: dustValue(S, { rarity: '???' }),
  }));

  expect(values).toEqual({
    commun: 1,
    rare: 4,
    epiqueAccent: 8,
    mythique: 20,
    artefact: 35,
    legendaireAccent: 60,
    infernal: 100,
    immortel: 160,
    divin: 250,
    unknown: 0,
  });
});

test('V351 final integrity layer overrides stale +1 result payload by rarity', async ({ page }) => {
  await openCleanGame(page);
  const values = await page.evaluate(() => {
    const api = window.__srForgeDustIntegrityV351;
    return {
      loaded: !!api,
      rare: api.value({ rarity: 'RARE', recycled: true, dust: 1 }),
      epique: api.value({ rarity: 'ÉPIQUE', recycled: true, dust: 1 }),
      mythique: api.value({ rarity: 'MYTHIQUE', recycled: true, dust: 1 }),
      divin: api.value({ rarity: 'DIVIN', recycled: true, dust: 1 }),
    };
  });

  expect(values).toEqual({ loaded: true, rare: 4, epique: 8, mythique: 20, divin: 250 });
});
