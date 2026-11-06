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
  expect(safety).toContain('var BACKUP_SLOTS=12;');
  expect(safety).toContain('snapshot();');
  expect(safety).toContain('saveNow=safeSaveNow;');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    document.readyState === 'complete' &&
    window.__srSaveSafetyV340 &&
    window.__srStageGoldCompensationStartupSafeV340
  );
  const state = await page.evaluate(() => ({
    ready: document.readyState,
    backupSlots: window.__srSaveSafetyV340.backupSlots,
    stageSafe: window.__srStageGoldCompensationStartupSafeV340
  }));
  expect(state.ready).toBe('complete');
  expect(state.backupSlots).toBe(12);
  expect(state.stageSafe).toBe(true);
});

test('V433 safety invariants required before recovery consolidation (read-only contract)', async () => {
  const safety = fs.readFileSync(path.join(root, 'save-safety-v340.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  // Fail closed: the old V341 implementation must not replace V433 protection.
  // Source-only assertions; never read or modify a player's localStorage.
  expect(safety).toMatch(/var BACKUP_SLOTS=12;/);
  expect(safety).toContain("var BEST_KEY='shadowreach.save.best.v433';");
  expect(safety).toContain("var ANCESTRAL_KEY='shadowreach.familiar.ancestral.v433';");
  expect(safety).toContain('snapshot(activeRaw,true)');
  expect(safety).toContain('pinAncestral');
  // Match the real V433 contracts on main, not nonexistent helper names.
  expect(safety).toContain("var META_KEY='shadowreach.save.backup.meta.v433';");
  expect(safety).toContain('var MIN_INTERVAL=5*60*1000;');
  expect(safety).toContain('function stronger(candidate,best)');
  expect(safety).toContain('function pinBest(raw)');
  expect(safety).toContain('function pinAncestral(s)');
  expect(safety).toContain('if(!force&&first&&now-lastSnapshotAt()<MIN_INTERVAL)return true;');
  expect(safety).toContain('if(validRaw(activeRaw)&&!snapshot(activeRaw,true))return false;');
  expect(safety).toContain('smokeIsolated:true');
  expect(index).toContain('PAUSED_SANCTUARY');
});


test('V341 recovery must fail closed if pre-restore snapshot fails (read-only source guard)', async () => {
  const safety = fs.readFileSync(path.join(root, 'save-safety-v340.js'), 'utf8');
  // V433 restore() already refuses replacement when snapshot(activeRaw,true) fails.
  // A consolidated V341 restoreCandidate() must provide the same guarantee.
  const begin = safety.indexOf('function restoreCandidate(key)');
  const end = safety.indexOf('function esc(', begin);
  expect(begin).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(begin);
  const restoreCandidate = safety.slice(begin, end);
  expect(restoreCandidate).toMatch(/if\s*\([^)]*!snapshot\([^)]*\)\s*\)\s*return false/);
  // This test never touches real browser storage or player saves.
});
