const { test, expect } = require('@playwright/test');

async function seedPaidBoard(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.goto('/index.html?v=sanctuary-21-slot-regression');
  await page.waitForFunction(() => typeof sanctMergeState === 'function' &&
    typeof sanctMergeDrop === 'function' && typeof saveNow === 'function' &&
    typeof render === 'function' && typeof S === 'object');
  await page.evaluate(() => {
    S.megaBossClears = S.megaBossClears || {};
    S.megaBossClears['50'] = true;
    const st = sanctMergeState();
    st.boardExpansions = 5;
    st.mergeBoard = Array(21).fill(null);
    st.mergeBoard[0] = 'COMMUN';
    st.mergeSelected = -1;
    st.mergeLockedSlots = {};
    st.mergeLastPurchaseAudit = null;
    route = 'sanctuaire';
    render();
  });
  await expect(page.locator('.sanctMergeCell[data-sanct-slot]')).toHaveCount(21);
}

test('21 purchased Sanctuary slots retain moved fragment after save and reload', async ({ page }) => {
  await seedPaidBoard(page);
  const before = await page.evaluate(() => {
    const moved = sanctMergeDrop(0, 20);
    const board = sanctMergeState().mergeBoard.slice();
    return { moved, capacity: board.length, count: board.filter(Boolean).length,
      destination: board[20], source: board[0] };
  });
  expect(before).toEqual({ moved: true, capacity: 21, count: 1,
    destination: 'COMMUN', source: null });
  await page.reload();
  await page.waitForFunction(() => typeof sanctMergeState === 'function');
  const after = await page.evaluate(() => {
    const board = sanctMergeState().mergeBoard;
    return { capacity: board.length, count: board.filter(Boolean).length,
      destination: board[20], source: board[0] };
  });
  expect(after).toEqual({ capacity: 21, count: 1, destination: 'COMMUN', source: null });
});

test('iPhone touch: select fragment then tap paid empty slot 21 without losing it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone', 'Requires real mobile touch events.');
  await seedPaidBoard(page);
  await page.locator('.sanctMergePiece[data-sanct-slot="0"]').tap();
  await page.locator('.sanctMergeEmpty[data-sanct-slot="20"]').tap();
  await expect.poll(() => page.evaluate(() => {
    const board = sanctMergeState().mergeBoard;
    return { capacity: board.length, count: board.filter(Boolean).length,
      source: board[0], destination: board[20] };
  })).toEqual({ capacity: 21, count: 1, source: null, destination: 'COMMUN' });
});
