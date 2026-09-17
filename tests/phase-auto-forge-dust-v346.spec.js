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
      await new Promise((resolve) => setTimeout(resolve, 80));
      return {
        dust: Number(S.poussiere) || 0,
        authority: !!window.__srAutoForgeDustV346,
        version: window.__srAutoForgeDustV346 && window.__srAutoForgeDustV346.version,
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

test('V346 Auto-Forge scheduler restores Dust when a recycled result was not credited', async ({ page }) => {
  await openCleanGame(page);
  const result = await runOneAutoCycle(page, function () {
    return [{ rarity: 'RARE', slot: 'gants', recycled: true, dust: 2 }];
  });

  expect(result.authority).toBe(true);
  expect(result.version).toBe(346);
  expect(result.dust).toBe(2);
});

test('V346 Auto-Forge scheduler never double-credits Dust already paid by forgeSummon', async ({ page }) => {
  await openCleanGame(page);
  const result = await runOneAutoCycle(page, function () {
    S.poussiere += 2;
    return [{ rarity: 'RARE', slot: 'gants', recycled: true, dust: 2 }];
  });

  expect(result.authority).toBe(true);
  expect(result.dust).toBe(2);
});
