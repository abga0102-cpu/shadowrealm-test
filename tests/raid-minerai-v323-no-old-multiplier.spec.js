const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('V323 no longer applies the old x1.60 Minerai multiplier', async () => {
  const src=fs.readFileSync('raid-minerai-active-balance-v282.js','utf8');
  expect(src).not.toContain('RAID_MUL = 1.60');
  expect(src).not.toContain('* RAID_MUL');
});
