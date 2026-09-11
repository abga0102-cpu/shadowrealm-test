const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test.describe('Accomplishments claim lifecycle', () => {
  test('V140 publishes successful claims and V126 syncs merge rewards without a click timer', async ({ page }) => {
    const claimSource = fs.readFileSync(path.join(root, 'accomplishments-claim-v140.js'), 'utf8');
    const mergeSource = fs.readFileSync(path.join(root, 'accomplishments-merge-v126.js'), 'utf8');
    expect(claimSource).toContain("new CustomEvent('sr:accomplishmentclaimed'");
    expect(mergeSource).toContain("addEventListener('sr:accomplishmentclaimed',syncAndRenderHint)");
    expect(mergeSource).not.toContain('if(b)setTimeout(syncAndRenderHint,0)');

    await page.goto('/?smoke=1');
    await page.waitForFunction(() =>
      window.__srAccomplishmentsClaimV140 === true &&
      window.__srAccomplishmentsMergeV126 === true &&
      typeof ACT !== 'undefined' &&
      typeof ACT.accomplishments === 'function'
    );

    await page.evaluate(() => {
      window.__claimLifecycleSeen = [];
      window.addEventListener('sr:accomplishmentclaimed', e => {
        window.__claimLifecycleSeen.push(e.detail && e.detail.id);
      });
      S.forge = S.forge || {};
      S.forge.level = Math.max(15, Number(S.forge.level) || 0);
      S.accomplishments = S.accomplishments || {};
      S.accomplishments.claimed = S.accomplishments.claimed || {};
      delete S.accomplishments.claimed.forge15;
      S.accomplishments.mergePieces = S.accomplishments.mergePieces || {};
      S.accomplishments.mergePieces.COMMUN = 0;
      S.sanctuary = S.sanctuary || {};
      S.sanctuary.mergeBoard = Array(16).fill(null);
      S.sanctuary.mergeReserve = {};
      ACT.accomplishments();
    });

    await page.locator('.srAch139 [data-ach="forge15"]').click();

    const state = await page.evaluate(() => ({
      events: window.__claimLifecycleSeen.slice(),
      claimed: !!S.accomplishments.claimed.forge15,
      pending: Number(S.accomplishments.mergePieces.COMMUN) || 0,
      board: (S.sanctuary.mergeBoard || []).filter(x => x === 'COMMUN').length,
      reserve: Number(S.sanctuary.mergeReserve && S.sanctuary.mergeReserve.COMMUN) || 0,
    }));

    expect(state.events).toEqual(['forge15']);
    expect(state.claimed).toBe(true);
    expect(state.pending).toBe(0);
    expect(state.board + state.reserve).toBe(15);
  });
});
