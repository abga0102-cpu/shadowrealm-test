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

test('V500 compatibility owner mirrors the final Raid Minerai curve', async () => {
  const ctx = runtime();
  expect(ctx.raidReward('minerai', 1)).toBe(1000);
  expect(ctx.raidReward('minerai', 10)).toBe(1450);
  expect(ctx.raidReward('minerai', 21)).toBe(2000);
  expect(ctx.raidReward('minerai', 41)).toBe(2500);
  expect(ctx.raidReward('minerai', 61)).toBe(2800);
  expect(ctx.raidReward('minerai', 70)).toBe(2845);
  expect(ctx.raidReward('eclat', 10)).toBe(210);
});

test('V500 compensation credits only the V499 minus V496 difference for already-cleared levels', async () => {
  const ctx = runtime();
  const comp = ctx.window.__shadowreachRaidMineraiBalance.compensation;
  expect(comp.differenceOnly).toBe(true);
  expect(comp.forRecord(0)).toBe(0);
  expect(comp.forRecord(1)).toBe(500);
  expect(comp.forRecord(21)).toBe(11875);
  expect(comp.forRecord(41)).toBe(27700);
  expect(comp.forRecord(61)).toBe(46750);
  expect(comp.forRecord(70)).toBe(55525);

  const state = { minerai: 1234, raids: { minerai: { record: 21 } } };
  const first = comp.apply(state);
  expect(first).toMatchObject({applied:true,amount:11875,throughLevel:21});
  expect(state.minerai).toBe(13109);

  const second = comp.apply(state);
  expect(second.applied).toBe(false);
  expect(second.amount).toBe(0);
  expect(state.minerai).toBe(13109);
});

test('V500 compatibility autonomy uses 10% of its mirrored reward', async () => {
  const ctx = runtime();
  const out = ctx.harvestPerHour({ raids: { minerai: { level: 10 } } });
  expect(out.minerai).toBe(145);
  expect(out.eclat).toBe(7);
  expect(ctx.window.__shadowreachRaidMineraiBalance).toMatchObject({
    version: 500,
    curveVersion: 499,
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
