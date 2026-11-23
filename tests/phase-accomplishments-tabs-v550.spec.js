const { test, expect } = require('@playwright/test');

test('V550 shows four separate accomplishment categories without claiming rewards', async ({ page }) => {
  await page.route('**/npm/**', route => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srAccomplishmentsCanonicalV139 === true &&
    typeof ACT !== 'undefined' && typeof ACT.accomplishments === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.evaluate(() => {
    S.forge = S.forge || {};
    S.forge.level = 15;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = { forge10: true };
    S.accomplishments.premiumClaimed = {};
    ACT.accomplishments();
  });
  const root = page.locator('#overlay .srAch139');
  const tabs = root.locator('.achTabs [data-ach-tab]');
  await expect(tabs).toHaveCount(4);
  await expect(tabs).toContainText(['Forge', 'Fusions', 'Raids', 'Étages']);
  const before = await page.evaluate(() => JSON.stringify({
    claimed: S.accomplishments.claimed,
    premiumClaimed: S.accomplishments.premiumClaimed
  }));
  const scenarios = [
    ['forge', 'forge15', 'fusion50'],
    ['fusions', 'fusion50', 'forge15'],
    ['raids', 'raid10', 'fusion50'],
    ['etages', 'floor25', 'raid10']
  ];
  for (const [tab, present, absent] of scenarios) {
    await root.locator('[data-ach-tab="' + tab + '"]').click();
    await expect(root.locator('[data-ach-tab="' + tab + '"]')).toHaveClass(/on/);
    await expect(root.locator('[data-ach-id="' + present + '"]')).toHaveCount(1);
    await expect(root.locator('[data-ach-id="' + absent + '"]')).toHaveCount(0);
    const overflow = await root.evaluate(el => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
  const after = await page.evaluate(() => JSON.stringify({
    claimed: S.accomplishments.claimed,
    premiumClaimed: S.accomplishments.premiumClaimed
  }));
  expect(after).toBe(before);
});
