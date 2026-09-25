const { test, expect } = require('@playwright/test');

test('V451 authority is loaded by the public build and exposes mastery inheritance', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__srForgeDropMasteryLevelV451);
  const state = await page.evaluate(() => ({
    build: document.querySelector('meta[name="shadowreach-build"]')?.content,
    version: window.__srForgeDropMasteryLevelV451?.version,
    rank: window.__srForgeDropMasteryLevelV451?.currentMasteryRank?.()
  }));
  expect(state.build).toBe('2026.09.25.451');
  expect(state.version).toBe(451);
  expect(Number.isFinite(state.rank)).toBeTruthy();
});