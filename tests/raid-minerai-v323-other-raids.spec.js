const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('V323 delegates non-Minerai raid rewards unchanged', async () => {
  const src = fs.readFileSync('raid-minerai-active-balance-v282.js','utf8');
  expect(src).toContain("if (type === 'minerai') return mineraiReward(level);");
  expect(src).toContain('return previousRaidReward.apply(this, arguments);');
});
