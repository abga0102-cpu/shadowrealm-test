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

test('V471 compatibility owner mirrors the final Raid Minerai curve', async () => {
  const ctx = runtime();
  expect(ctx.raidReward('minerai', 1)).toBe(500);
  expect(ctx.raidReward('minerai', 10)).toBe(725);
  expect(ctx.raidReward('minerai', 11)).toBe(735);
  expect(ctx.raidReward('minerai', 25)).toBe(875);
  expect(ctx.raidReward('eclat', 10)).toBe(210);
});

test('V471 compatibility autonomy stays at 25% of its mirrored reward', async () => {
  const ctx = runtime();
  const out = ctx.harvestPerHour({ raids: { minerai: { level: 10 } } });
  expect(out.minerai).toBe(181.25);
  expect(out.eclat).toBe(7);
  expect(ctx.window.__shadowreachRaidMineraiBalance).toMatchObject({
    version: 471,
    level1: 500,
    perLevelTo10: 25,
    level10: 725,
    perLevelTo50: 10,
    level50: 1125,
    perLevelAfter50: 5,
    level70: 1225,
    autonomySharePerHour: 0.25
  });
});
