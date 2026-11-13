/* Real Chromium/WebKit regression for V509: test the shipped browser modules
   in an isolated same-origin document, without touching player saves. */
const { test, expect } = require('@playwright/test');

const MAIN = 'shadowreach.save.local';
const BACKUP = 'shadowreach.save.backup.v340.1';
const active = JSON.stringify({
  playerName: 'Current', level: 12, floor: 99, recordFloor: 100,
  stats: {}, inventory: [], equipped: {}, raids: {}, gold: 700, exp: 3, pets: []
});
const candidate = JSON.stringify({
  playerName: 'Backup', level: 7, floor: 49, recordFloor: 50,
  stats: {}, inventory: [], equipped: {}, raids: {}, gold: 400, exp: 2, pets: []
});

async function prepare(page, withRecovery) {
  // A missing HTML document still provides an isolated localhost origin.
  // No game scripts are loaded; only the actual production safety modules below.
  await page.goto('/__shadowreach_v509_test_only__.html');
  await page.evaluate(({ MAIN, active }) => {
    localStorage.clear();
    localStorage.setItem(MAIN, active);
  }, { MAIN, active });
  await page.addScriptTag({ url: '/save-safety-v340.js' });
  if (withRecovery) await page.addScriptTag({ url: '/save-recovery-v341.js' });
  await page.evaluate(({ BACKUP, candidate }) => {
    localStorage.setItem(BACKUP, candidate);
    const original = Storage.prototype.setItem;
    window.__v509RestoreSetItem = () => { Storage.prototype.setItem = original; };
    Storage.prototype.setItem = function(key, value) {
      if (key === BACKUP) throw new DOMException('Storage full', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  }, { BACKUP, candidate });
}

test.afterEach(async ({ page }) => {
  if (!page.isClosed()) await page.evaluate(() => {
    if (window.__v509RestoreSetItem) window.__v509RestoreSetItem();
    localStorage.clear();
  }).catch(() => {});
});

test('V340 backup failure never overwrites the active save', async ({ page }) => {
  await prepare(page, false);
  const result = await page.evaluate(MAIN => ({
    restored: window.__srSaveSafetyV340.restore(1),
    saved: localStorage.getItem(MAIN)
  }), MAIN);
  expect(result.restored).toBe(false);
  expect(result.saved).toBe(active);
});

test('V341 recovery refuses to overwrite when forced backup fails', async ({ page }) => {
  await prepare(page, true);
  const dialogs = [];
  page.on('dialog', async dialog => {
    dialogs.push(dialog.type());
    await dialog.accept();
  });
  const result = await page.evaluate(({ MAIN, BACKUP }) => ({
    restored: window.__srSaveRecoveryV341.restoreCandidate(BACKUP),
    saved: localStorage.getItem(MAIN)
  }), { MAIN, BACKUP });
  expect(result.restored).toBe(false);
  expect(result.saved).toBe(active);
  expect(dialogs).toContain('confirm');
  expect(dialogs).toContain('alert');
});
