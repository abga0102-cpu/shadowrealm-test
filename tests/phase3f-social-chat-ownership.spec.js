const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const exists = (name) => fs.existsSync(path.join(root, name));

test('Phase 3F keeps source-retired v133 absent and floating chat policy in social-v1', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  const social = source('social-v1.js');

  expect(exists('accomplishments-titles-v133.js')).toBe(false);
  expect(index).not.toContain('accomplishments-titles-v133.js');

  expect(social).toContain('Floating launcher intentionally suppressed by the social UI owner.');
  expect(social).toContain('#srChatBtn{display:none!important}');
  expect(social).toContain('function mountButton()');
  expect(social).toContain('b.id="srChatBtn"');
});

test('social-enabled runtime still mounts the launcher but keeps it hidden', async ({ page }) => {
  await page.goto('/index.html?social=1');

  await page.waitForFunction(() => typeof S !== 'undefined');
  await page.evaluate(() => { S.level = 99; });

  await expect.poll(async () => page.locator('#srChatBtn').count(), { timeout: 7000 }).toBe(1);
  await expect.poll(async () => page.locator('script[src*="social-v1.js"]').count(), { timeout: 7000 }).toBe(1);

  expect(await page.locator('#srNoFloatingChatV134').count()).toBe(0);
  expect(await page.locator('#srChatBtn').evaluate((el) => getComputedStyle(el).display)).toBe('none');
});
