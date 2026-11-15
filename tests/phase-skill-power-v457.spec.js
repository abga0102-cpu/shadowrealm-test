const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function openGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srSkillOverhaulConfigV284 &&
    window.__srSkillOverhaulConfigV284.revision === 457 &&
    typeof skillDupesNeeded === 'function' &&
    typeof skillEquipPowerPreview === 'function' &&
    typeof equipSkill === 'function' &&
    typeof showSkillSlotPicker === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V457 skill levels gain 20 percent power and duplicate requirements cap at 6', async ({ page }) => {
  await openGame(page);
  const data = await page.evaluate(() => {
    const cfg = window.__srSkillOverhaulConfigV284;
    const def = SKILL_BY_ID.taillade;
    const ratios = {
      intrinsic: window.__srV284SkillDamage(def, 2) / window.__srV284SkillDamage(def, 1),
      combat: skillDamageMult(1000, 2) / skillDamageMult(1000, 1),
    };
    return {
      growth: cfg.levelGrowthPct,
      maxDupes: cfg.maxDupes,
      curve: [1,2,3,4,5,6,7,12,50].map(skillDupesNeeded),
      ratios,
    };
  });

  expect(data.growth).toBe(20);
  expect(data.maxDupes).toBe(6);
  expect(data.curve).toEqual([1,2,3,4,5,6,6,6,6]);
  expect(data.ratios.intrinsic).toBeCloseTo(1.20, 2);
  expect(data.ratios.combat).toBeCloseTo(1.20, 8);
});

test('V457 converts already-earned old duplicate progress without losing duplicates', async ({ page }) => {
  await openGame(page);
  const data = await page.evaluate(() => {
    const state = defaultState('Migration V457');
    state.skills.taillade = { level: 4, count: 7 };
    state.skills.frappe = { level: 8, count: 5 };
    const result = window.__srSkillOverhaulConfigV284.normalizeDupes(state);
    return {
      result,
      taillade: state.skills.taillade,
      frappe: state.skills.frappe,
      version: state.skillDupeCurveVersion,
      rerun: window.__srSkillOverhaulConfigV284.normalizeDupes(state),
    };
  });

  // level 4 needs 4 duplicates -> level 5 with 3 left.
  expect(data.taillade).toEqual({ level: 5, count: 3 });
  // level 8 needs the capped 6, so 5/6 remains untouched.
  expect(data.frappe).toEqual({ level: 8, count: 5 });
  expect(data.result).toEqual({ changed: true, levelUps: 1 });
  expect(data.version).toBe(457);
  expect(data.rerun).toEqual({ changed: false, levelUps: 0 });
});

test('V457 removing an equipped skill previews and reports the real Power loss', async ({ page }) => {
  await openGame(page);
  const data = await page.evaluate(() => {
    S.skills = {
      taillade: { level: 8, count: 0 },
      frappe: { level: 1, count: 0 },
    };
    S.skillSlots = ['taillade', null, null, null, null];
    S.power = computePower(S);
    D = computeDerived(S);

    const preview = skillEquipPowerPreview(0, null);
    const result = equipSkill(0, null);
    return { preview, result, power: S.power, slots: S.skillSlots.slice() };
  });

  expect(data.preview.delta).toBeLessThan(0);
  expect(data.result.delta).toBe(data.preview.delta);
  expect(data.result.after).toBe(data.preview.after);
  expect(data.power).toBe(data.preview.after);
  expect(data.slots[0]).toBeNull();

  await expect(page.locator('#powerDelta')).toContainText('Puissance');
  await expect(page.locator('#powerDelta')).toContainText('-');
});

test('V457 replacement picker shows before-after Power and actual replacement matches preview', async ({ page }) => {
  await openGame(page);
  const setup = await page.evaluate(() => {
    S.skills = {
      taillade: { level: 1, count: 0 },
      frappe: { level: 10, count: 0 },
    };
    S.skillSlots = ['taillade', null, null, null, null];
    S.power = computePower(S);
    D = computeDerived(S);
    const preview = skillEquipPowerPreview(0, 'frappe');
    showSkillSlotPicker(0);
    return { preview, before: S.power };
  });

  expect(setup.preview.delta).toBeGreaterThan(0);
  await expect(page.locator('#overlay')).toContainText('Puissance');
  await expect(page.locator('#overlay')).toContainText('Frappe Sombre');

  const actual = await page.evaluate(() => equipSkill(0, 'frappe'));
  expect(actual.after).toBe(setup.preview.after);
  expect(actual.delta).toBe(setup.preview.delta);
  expect(actual.replaced).toBe(true);
});

test('V457 keeps later Campaign bands untouched while changing only Facile 1-2 through 5-4', async ({ page }) => {
  await openGame(page);
  const cfg = await page.evaluate(() => {
    const c = window.__srCampaignEarlyRebalanceConfigV449;
    return {
      version: c.version,
      first: c.multipliers(2),
      firstEnd: c.multipliers(84),
      second: c.multipliers(85),
      secondEnd: c.multipliers(99),
      after: c.multipliers(100),
      raidsChanged: c.raidsChanged,
      megaBossChanged: c.megaBossChanged,
    };
  });
  expect(cfg.version).toBe(457);
  expect(cfg.first).toEqual({ hp: 0.60, dmg: 1.60, band: 1 });
  expect(cfg.firstEnd).toEqual({ hp: 0.60, dmg: 1.60, band: 1 });
  expect(cfg.second).toEqual({ hp: 0.70, dmg: 1.00, band: 2 });
  expect(cfg.secondEnd).toEqual({ hp: 0.70, dmg: 1.00, band: 2 });
  expect(cfg.after).toEqual({ hp: 1, dmg: 1, band: 0 });
  expect(cfg.raidsChanged).toBe(false);
  expect(cfg.megaBossChanged).toBe(false);
});

test('V457 source keeps the power transition UI explicit', async () => {
  const game4 = fs.readFileSync('game-4.js', 'utf8');
  const game5 = fs.readFileSync('game-5.js', 'utf8');
  expect(game4).toContain('Retrait · ');
  expect(game4).toContain('La puissance après remplacement est affichée pour chaque choix.');
  expect(game5).toContain('function skillPowerTransitionText');
  expect(game5).toContain('Compétence remplacée');
  expect(game5).toContain('+20 % puissance par niveau');
});
