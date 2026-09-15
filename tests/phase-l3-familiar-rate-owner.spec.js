const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const src = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('shadowreach.save.local');
      localStorage.removeItem('shadowreach.social.v1.messages');
    } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__srProgressionBatchQAV307 === true);
}

test('L3: V296 is the single durable Familiar getRates policy owner', async () => {
  const index = src('index.html');
  const v296 = src('familiar-ancestral-rate-v296.js');
  const v307 = src('progression-batch-qa-v307.js');
  expect(index.indexOf('familiar-ancestral-rate-v296.js')).toBeGreaterThan(-1);
  expect(index.indexOf('progression-batch-qa-v307.js')).toBeGreaterThan(index.indexOf('familiar-ancestral-rate-v296.js'));
  expect(v296).toContain('getRates=function(system,m,a,s)');
  expect(v296).toContain('target=Math.max(0,Number(mastery)||0)>=max?5:0');
  expect(v296).toContain('function normalizeTable(src,order)');
  expect(v296).toContain('normalizesInvalidRates:true');
  expect(v307).not.toContain('getRates=function(');
  expect(v307).not.toContain('function normalizeTable(src,order)');
  expect(v307).toContain("familiarRateOwner:'V296'");
});

test('L3: V296 preserves normalized Familiar rates and exact Ancestral policy at runtime', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const max = typeof masteryMax === 'function' ? masteryMax('pet') : 50;
    const before = getRates('pet', Math.max(0, max - 1), 0, 0);
    const atMax = getRates('pet', max, 0, 0);
    const sum = (table) => Object.keys(table || {}).reduce((n, k) => n + (Number(table[k]) || 0), 0);
    const valid = (table) => Object.keys(table || {}).every((k) => Number.isFinite(Number(table[k])) && Number(table[k]) >= 0);
    return {
      max,
      beforeAncestral: Number(before.ANCESTRAL),
      atMaxAncestral: Number(atMax.ANCESTRAL),
      beforeSum: sum(before),
      atMaxSum: sum(atMax),
      beforeValid: valid(before),
      atMaxValid: valid(atMax),
      audit: window.__srProgressionAuditV307,
      config: window.__srFamiliarAncestralRateConfigV296,
    };
  });
  expect(result.beforeAncestral).toBe(0);
  expect(result.atMaxAncestral).toBeCloseTo(5, 8);
  expect(result.beforeSum).toBeGreaterThan(0);
  expect(result.atMaxSum).toBeCloseTo(100, 8);
  expect(result.beforeValid).toBe(true);
  expect(result.atMaxValid).toBe(true);
  expect(result.audit.ancestralRateBeforeMax).toBe(0);
  expect(result.audit.ancestralRateAtMax).toBeCloseTo(5, 8);
  expect(result.audit.ok).toBe(true);
  expect(result.config).toMatchObject({ maxMasteryRate: 5, fusionStillAvailable: true, normalizesInvalidRates: true, rateOwner: true });
});

test('L3: V307 retains only its distinct hatch and generic rarity-roll guards', async () => {
  const v307 = src('progression-batch-qa-v307.js');
  expect(v307).toContain('EGG_TIMERS.ANCESTRAL=16*3600');
  expect(v307).toContain('startEgg=function(id)');
  expect(v307).toContain('rollRarity=function(rates,order)');
  expect(v307).toContain('ancestralRateBeforeMax');
  expect(v307).toContain('ancestralRateAtMax');
});
