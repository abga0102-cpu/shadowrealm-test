const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('Raid Minerai runtime gets a V323 cache key', async () => {
  const html = fs.readFileSync('index.html','utf8');
  expect(html).toContain('raid-minerai-active-balance-v282.js?v=2026.09.15.323');
});
