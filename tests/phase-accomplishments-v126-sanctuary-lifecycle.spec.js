const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mergeSource = fs.readFileSync(path.join(root, 'accomplishments-merge-v126.js'), 'utf8');

test.describe('Accomplishments V126 Sanctuary reserve lifecycle', () => {
  test('mounts reserve after the committed Sanctuary DOM without a zero-delay timer', async ({ page }) => {
    expect(mergeSource).toContain('queueMicrotask(mountReserve)');
    expect(mergeSource).not.toContain('setTimeout(mountReserve,0)');
    expect(mergeSource).toContain('setTimeout(syncAndRenderHint,50)');

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

    // The Sanctuary renderer canonicalizes a refilled Rare tier to the board's
    // level-qualified representation before render() returns.
    expect(state.lastBoard).toBe('RARE_I');
    expect(state.reserveRare).toBe(0);
    expect(state.reserveNodes).toBe(0);
  });
});
