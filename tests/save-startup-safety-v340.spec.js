const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('V340 gates per-save compensation until canonical boot and keeps backups', async ({ page }) => {
  const stage = fs.readFileSync(path.join(root, 'stage-gold-balance-v338.js'), 'utf8');
  const safety = fs.readFileSync(path.join(root, 'save-safety-v340.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(stage).toContain("document.readyState!=='complete'");
  expect(stage).toContain("window.addEventListener('load',startAfterBoot,{once:true})");
  expect(stage).toContain('window.__srStageGoldCompensationStartupSafeV340=true;');
  expect(stage).not.toContain('setTimeout(function(){applyWhenReady(0);},0);\n})();');

  const game5Pos = index.indexOf('game-5.js');
  const safetyPos = index.indexOf('save-safety-v340.js');
  expect(game5Pos).toBeGreaterThan(-1);
  expect(safetyPos).toBeGreaterThan(game5Pos);

  expect(safety).toContain("var SAVE_KEY='shadowreach.save.local';");
  expect(safety).toContain("var BACKUP_PREFIX='shadowreach.save.backup.v340.';");
  expect(safety).toContain('var BACKUP_SLOTS=5;');
  expect(safety).toContain('snapshot();');
  expect(safety).toContain('saveNow=safeSaveNow;');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srSaveSafetyV340 && window.__srStageGoldCompensationStartupSafeV340);
  const state = await page.evaluate(() => ({
    ready: document.readyState,
    backupSlots: window.__srSaveSafetyV340.backupSlots,
    stageSafe: window.__srStageGoldCompensationStartupSafeV340
  }));
  expect(state.ready).toBe('complete');
  expect(state.backupSlots).toBe(5);
  expect(state.stageSafe).toBe(true);
});
