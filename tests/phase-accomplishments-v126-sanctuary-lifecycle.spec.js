const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mergeSource = fs.readFileSync(path.join(root, 'accomplishments-merge-v126.js'), 'utf8');

async function readMergeConservation(page) {
  return page.evaluate(() => {
    const order = ['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE','LEGENDAIRE','DIVIN'];
    const pending = S.accomplishments && S.accomplishments.mergePieces || {};
    const st = S.sanctuary || {};
    const boardCount = Array.isArray(st.mergeBoard) ? st.mergeBoard.filter(Boolean).length : 0;
    const reserveCount = order.reduce((n, r) => n + Math.max(0, Number(st.mergeReserve && st.mergeReserve[r]) || 0), 0);
    return {
      pendingCommun: Math.max(0, Number(pending.COMMUN) || 0),
      pendingRare: Math.max(0, Number(pending.RARE) || 0),
      boardCount,
      reserveCount,
      total: boardCount + reserveCount,
      migratedCount: Math.max(0, Number(st.accomplishmentMergeMigratedCount) || 0),
    };
  });
}

function prepareLegacyRewardState() {
  S.accomplishments = S.accomplishments || {};
  S.accomplishments.claimed = S.accomplishments.claimed || {};
  S.accomplishments.claimed.raid100 = true;
  S.accomplishments.claimed.floor75 = true;
  S.accomplishments.raid100ValidatedV127 = false;
  S.accomplishments.floorLegacyCompensationV141Processed = false;
  S.accomplishments.floorLegacyCompensationV141Paid = [];
  S.accomplishments.mergePieces = {};

  S.sanctuary = S.sanctuary || {};
  S.sanctuary.mergeBoard = Array(16).fill(null);
  S.sanctuary.mergeReserve = {};
  S.sanctuary.accomplishmentMergeMigratedV126 = false;
  S.sanctuary.accomplishmentMergeMigratedCount = 0;
}

test.describe('Accomplishments V126 Sanctuary reserve lifecycle', () => {
  test('mounts reserve after the committed Sanctuary DOM without startup timers', async ({ page }) => {
    expect(mergeSource).toContain('queueMicrotask(mountReserve)');
    expect(mergeSource).not.toContain('setTimeout(mountReserve,0)');
    expect(mergeSource).not.toContain('setTimeout(syncAndRenderHint,50)');
    expect(mergeSource).toContain('syncAndRenderHint();');
    expect(mergeSource).toContain("var nativeMigrate=typeof window.migrate==='function'?window.migrate:null");

    await page.goto('/?smoke=1');
    await page.waitForFunction(() => window.__srAccomplishmentsMergeV126 === true && typeof render === 'function');

    await page.evaluate(() => {
      S.accomplishments = S.accomplishments || {};
      S.accomplishments.mergePieces = {};
      S.sanctuary = S.sanctuary || {};
      S.sanctuary.mergeBoard = Array(16).fill('COMMUN');
      S.sanctuary.mergeReserve = { COMMUN: 0, PEU_COMMUN: 0, RARE: 2, EPIQUE: 0, MYTHIQUE: 0, LEGENDAIRE: 0, DIVIN: 0 };
      route = 'sanctuaire';
      render();
    });

    await expect(page.locator('#srMergeReserveV126')).toHaveCount(1);
    await expect(page.locator('#srMergeReserveV126')).toContainText('Rare ×2');

    await page.evaluate(() => render());
    await expect(page.locator('#srMergeReserveV126')).toHaveCount(1);
    await expect(page.locator('#srMergeReserveV126')).toContainText('Rare ×2');
  });

  test('refills an available Sanctuary slot before render and removes an empty reserve summary', async ({ page }) => {
    await page.goto('/?smoke=1');
    await page.waitForFunction(() => window.__srAccomplishmentsMergeV126 === true && typeof render === 'function');

    const state = await page.evaluate(async () => {
      S.accomplishments = S.accomplishments || {};
      S.accomplishments.mergePieces = {};
      S.sanctuary = S.sanctuary || {};
      S.sanctuary.mergeBoard = Array(16).fill('COMMUN');
      S.sanctuary.mergeBoard[15] = null;
      S.sanctuary.mergeReserve = { COMMUN: 0, PEU_COMMUN: 0, RARE: 1, EPIQUE: 0, MYTHIQUE: 0, LEGENDAIRE: 0, DIVIN: 0 };
      route = 'sanctuaire';
      render();
      await Promise.resolve();
      return {
        lastBoard: S.sanctuary.mergeBoard[15],
        reserveRare: Number(S.sanctuary.mergeReserve.RARE) || 0,
        reserveNodes: document.querySelectorAll('#srMergeReserveV126').length,
      };
    });

    expect(state.lastBoard).toBe('RARE_I');
    expect(state.reserveRare).toBe(0);
    expect(state.reserveNodes).toBe(0);
  });

  test('conserves V127 legacy merge rewards on fresh boot without a startup timer', async ({ page }) => {
    // Smoke mode intentionally disables saveNow()/loadSave(), so use the real
    // persistence path for this reload contract while keeping the other tests isolated.
    await page.goto('/');
    await page.waitForFunction(() => window.__srAccomplishmentsMergeV126 === true && typeof saveNow === 'function');
    await page.evaluate(() => localStorage.removeItem('shadowreach.save.local'));

    await page.evaluate(prepareLegacyRewardState);
    await page.evaluate(() => saveNow());
    await page.reload();
    await page.waitForFunction(() =>
      window.__srAccomplishmentsMergeV126 === true &&
      S && S.sanctuary && Number(S.sanctuary.accomplishmentMergeMigratedCount) >= 50
    );

    const state = await readMergeConservation(page);
    expect(state.pendingCommun).toBe(0);
    expect(state.pendingRare).toBe(0);
    expect(state.total).toBe(50);
    expect(state.migratedCount).toBe(50);
  });

  test('conserves V127 legacy merge rewards through imported-save migrate ordering', async ({ page }) => {
    await page.goto('/?smoke=1');
    await page.waitForFunction(() =>
      window.__srAccomplishmentsMergeV126 === true &&
      window.__srImportSaveGuardV207 === true &&
      ACT && typeof ACT.importSave === 'function'
    );

    const raw = await page.evaluate(() => {
      const x = JSON.parse(JSON.stringify(S));
      x.accomplishments = x.accomplishments || {};
      x.accomplishments.claimed = x.accomplishments.claimed || {};
      x.accomplishments.claimed.raid100 = true;
      x.accomplishments.claimed.floor75 = true;
      x.accomplishments.raid100ValidatedV127 = false;
      x.accomplishments.floorLegacyCompensationV141Processed = false;
      x.accomplishments.floorLegacyCompensationV141Paid = [];
      x.accomplishments.mergePieces = {};
      x.sanctuary = x.sanctuary || {};
      x.sanctuary.mergeBoard = Array(16).fill(null);
      x.sanctuary.mergeReserve = {};
      x.sanctuary.accomplishmentMergeMigratedV126 = false;
      x.sanctuary.accomplishmentMergeMigratedCount = 0;
      return JSON.stringify(x);
    });

    // Exercise the production V207 import handler directly. Waiting for the
    // browser-level filechooser is unrelated to the migrate-ordering contract
    // and can be dropped by a busy Chromium runner before Playwright observes it.
    await page.evaluate(async (json) => {
      const nativeCreate = document.createElement;
      const NativeFileReader = window.FileReader;
      let finishRead;
      const readFinished = new Promise((resolve) => { finishRead = resolve; });

      document.createElement = function(tagName, options) {
        const el = nativeCreate.call(document, tagName, options);
        if (String(tagName).toLowerCase() === 'input') {
          Object.defineProperty(el, 'files', {
            configurable: true,
            value: [{ name: 'legacy-accomplishments.json', type: 'application/json' }],
          });
          el.click = function() {
            if (typeof this.onchange === 'function') this.onchange();
          };
        }
        return el;
      };
      window.FileReader = class {
        readAsText() {
          this.result = json;
          Promise.resolve().then(() => {
            try {
              if (typeof this.onload === 'function') this.onload();
            } finally {
              finishRead();
            }
          });
        }
      };

      try {
        ACT.importSave();
        await readFinished;
      } finally {
        document.createElement = nativeCreate;
        window.FileReader = NativeFileReader;
      }
    }, raw);

    await page.waitForFunction(() =>
      S && S.sanctuary &&
      Number(S.sanctuary.accomplishmentMergeMigratedCount) >= 50 &&
      S.accomplishments &&
      Number(S.accomplishments.mergePieces && S.accomplishments.mergePieces.RARE || 0) === 0
    );

    const state = await readMergeConservation(page);
    expect(state.pendingCommun).toBe(0);
    expect(state.pendingRare).toBe(0);
    expect(state.total).toBe(50);
    expect(state.migratedCount).toBe(50);
  });
});
