const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'raid-minerai-active-balance-v282.js'), 'utf8');

function runtime() {
  const ctx = {
    window: {},
    raidReward(type, level) { return type === 'minerai' ? 100 + level : 200 + level; },
    harvestEfficiency() { return 100; },
    harvestPerHour() { return { minerai: 1, eclat: 7 }; }
  };
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  return ctx;
}

test('V499 compatibility owner mirrors the final Raid Minerai curve', async () => {
  const ctx = runtime();
  expect(ctx.raidReward('minerai', 1)).toBe(1000);
  expect(ctx.raidReward('minerai', 10)).toBe(1450);
  expect(ctx.raidReward('minerai', 21)).toBe(2000);
  expect(ctx.raidReward('minerai', 41)).toBe(2500);
  expect(ctx.raidReward('minerai', 61)).toBe(2800);
  expect(ctx.raidReward('minerai', 70)).toBe(2845);
  expect(ctx.raidReward('eclat', 10)).toBe(210);
});

test('V499 compatibility autonomy uses 10% of its mirrored reward', async () => {
  const ctx = runtime();
  const out = ctx.harvestPerHour({ raids: { minerai: { level: 10 } } });
  expect(out.minerai).toBe(145);
  expect(out.eclat).toBe(7);
  expect(ctx.window.__shadowreachRaidMineraiBalance).toMatchObject({
    version: 499,
    level1: 1000,
    perLevelTo2000: 50,
    level21: 2000,
    perLevelTo2500: 25,
    level41: 2500,
    perLevelTo2800: 15,
    level61: 2800,
    perLevelAfter2800: 5,
    level70: 2845,
    autonomySharePerHour: 0.10
  });
});
