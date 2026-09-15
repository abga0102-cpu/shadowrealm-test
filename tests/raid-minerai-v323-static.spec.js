const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('V323 Minerai authority declares the validated curve', async () => {
  const src = fs.readFileSync('raid-minerai-active-balance-v282.js', 'utf8');
  expect(src).toContain('[750, 780, 810, 840, 870, 900, 930, 960, 980, 1000]');
  expect(src).toContain('1000 + (lv - 10) * 10');
  expect(src).toContain('MINERAI_AUTONOMY_SHARE = 0.25');
});
