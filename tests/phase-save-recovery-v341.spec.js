const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('V341 recovery is owned by save safety and never auto-restores', async ({ page }) => {
  const source = fs.readFileSync(path.join(root, 'save-safety-v340.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  expect(index).toContain('shadowreach-build" content="2026.09.15.341"');
  expect(index.indexOf('save-safety-v340.js')).toBeGreaterThan(index.indexOf('game-5.js'));
  expect(index).not.toContain('save-recovery-v341.js');
  expect(source).toContain("var SAVE_KEY='shadowreach.save.local';");
  expect(source).toContain("var BACKUP_PREFIX='shadowreach.save.backup.v340.';");
  expect(source).toContain("var PREIMPORT_KEY='shadowreach.save.preimport.v207';");
  expect(source).toContain('window.__srSaveRecoveryV341=recoveryApi;');
  expect(source).toContain('if(!window.confirm(msg))return false;');
  expect(source).not.toContain('restoreCandidate(BACKUP_PREFIX');

  await page.goto('/index.html?smoke=1');
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
