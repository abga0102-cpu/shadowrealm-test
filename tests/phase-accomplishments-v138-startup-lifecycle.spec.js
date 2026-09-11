const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'accomplishments-stability-v138.js'), 'utf8');

test('V138 bootstraps directly while keeping bounded BottomNav reconciliation', async ({ page }) => {
  expect(source).toContain("window.addEventListener('sr:bottomnavrendered',schedulePlace);");
  expect(source).toContain('retry=setTimeout(placeEntry,120);');
  expect(source).toMatch(/window\.addEventListener\('sr:bottomnavrendered',schedulePlace\);\s*placeEntry\(\);\s*\}\)\(\);/);
  expect(source).not.toMatch(/window\.addEventListener\('sr:bottomnavrendered',schedulePlace\);\s*schedulePlace\(\);/);

  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.evaluate(() => nav('developpement'));
  await expect(page.locator('[data-sr-accomplishments-v138]')).toBeVisible();
});
