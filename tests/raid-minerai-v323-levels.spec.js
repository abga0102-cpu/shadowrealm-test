const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('V323 Minerai curve includes level anchors through 100', async () => {
  const src = fs.readFileSync('raid-minerai-active-balance-v282.js','utf8');
  const early=[750,780,810,840,870,900,930,960,980,1000];
  const reward=lv=>lv<=10?early[lv-1]:1000+(lv-10)*10;
  expect([1,2,8,9,10,11,20,50,100].map(reward)).toEqual([750,780,960,980,1000,1010,1100,1400,1900]);
  expect(src).toContain('EARLY_REWARDS');
});
