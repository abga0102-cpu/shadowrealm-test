const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const src = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('L3: V296 is the single durable Familiar getRates policy owner', async () => {
  const v296 = src('familiar-ancestral-rate-v296.js');
  const v307 = src('progression-batch-qa-v307.js');
  expect(v296).toContain("getRates=function(system,m,a,s)");
  expect(v296).toContain("target=Math.max(0,Number(mastery)||0)>=max?5:0");
  expect(v296).toContain('function normalizeTable(src,order)');
  expect(v296).toContain('normalizesInvalidRates:true');
  expect(v307).not.toContain("getRates=function(system,mastery,ascension,stars)");
  expect(v307).not.toContain('function normalizeTable(src,order)');
  expect(v307).toContain("familiarRateOwner:'V296'");
});

test('L3: V307 retains only its distinct hatch and generic rarity-roll guards', async () => {
  const v307 = src('progression-batch-qa-v307.js');
  expect(v307).toContain('EGG_TIMERS.ANCESTRAL=16*3600');
  expect(v307).toContain("startEgg=function(id)");
  expect(v307).toContain("rollRarity=function(rates,order)");
  expect(v307).toContain('ancestralRateBeforeMax');
  expect(v307).toContain('ancestralRateAtMax');
});
