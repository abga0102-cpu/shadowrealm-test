const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test.describe('Progression Pass V331 visual presentation', () => {
  test('stays in the existing stability owner and decorates the live pass', async ({ page }) => {
    const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const source = fs.readFileSync(path.join(root, 'accomplishments-stability-v138.js'), 'utf8');
    expect(index).toContain('accomplishments-stability-v138.js?v=2026.09.15.331');
    expect(index).not.toContain('accomplishments-visual-v331.js');
    expect(source).toContain('srPassOverlay331');
    expect(source).toContain('srPassFloor331');
    expect(source).toContain('srRewardVisual331');
    expect(source).toContain('srPassFooter331');
    expect(source).toContain('srAchLaunchTrack');
    expect(source).not.toContain('ACT.accomplishments=');
    expect(source).not.toContain('openModal=');
    expect(source).not.toContain('MutationObserver');

    await page.goto('/index.html?smoke=1');
    await page.waitForFunction(() => window.__srAccomplishmentsStabilityV138 === true);
    await page.evaluate(() => ACT.accomplishments());
    const pass = page.locator('.srAch139');
    await expect(pass).toBeVisible();
    await expect(page.locator('#overlay')).toHaveClass(/srPassOverlay331/);
    await expect(pass.locator('.srPassCrown331')).toHaveCount(1);
    await expect(pass.locator('.srPassClose331')).toHaveCount(1);
    await expect(pass.locator('.srPassFloor331').first()).toBeVisible();
    await expect(pass.locator('.srRewardVisual331').first()).toBeVisible();
    await expect(pass.locator('.srPassFooter331')).toHaveCount(1);
  });
});
