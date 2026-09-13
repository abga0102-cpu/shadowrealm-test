const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const index = read('index.html');
const v82 = read('personal-tree-radial-v82.js');

test('retired Tree V83 stays absent while V82 retains its migrated compatibility ownership', async ({ page }) => {
  expect(fs.existsSync(path.join(root, 'tree-safety-v83.js'))).toBe(false);
  expect(index).not.toContain('src="tree-safety-v83.js');
  expect(index).toContain('src="personal-tree-radial-v82.js');
  expect(index).toContain('src="raid-pe-authority-v290.js');

  expect(v82).toContain('function restoreMasteryProgress()');
  expect(v82).toContain('window.__srTreeAudit = function()');

  const requested = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.pathname.endsWith('.js')) requested.push(url.pathname.slice(1));
  });

  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  await page.waitForFunction(() => (
    typeof window.__srTreeAudit === 'function' &&
    typeof window.raidReward === 'function'
  ), null, { timeout: 15000 });

  expect(requested).not.toContain('tree-safety-v83.js');
  expect(requested).toContain('personal-tree-radial-v82.js');
  expect(requested).toContain('raid-pe-authority-v290.js');

  const audit = await page.evaluate(() => window.__srTreeAudit());
  expect(audit.ok).toBe(true);
  expect(audit.issues).toEqual([]);
  expect(audit.peEvolution).toEqual([100, 103]);
});
