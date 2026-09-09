const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

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
}

test('Accomplishments keeps the required titles compatibility layer while retiring the v138 modal repair', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');
  const titles = fs.readFileSync(path.join(root, 'accomplishments-titles-v133.js'), 'utf8');
  const stability = fs.readFileSync(path.join(root, 'accomplishments-stability-v138.js'), 'utf8');
  const canonical = fs.readFileSync(path.join(root, 'accomplishments-canonical-v139.js'), 'utf8');

  // V133/V134 remains intentionally: the legacy smoke ratchet proves its title
  // integration behavior is still required. V138's duplicate floor repair is not.
  expect(titles).toMatch(/openModal\s*=\s*function/);
  expect(stability).not.toMatch(/openModal\s*=\s*function/);
  expect(canonical).toMatch(/openModal\s*=\s*function/);
  expect(canonical).toContain('data-ach-overview-v135');
  expect(canonical).toContain('data-ach-floors-v138');
  expect(canonical).toContain('data-ach-titles-v134');
});

test('Canonical Accomplishments renders overview, floors and titles exactly once', async ({ page }) => {
  await openCleanGame(page);
  await page.evaluate(() => {
    if (typeof ACT !== 'undefined' && ACT && typeof ACT.accomplishments === 'function') ACT.accomplishments();
  });

  await expect(page.locator('#overlay')).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('#overlay .srAch139')).toHaveCount(1);
  await expect(page.locator('#overlay [data-ach-overview-v135]')).toHaveCount(1);
  await expect(page.locator('#overlay [data-ach-floors-v138]')).toHaveCount(1);
  await expect(page.locator('#overlay [data-ach-titles-v134]')).toHaveCount(1);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
