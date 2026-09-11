const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'weekly-mega-v71.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

test('Weekly Mega panel follows canonical render lifecycle without a UI poller', async ({ page }) => {
  expect(source).toContain("window.addEventListener('sr:bottomnavrendered',inject)");
  expect(source).not.toMatch(/setInterval\s*\(\s*inject\s*,/);
  expect(source).toMatch(/setInterval\s*\(\s*grant\s*,\s*60000\s*\)/);

  await page.goto('/index.html');
  await page.waitForFunction(() => typeof S !== 'undefined' && S && typeof S === 'object');
  await page.waitForTimeout(350);

  await page.evaluate(() => {
    const screen = document.getElementById('screen');
    screen.innerHTML = '<div class="pad"><div>MÉGA BOSS</div></div>';
    window.dispatchEvent(new Event('sr:bottomnavrendered'));
  });
  await expect(page.locator('#megaWeeklyV117')).toHaveCount(1);

  await page.evaluate(() => window.dispatchEvent(new Event('sr:bottomnavrendered')));
  await expect(page.locator('#megaWeeklyV117')).toHaveCount(1);

  await page.evaluate(() => {
    const screen = document.getElementById('screen');
    screen.innerHTML = '<div class="pad"><div>ACCUEIL</div></div>';
    window.dispatchEvent(new Event('sr:bottomnavrendered'));
  });
  await expect(page.locator('#megaWeeklyV117')).toHaveCount(0);

  await page.evaluate(() => {
    const screen = document.getElementById('screen');
    screen.innerHTML = '<div class="pad"><div>MÉGA BOSS</div></div>';
    window.dispatchEvent(new Event('sr:bottomnavrendered'));
  });
  await expect(page.locator('#megaWeeklyV117')).toHaveCount(1);
});