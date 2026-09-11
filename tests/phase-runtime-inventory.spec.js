const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const index = read('index.html');
const staticFiles = [...index.matchAll(/<script[^>]+src=["']([^"'?]+\.js)/g)].map(m => m[1]);
const core = [...index.match(/var core=\[([^\]]+)\]/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const nested = [...read('familiars-noscr-v231.js').matchAll(/load\('([^'?]+\.js)/g)].map(m => m[1]);
const expected = [...staticFiles, ...core, ...nested].sort();

test('normal runtime inventory includes transitive Familiar dependencies', async ({ page }) => {
  const inventory = read('RUNTIME_INVENTORY.md');
  expect(new Set(expected).size).toBe(expected.length);
  expect(inventory).toContain(`Default first-party runtime total: **${expected.length} JavaScript files**.`);
  for (const file of expected) expect(inventory).toContain('`' + file + '`');
  const loaded = new Set();
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === 'http://127.0.0.1:8080' && url.pathname.endsWith('.js') && response.ok()) {
      loaded.add(url.pathname.slice(1));
    }
  });
  await page.goto('/index.html?smoke=1');
  await expect.poll(() => [...loaded].sort()).toEqual(expected);
});
