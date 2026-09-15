const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test.describe('Progression Pass V331 visual authority', () => {
  test('is presentation-only and loads after canonical pass owners', async ({ page }) => {
    const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const source = fs.readFileSync(path.join(root, 'accomplishments-visual-v331.js'), 'utf8');
    const canonicalPos = index.indexOf('accomplishments-canonical-v139.js');
    const claimPos = index.indexOf('accomplishments-claim-v140.js');
    const visualPos = index.indexOf('accomplishments-visual-v331.js');
    expect(canonicalPos).toBeGreaterThan(-1);
    expect(claimPos).toBeGreaterThan(canonicalPos);
    expect(visualPos).toBeGreaterThan(claimPos);
    expect(source).toContain('__srAccomplishmentsVisualV331');
    expect(source).toContain('#srAchArenaLauncher138');
    expect(source).toContain('.achPassRow');
    expect(source).toContain('.achReward.premium');
    expect(source).not.toContain('ACT.accomplishments=');
    expect(source).not.toContain('openModal=');
    expect(source).not.toContain('MutationObserver');

    await page.goto('/index.html?smoke=1');
    await page.waitForFunction(() => window.__srAccomplishmentsVisualV331 === true);
    await page.evaluate(() => ACT.accomplishments());
    const pass = page.locator('.srAch139');
    await expect(pass).toBeVisible();
    await expect(page.locator('#srAccomplishmentsVisualV331Style')).toHaveCount(1);
    await expect(pass.locator('.achPassHero')).toBeVisible();
    await expect(pass.locator('.achReward.premium').first()).toBeVisible();
  });
});
