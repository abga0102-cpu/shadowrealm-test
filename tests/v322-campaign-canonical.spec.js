const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
function src(name) { return fs.readFileSync(path.join(ROOT, name), 'utf8'); }
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
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
}

test('V322 stays inside canonical campaign owners and never duplicates V322A Familiar economy', async () => {
  expect(fs.existsSync(path.join(ROOT, 'progression-campaign-v322.js'))).toBe(false);
  const combat = src('combat-progression-authority-v285.js');
  const damage = src('enemy-damage-authority-v289.js');
  const boss = src('boss-final-authority-v288.js');
  const ach = src('accomplishments-canonical-v139.js');
  expect(combat).toContain('var CAMPAIGN_MAX=800;');
  expect(combat).toContain("{id:'normal',label:'Facile',start:1,end:100}");
  expect(combat).toContain('chaptersPerDifficulty:5');
  expect(combat).toContain('floorsPerChapter:20');
  expect(damage).toContain('maxFloor:800');
  expect(boss).toContain('damageCfg.baseDamage');
  expect(ach).toContain("['floor400',800,'Terminer Divin · 5-20'");
  expect(combat).not.toContain('PAID_FAMILIAR_COST');
  expect(damage).not.toContain('PAID_FAMILIAR_COST');
  expect(ach).not.toContain('PAID_FAMILIAR_COST');
});

test('V322 exposes exactly 8 x 5 x 20 campaign structure and local notation', async ({ page }) => {
  await openCleanGame(page);
  const state = await page.evaluate(() => ({
    max: window.__srCampaignMaxFloor,
    cfg: window.__srCombatProgressionConfigV285,
    v322: window.__srProgressionCampaignConfigV322,
    m1: window.__srCampaignMeta(1),
    m20: window.__srCampaignMeta(20),
    m21: window.__srCampaignMeta(21),
    m100: window.__srCampaignMeta(100),
    m101: window.__srCampaignMeta(101),
    m800: window.__srCampaignMeta(800),
    boss5: isBoss(5), elite4: isElite(4), boss20: isBoss(20),
    waves20: window.__srCampaignWaveCountV322(20),
  }));
  expect(state.max).toBe(800);
  expect(state.cfg.maxFloor).toBe(800);
  expect(state.cfg.chaptersPerDifficulty).toBe(5);
  expect(state.cfg.floorsPerChapter).toBe(20);
  expect(state.cfg.totalChapters).toBe(40);
  expect(state.v322.totalStages).toBe(800);
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

test('V322 stretches HP and damage while preserving former endgame anchors', async ({ page }) => {
  await openCleanGame(page);
  const r = await page.evaluate(() => ({
    hp1: window.__srV285EnemyHP(1), hp800: window.__srV285EnemyHP(800),
    boss800: window.__srV285BossHP(800),
    dmg1: window.__srV289EnemyDamage(1), dmg800: window.__srV289EnemyDamage(800),
    dmgCfg: window.__srEnemyDamageConfigV289,
  }));
  expect(r.hp1).toBe(24);
  expect(r.hp800).toBe(320000000000);
  expect(r.boss800).toBe(6000000000000);
  expect(r.dmg1).toBe(2);
  expect(r.dmg800).toBe(2300000000);
  expect(r.dmgCfg.maxFloor).toBe(800);
});

test('Early monster resistance ends at 2-9 without overtaking later stages', async ({ page }) => {
  await openCleanGame(page);
  const r = await page.evaluate(() => {
    const hpCfg = window.__srCombatProgressionConfigV285.earlyResistance;
    const dmgCfg = window.__srEnemyDamageConfigV289.earlyResistance;
    return {
      hpEndFloor: hpCfg.endFloor,
      hpEndStage: hpCfg.endStage,
      hpStartMul: hpCfg.startMul,
      hpEndMul: hpCfg.endMul,
      hpMul26: hpCfg.multiplier(26),
      hpMul29: hpCfg.multiplier(29),
      hpMul30: hpCfg.multiplier(30),
      dmgEndFloor: dmgCfg.endFloor,
      dmgEndStage: dmgCfg.endStage,
      dmgStartMul: dmgCfg.startMul,
      dmgEndMul: dmgCfg.endMul,
      dmgMul26: dmgCfg.multiplier(26),
      dmgMul29: dmgCfg.multiplier(29),
      dmgMul30: dmgCfg.multiplier(30),
      stage26: window.__srCampaignMeta(26).stageCode,
      stage29: window.__srCampaignMeta(29).stageCode,
      stage31: window.__srCampaignMeta(31).stageCode,
      hp26: window.__srV285EnemyHP(26),
      hp29: window.__srV285EnemyHP(29),
      hp30: window.__srV285EnemyHP(30),
      hp31: window.__srV285EnemyHP(31),
      dmg26: window.__srV289EnemyDamage(26),
      dmg29: window.__srV289EnemyDamage(29),
      dmg30: window.__srV289EnemyDamage(30),
      dmg31: window.__srV289EnemyDamage(31),
      baseDmg20: window.__srEnemyDamageConfigV289.baseDamage(20),
      boostedDmg20: window.__srV289EnemyDamage(20),
    };
  });
  expect(r.hpEndFloor).toBe(29);
  expect(r.hpEndStage).toBe('2-9');
  expect(r.hpStartMul).toBeCloseTo(1.08, 8);
  expect(r.hpEndMul).toBeCloseTo(1.10, 8);
  expect(r.dmgEndFloor).toBe(29);
  expect(r.dmgEndStage).toBe('2-9');
  expect(r.dmgStartMul).toBeCloseTo(1.08, 8);
  expect(r.dmgEndMul).toBeCloseTo(1.10, 8);
  expect(r.stage26).toBe('2-6');
  expect(r.stage29).toBe('2-9');
  expect(r.stage31).toBe('2-11');
  expect(r.hpMul26).toBeGreaterThan(1);
  expect(r.hpMul29).toBeCloseTo(1.10, 8);
  expect(r.hpMul30).toBe(1);
  expect(r.dmgMul26).toBeGreaterThan(1);
  expect(r.dmgMul29).toBeCloseTo(1.10, 8);
  expect(r.dmgMul30).toBe(1);
  expect(r.hp26).toBeLessThan(r.hp31);
  expect(r.hp29).toBeLessThan(r.hp30);
  expect(r.dmg26).toBeLessThan(r.dmg31);
  expect(r.dmg29).toBeLessThan(r.dmg30);
  expect(r.boostedDmg20).toBeGreaterThan(r.baseDmg20);
});

test('V322 old-save migration preserves difficulty position and completed campaign', async ({ page }) => {
  await openCleanGame(page);
  const map = await page.evaluate(() => {
    const fn = window.__srCombatProgressionConfigV285.migrateLegacyFloor;
    return [1, 25, 50, 51, 100, 351, 400].map(fn);
  });
  expect(map).toEqual([1, 49, 99, 101, 199, 701, 799]);

  const completed = await page.evaluate(() => {
    S.migrations = {};
    S.floor = 400; S.recordFloor = 400; S.checkpoint = 400;
    S.campaignComplete400 = true;
    startCampaign();
    return { floor: S.floor, record: S.recordFloor, checkpoint: S.checkpoint, done: S.campaignComplete800, migrated: S.migrations.campaign800V322 };
  });
  expect(completed.floor).toBe(800);
  expect(completed.record).toBe(800);
  expect(completed.checkpoint).toBe(800);
  expect(completed.done).toBe(true);
  expect(completed.migrated).toBe(true);
});

test('V322 preserves V321 Forge intro and V322A Familiar 50-Essence behavior', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const intro = window.__srForgeIntroCombatConfigV321;
    const familiarOwner = !!window.__srRaidSummonEconomyV291;
    const before = S.essence = 1000;
    S.eggs = [];
    ACT.summonEgg(1);
    return { intro, familiarOwner, spent: before - S.essence, eggs: S.eggs.length };
  });
  expect(result.intro.stage).toBe('1-2');
  expect(result.intro.floor).toBe(2);
  expect(result.familiarOwner).toBe(true);
  expect(result.spent).toBe(50);
  expect(result.eggs).toBeGreaterThanOrEqual(1);
});