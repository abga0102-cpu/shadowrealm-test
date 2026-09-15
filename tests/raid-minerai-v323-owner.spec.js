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

test('V323 Raid Minerai owns the explicit reward curve only', async () => {
  const ctx = runtime();
  expect(ctx.raidReward('minerai', 1)).toBe(750);
  expect(ctx.raidReward('minerai', 10)).toBe(1000);
  expect(ctx.raidReward('minerai', 11)).toBe(1010);
  expect(ctx.raidReward('minerai', 25)).toBe(1150);
  expect(ctx.raidReward('eclat', 10)).toBe(210);
});

test('V323 Minerai autonomy stays at 25% of the authoritative reward', async () => {
  const ctx = runtime();
  const out = ctx.harvestPerHour({ raids: { minerai: { level: 10 } } });
  expect(out.minerai).toBe(250);
  expect(out.eclat).toBe(7);
  expect(ctx.window.__shadowreachRaidMineraiBalance).toMatchObject({
    version: 323,
    level1: 750,
    level10: 1000,
    postLevel10PerLevel: 10,
    autonomySharePerHour: 0.25
  });
});
