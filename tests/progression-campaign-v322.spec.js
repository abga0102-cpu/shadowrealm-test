const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function src(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

test('V322 source contract keeps the 800-stage authority loaded after prior progression owners', async () => {
  const html = src('index.html');
  const code = src('progression-campaign-v322.js');

  expect(html).toContain('progression-campaign-v322.js?v=2026.09.14.322');
  expect(html.indexOf('progression-campaign-v322.js')).toBeGreaterThan(html.indexOf('familiar-flat-ui-authority-v309.js'));
  expect(code).toContain('var CAMPAIGN_MAX=800');
  expect(code).toContain("{id:'normal',label:'Facile',start:1,end:100}");
  expect(code).toContain('chaptersPerDifficulty:5');
  expect(code).toContain('stagesPerChapter:20');
  expect(code).toContain('paidFamiliarCost:50');
  expect(code).toContain('S.migrations.campaign800V322');
  expect(code).toContain('preservesFreeDoubleEgg:true');
});

test('V322 exposes 5x20 local stage notation across all 8 difficulties', async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__srProgressionCampaignV322 === true && typeof window.__srCampaignMeta === 'function');

  const state = await page.evaluate(() => ({
    max: window.__srCampaignMaxFloor,
    config: window.__srProgressionCampaignConfigV322,
    m1: window.__srCampaignMeta(1),
    m20: window.__srCampaignMeta(20),
    m21: window.__srCampaignMeta(21),
    m100: window.__srCampaignMeta(100),
    m101: window.__srCampaignMeta(101),
    m800: window.__srCampaignMeta(800),
    boss5: isBoss(5),
    elite4: isElite(4),
    boss20: isBoss(20),
    waves20: window.__srCampaignWaveCountV322(20),
  }));

  expect(state.max).toBe(800);
  expect(state.config.totalStages).toBe(800);
  expect(state.config.firstDifficultyLabel).toBe('Facile');
  expect(state.m1.stageCode).toBe('1-1');
  expect(state.m1.difficulty).toBe('Facile');
  expect(state.m20.stageCode).toBe('1-20');
  expect(state.m21.stageCode).toBe('2-1');
  expect(state.m100.stageCode).toBe('5-20');
  expect(state.m101.stageCode).toBe('1-1');
  expect(state.m101.difficulty).toBe('Difficile');
  expect(state.m800.stageCode).toBe('5-20');
  expect(state.m800.difficulty).toBe('Divin');
  expect(state.boss5).toBe(true);
  expect(state.elite4).toBe(true);
  expect(state.boss20).toBe(true);
  expect(state.waves20).toBe(1);
});

test('V322 charges exactly 50 Essence per paid Familiar summon', async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__srProgressionCampaignV322 === true && typeof ACT !== 'undefined' && ACT.summonEgg && ACT.summonEgg.__srV322 === true);

  const result = await page.evaluate(() => {
    update((s) => {
      s.essence = 1000;
      s.eggs = [];
      s.petMastery.level = Math.max(1, Number(s.petMastery.level) || 1);
    });
    const before = S.essence;
    ACT.summonEgg(1);
    return { before, after: S.essence, delta: before - S.essence, eggs: S.eggs.length };
  });

  expect(result.delta).toBe(50);
  expect(result.eggs).toBeGreaterThanOrEqual(1);
});
