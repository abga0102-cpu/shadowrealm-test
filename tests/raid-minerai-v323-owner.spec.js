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

test('V496 compatibility owner mirrors the final Raid Minerai curve', async () => {
  const ctx = runtime();
  expect(ctx.raidReward('minerai', 1)).toBe(500);
  expect(ctx.raidReward('minerai', 10)).toBe(950);
  expect(ctx.raidReward('minerai', 11)).toBe(1000);
  expect(ctx.raidReward('minerai', 25)).toBe(1350);
  expect(ctx.raidReward('eclat', 10)).toBe(210);
});

test('V496 compatibility autonomy uses 10% of its mirrored reward', async () => {
  const ctx = runtime();
  const out = ctx.harvestPerHour({ raids: { minerai: { level: 10 } } });
  expect(out.minerai).toBe(95);
  expect(out.eclat).toBe(7);
  expect(ctx.window.__shadowreachRaidMineraiBalance).toMatchObject({
    version: 496,
    level1: 500,
    perLevelTo1000: 50,
    level11: 1000,
    perLevelTo1500: 25,
    level31: 1500,
    perLevelAfter1500: 10,
    level70: 1890,
    autonomySharePerHour: 0.10
  });
});
