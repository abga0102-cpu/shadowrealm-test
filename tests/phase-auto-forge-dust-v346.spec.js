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
  await page.waitForFunction(() =>
    window.__srDustEconomyConfigV293 &&
    window.__srForgeDustIntegrityV364 &&
    window.__srAutoForgeDustV370
  );
}

test('V364 Dust uses rarity rank plus original equipment power, not rarity-only values', async ({ page }) => {
  await openCleanGame(page);
  const values = await page.evaluate(() => {
    const cfg = window.__srDustEconomyConfigV293;
    const previousTreeSum = typeof treeSum === 'function' ? treeSum : null;
    try {
      treeSum = () => 0;
      return {
        rarityOnly: cfg.valueForRarity('RARE'),
        rare100: cfg.valueForItem(S, { rarity: 'RARE', originalPower: 100, power: 100 }),
        rareUpgraded: cfg.valueForItem(S, { rarity: 'RARE', originalPower: 100, power: 9999, dustInvested: 9000 }),
        mythique100: cfg.valueForItem(S, { rarity: 'MYTHIQUE', originalPower: 100, power: 100 }),
        unknown: cfg.valueForItem(S, { rarity: '???', originalPower: 0, power: 0 }),
      };
    } finally {
      if (previousTreeSum) treeSum = previousTreeSum;
    }
  });

  expect(values.rarityOnly).toBe(0);
  expect(values.rare100).toBe(30);
  expect(values.rareUpgraded).toBe(30);
  expect(values.mythique100).toBe(40);
  expect(values.unknown).toBe(5);
});

test('V364 manual Dust authority ignores upgraded power and preserves original-value economics', async ({ page }) => {
  await openCleanGame(page);
  const values = await page.evaluate(() => {
    const previousTreeSum = typeof treeSum === 'function' ? treeSum : null;
    try {
      treeSum = () => 0;
      const base = { rarity: 'EPIQUE', originalPower: 250, power: 250 };
      const upgraded = { rarity: 'EPIQUE', originalPower: 250, power: 250000, dustInvested: 99999 };
      return {
        base: dustValue(S, base),
        upgraded: dustValue(S, upgraded),
        expected: Math.floor((3 * 5) + (250 * 0.2)),
      };
    } finally {
      if (previousTreeSum) treeSum = previousTreeSum;
    }
  });

  expect(values.base).toBe(values.expected);
  expect(values.upgraded).toBe(values.expected);
});

test('V370 Auto-Forge restores the item-based Dust delta from a stale result payload', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const previousTreeSum = typeof treeSum === 'function' ? treeSum : null;
    try {
      treeSum = () => 0;
      S.poussiere = 6000;
      const before = Number(S.poussiere) || 0;
      const payload = [{ rarity: 'MYTHIQUE', power: 100, slot: 'gants', recycled: true, dust: 1 }];
      const missing = window.__srAutoForgeDustV370.settle(payload, before, false);
      return {
        dust: Number(S.poussiere) || 0,
        missing,
        payloadDust: payload[0].dust,
        currentAuthority: window.__srAutoForgeDustV370.canonical === true,
      };
    } finally {
      if (previousTreeSum) treeSum = previousTreeSum;
    }
  });

  expect(result.currentAuthority).toBe(true);
  expect(result.payloadDust).toBe(40);
  expect(result.missing).toBe(40);
  expect(result.dust).toBe(6040);
});

test('V370 Auto-Forge never double-credits Dust already paid by Forge', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const previousTreeSum = typeof treeSum === 'function' ? treeSum : null;
    try {
      treeSum = () => 0;
      const payload = [{ rarity: 'RARE', power: 100, slot: 'gants', recycled: true, dust: 1 }];
      S.poussiere = 30;
      const missing = window.__srAutoForgeDustV370.settle(payload, 0, false);
      return { dust: Number(S.poussiere) || 0, missing, payloadDust: payload[0].dust };
    } finally {
      if (previousTreeSum) treeSum = previousTreeSum;
    }
  });

  expect(result.payloadDust).toBe(30);
  expect(result.missing).toBe(0);
  expect(result.dust).toBe(30);
});

test('V364 final Forge integrity uses the same item-based Dust value as the global authority', async ({ page }) => {
  await openCleanGame(page);
  const values = await page.evaluate(() => {
    const previousTreeSum = typeof treeSum === 'function' ? treeSum : null;
    try {
      treeSum = () => 0;
      const result = { rarity: 'INFERNAL', power: 500, recycled: true, dust: 1 };
      return {
        integrity: window.__srForgeDustIntegrityV364.value(result),
        global: dustValue(S, { rarity: 'INFERNAL', originalPower: 500, power: 500 }),
      };
    } finally {
      if (previousTreeSum) treeSum = previousTreeSum;
    }
  });

  expect(values.integrity).toBe(values.global);
  expect(values.integrity).toBe(135);
});
