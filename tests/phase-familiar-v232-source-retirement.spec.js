const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const loader = fs.readFileSync(path.join(root, 'familiars-noscr-v231.js'), 'utf8');
const retired = path.join(root, 'familiars-noscr-pagination-v232.js');

test('retired Familiar V232 pagination stays absent while integrated V234 remains canonical', async ({ page }) => {
  expect(fs.existsSync(retired)).toBe(false);
  expect(index).not.toContain('familiars-noscr-pagination-v232.js');
  expect(loader).not.toContain('familiars-noscr-pagination-v232.js');
  expect((loader.match(/familiars-noscr-v234\.js/g) || []).length).toBe(1);

  const v234 = fs.readFileSync(path.join(root, 'familiars-noscr-v234.js'), 'utf8');
  expect(v234).toContain('pagination intégrée');
  expect(v234).toContain('data-fam-page');
  expect(v234).toContain('famNsPager');

  await page.goto('/index.html');
  await page.waitForFunction(() => document.readyState === 'complete');
  await page.waitForFunction(() => window.__srFamNoScrollV234 === true);

  const owners = await page.evaluate(() => ({
    retiredGuard: typeof window.__srFamPageV233,
    canonicalGuard: window.__srFamNoScrollV234 === true,
    retiredStyle: !!document.getElementById('famV233PaginationStyle'),
    canonicalStyle: !!document.getElementById('famNs234Style')
  }));

  expect(owners).toEqual({
    retiredGuard: 'undefined',
    canonicalGuard: true,
    retiredStyle: false,
    canonicalStyle: true
  });
});
