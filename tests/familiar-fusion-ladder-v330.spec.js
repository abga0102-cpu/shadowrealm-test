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
  await page.waitForFunction(() => typeof window.__srNormalizeFamiliarLadderV295 === 'function');
  await page.evaluate(() => {
    try { if (typeof clearTutorialGuide === 'function') clearTutorialGuide(); } catch (_) {}
    const card = document.getElementById('tutorialCard');
    if (card) card.remove();
    S.tutorial = null;
  });
}

test('V330 repairs a stale Familiar ladder and keeps Commun -> Peu commun', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    PET_RARITY_ORDER.splice(
      0,
      PET_RARITY_ORDER.length,
      'COMMUN', 'RARE', 'EPIQUE', 'MYTHIQUE', 'ANCESTRAL', 'LEGENDAIRE', 'DIVIN'
    );

    const repaired = window.__srNormalizeFamiliarLadderV295();
    const order = PET_RARITY_ORDER.slice();
    const need = petFuseNeed('COMMUN');

    update((st) => {
      st.pets = Array.from({ length: need }, (_, i) => ({
        id: `v330-common-${i}`,
        rarity: 'COMMUN',
        level: 0,
        applesInvested: 0,
        species: 'dragonnet',
        element: 'normal',
        name: `Commun ${i + 1}`,
      }));
      st.activePetId = null;
    });

    const fused = fusePets('COMMUN');
    return {
      repaired,
      order,
      fusedOk: fused.ok,
      rarities: S.pets.map((p) => p.rarity),
    };
  });

  expect(result.repaired).toBe(true);
  expect(result.order).toEqual([
    'COMMUN', 'PEU_COMMUN', 'RARE', 'EPIQUE', 'MYTHIQUE', 'ANCESTRAL', 'LEGENDAIRE', 'DIVIN',
  ]);
  expect(result.fusedOk).toBe(true);
  expect(result.rarities).toEqual(['PEU_COMMUN']);
});
