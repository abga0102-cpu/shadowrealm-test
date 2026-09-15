const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('Raid Minerai authority remains loaded by the game', async () => {
  const html = fs.readFileSync('index.html','utf8');
  expect(html).toContain('raid-minerai-active-balance-v282.js');
});
