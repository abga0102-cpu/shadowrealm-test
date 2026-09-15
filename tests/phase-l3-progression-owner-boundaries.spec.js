const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const src = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('L3: settled Forge and Familiar policies have one durable owner each', async () => {
  const v224 = src('game-balance-v224.js');
  const v296 = src('familiar-ancestral-rate-v296.js');
  const v304 = src('progression-stability-authority-v304.js');
  const v307 = src('progression-batch-qa-v307.js');

  expect(v224).toContain("if(system==='forge')return forgeRatesV323(mastery,stars)");
  expect(v224).toContain('forgeRarityV323:');
  expect(v296).toContain("if(system!=='pet'||!out)return out");
  expect(v296).toContain('rateOwner:true');
  expect(v304).not.toContain("if(system==='forge')return forgeRatesV323");
  expect(v304).toContain('FORGE_ASCEND_MAX_STARS_V323=4');
  expect(v304).toContain('powerStopsGrowingAfterStar:1');
  expect(v307).not.toContain('getRates=function(');
  expect(v307).toContain("familiarRateOwner:'V296'");
});

test('L3: progression stability stays distinct from rarity-rate ownership', async () => {
  const v304 = src('progression-stability-authority-v304.js');
  expect(v304).toContain('ascendPowerMul=function(stars,sys)');
  expect(v304).toContain('canAscend=function(s,sys)');
  expect(v304).toContain('ascensionPreview=function(s,sys)');
  expect(v304).toContain("if(typeof raidReward==='function'&&!raidReward.__srV304)");
  expect(v304).toContain('function dustChance(level)');
});
