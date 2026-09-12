const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'secondary-hud-selective-v279.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

test('Secondary HUD consumes canonical route and modal lifecycles without wrapping renderHUD', async ({ page }) => {
  expect(source).toContain("window.addEventListener('sr:bottomnavrendered',sync)");
  expect(source).toContain("window.addEventListener('sr:modal-state',sync)");
  expect(source).not.toMatch(/new\s+MutationObserver\s*\(/);
  expect(source).not.toMatch(/renderHUD\s*=\s*function\s*\(/);

  await page.goto('/index.html');
  await page.waitForFunction(() => window.__srSecondaryHudSelectiveV279 && document.getElementById('app') && document.getElementById('hud'));

  await page.evaluate(() => {
    route = 'accueil';
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.remove();
    window.__srSecondaryHudSelectiveV279.sync();
  });
  await expect(page.locator('#app')).not.toHaveClass(/srSecondaryContext279/);
  await expect(page.locator('#hud')).not.toHaveClass(/srSecondaryHud279/);

  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    document.getElementById('app').appendChild(overlay);
    window.dispatchEvent(new CustomEvent('sr:modal-state', { detail: { open: true } }));
  });
  await expect(page.locator('#app')).toHaveClass(/srSecondaryContext279/);
  await expect(page.locator('#hud')).toHaveClass(/srSecondaryHud279/);

  await page.evaluate(() => {
    document.getElementById('overlay').remove();
    window.dispatchEvent(new CustomEvent('sr:modal-state', { detail: { open: false } }));
  });
  await expect(page.locator('#app')).not.toHaveClass(/srSecondaryContext279/);
  await expect(page.locator('#hud')).not.toHaveClass(/srSecondaryHud279/);

  await page.evaluate(() => {
    route = 'raid';
    window.dispatchEvent(new Event('sr:bottomnavrendered'));
  });
  await expect(page.locator('#app')).toHaveClass(/srSecondaryContext279/);
  await expect(page.locator('#hud')).toHaveClass(/srSecondaryHud279/);

  await page.evaluate(() => {
    route = 'accueil';
    window.dispatchEvent(new Event('sr:bottomnavrendered'));
  });
  await expect(page.locator('#app')).not.toHaveClass(/srSecondaryContext279/);
  await expect(page.locator('#hud')).not.toHaveClass(/srSecondaryHud279/);
});
