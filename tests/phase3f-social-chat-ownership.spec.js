const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const executable = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

test('Phase 3F moves floating chat suppression out of Accomplishments and into social-v1', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const legacy = executable(source('accomplishments-titles-v133.js'));
  const social = source('social-v1.js');

  expect(legacy).not.toContain('srNoFloatingChatV134');
  expect(legacy).not.toContain('#srChatBtn');
  expect(legacy).not.toContain('createElement(\'style\')');
  expect(legacy).not.toContain('createElement("style")');

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
