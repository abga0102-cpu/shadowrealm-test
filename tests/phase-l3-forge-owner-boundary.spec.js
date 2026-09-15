const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const src = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('L3: Forge rarity rates stay in V224 and Ascension progression stays in V304', async () => {
  const v224 = src('game-balance-v224.js');
  const v304 = src('progression-stability-authority-v304.js');

  expect(v224).toContain('function forgeRatesV323(level,stars)');
  expect(v224).toContain("if(system==='forge')return forgeRatesV323(mastery,stars)");
  expect(v224).toContain('forgeRarityV323:');

  expect(v304).toContain('FORGE_ASCEND_MAX_STARS_V323=4');
  expect(v304).toContain("if(sys==='forge')");
  expect(v304).toContain('forgeRarityAscensionV323:');
  expect(v304).not.toContain('function forgeRatesV323');
});

test('L3: Familiar rate policy remains isolated from Forge progression owners', async () => {
  const v296 = src('familiar-ancestral-rate-v296.js');
  const v224 = src('game-balance-v224.js');
  const v304 = src('progression-stability-authority-v304.js');

  expect(v296).toContain("if(system!=='pet'||!out)return out");
  expect(v224).not.toContain('familiarRateOwner');
  expect(v304).not.toContain('familiarRateOwner');
});
