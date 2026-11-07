const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('V341 recovery is owned by save safety and never auto-restores', async ({ page }) => {
  const source = fs.readFileSync(path.join(root, 'save-safety-v340.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(index).toMatch(/name="shadowreach-build"\s+content="[^"]+"/);
  expect(index.indexOf('save-safety-v340.js')).toBeGreaterThan(index.indexOf('game-5.js'));
  expect(index).not.toContain('save-recovery-v341.js');
  expect(source).toContain("var SAVE_KEY='shadowreach.save.local';");
  expect(source).toContain("var BACKUP_PREFIX='shadowreach.save.backup.v340.';");
  expect(source).toContain("var PREIMPORT_KEY='shadowreach.save.preimport.v207';");
  expect(source).toContain('window.__srSaveRecoveryV341={');
  expect(source).toContain('var BACKUP_SLOTS=12;');
  expect(source).toContain('pinAncestral(candidate);');
  expect(source).toContain('snapshot(active.raw,true)');
  expect(source).toContain('if(!window.confirm(msg))return false;');
  expect(source).not.toContain('restoreCandidate(BACKUP_PREFIX');

  // Recovery is deliberately disabled in smoke mode; use an isolated normal browser context.
  await page.goto('/index.html');
  await page.waitForFunction(() =>
    window.__srSaveSafetyV340 &&
    window.__srSaveRecoveryV341 &&
    document.readyState === 'complete'
  );

  const result = await page.evaluate(() => {
    const mainKey = 'shadowreach.save.local';
    const backupKey = 'shadowreach.save.backup.v340.1';
    const active = {
      version: 1, playerName: 'Actuel', level: 2, exp: 0, gold: 120,
      recordFloor: 3, floor: 3, power: 100,
      stats: {}, inventory: [], equipped: {}, raids: {}, pets: [], skills: [], lastSeen: 1000
    };
    const oldAdvanced = {
      version: 1, playerName: 'Ancien', level: 18, exp: 10, gold: 9000,
      recordFloor: 64, floor: 62, power: 12000,
      stats: {}, inventory: [{ id: 1 }], equipped: {}, raids: {}, pets: [{ id: 1 }], skills: [], lastSeen: 900
    };
    localStorage.setItem(mainKey, JSON.stringify(active));
    localStorage.setItem(backupKey, JSON.stringify(oldAdvanced));

    const list = window.__srSaveSafetyV340.scan();
    const current = list.find((x) => x.key === mainKey);
    const backup = list.find((x) => x.key === backupKey);
    const mainBefore = localStorage.getItem(mainKey);
    const ahead = window.__srSaveRecoveryV341.aheadOf(backup, current);
    const mainAfter = localStorage.getItem(mainKey);

    localStorage.removeItem(mainKey);
    localStorage.removeItem(backupKey);
    return {
      ahead,
      currentFloor: current && current.recordFloor,
      backupFloor: backup && backup.recordFloor,
      unchanged: mainBefore === mainAfter
    };
  });

  expect(result).toEqual({ ahead: true, currentFloor: 3, backupFloor: 64, unchanged: true });
});


test('smoke mode must not expose save restoration APIs', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForLoadState('load');
  const state = await page.evaluate(() => ({
    safety: Boolean(window.__srSaveSafetyV340),
    recovery: Boolean(window.__srSaveRecoveryV341)
  }));
  expect(state).toEqual({ safety: true, recovery: false });
});

test('both restore paths preserve active save when backup storage fails', () => {
  const vm = require('node:vm');
  const source = fs.readFileSync(path.join(root, 'save-safety-v340.js'), 'utf8');
  const key = 'shadowreach.save.local';
  const backup = 'shadowreach.save.backup.v340.1';
  const makeSave = (name, floor) => JSON.stringify({
    playerName: name, level: floor, exp: 0, gold: 10, recordFloor: floor,
    floor, power: floor * 10, stats: {}, inventory: [], equipped: {}, raids: {}
  });
  const original = makeSave('Actuel', 20);
  const candidate = makeSave('Ancien', 10);
  const entries = new Map();
  let reloads = 0;
  const localStorage = {
    get length() { return entries.size; },
    key(i) { return Array.from(entries.keys())[i] || null; },
    getItem(k) { return entries.has(k) ? entries.get(k) : null; },
    setItem(k, v) {
      if (k.startsWith('shadowreach.save.backup.v340.')) throw Error('quota exceeded');
      entries.set(k, String(v));
    },
    removeItem(k) { entries.delete(k); }
  };
  const window = { confirm: () => true, addEventListener: () => {} };
  const context = {
    window, localStorage, document: { readyState: 'loading', addEventListener: () => {} },
    location: { reload: () => { reloads++; } }, console, setTimeout: () => {},
    SMOKE: false
  };
  vm.runInNewContext(source, context);
  entries.set(key, original);
  entries.set(backup, candidate);
  expect(window.__srSaveSafetyV340.restore(1)).toBe(false);
  expect(entries.get(key)).toBe(original);
  expect(window.__srSaveRecoveryV341.restoreCandidate(backup)).toBe(false);
  expect(entries.get(key)).toBe(original);
  expect(reloads).toBe(0);
});
