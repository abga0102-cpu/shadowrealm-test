const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test.describe('Accomplishments V139 bootstrap lifecycle', () => {
  test('installs synchronously without a bootstrap timer and still opens the canonical modal', async ({ page }) => {
    const source = fs.readFileSync(path.join(root, 'accomplishments-canonical-v139.js'), 'utf8');
    expect(source).toContain('install();');
    expect(source).not.toContain('setTimeout(install,0)');

    await page.goto('/?smoke=1');
    await page.waitForFunction(() => window.__srAccomplishmentsCanonicalV139 === true);

    const installed = await page.evaluate(() => {
      try { return typeof ACT !== 'undefined' && typeof ACT.accomplishments === 'function'; }
      catch (_) { return false; }
    });
    expect(installed).toBe(true);

    await page.evaluate(() => ACT.accomplishments());
    await expect(page.locator('[data-ach-canonical-v139="1"]')).toBeVisible();
  });
});
