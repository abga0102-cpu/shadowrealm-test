const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('V323 Minerai autonomy remains 25 percent of current reward', async () => {
  const src = fs.readFileSync('raid-minerai-active-balance-v282.js','utf8');
  expect(src).toContain("raidReward('minerai', s.raids.minerai.level) * MINERAI_AUTONOMY_SHARE * eff");
  expect(src).toContain('MINERAI_AUTONOMY_SHARE = 0.25');
});
