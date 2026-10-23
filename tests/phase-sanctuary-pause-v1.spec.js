const { test, expect } = require('@playwright/test');

test.describe('Sanctuary pause: gameplay and save isolation', () => {
  test('21 paid slots and Mythique I survive rendering; drag/drop cannot mutate the board', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'One deterministic engine test is sufficient.');
    await page.goto('/?smoke=1');
    await page.waitForFunction(() => !!window.__smoke && window.__SHADOWREACH_SANCTUARY_PAUSED === true);
    const result = await page.evaluate(() => {
      const board = Array(21).fill(null);
      board[17] = 'MYTHIQUE_I';
      board[20] = 'EPIQUE_I';
      S.sanctuary = S.sanctuary || {};
      S.sanctuary.mergeBoard = board.slice();
      S.sanctuary.boardExpansions = 5;
      const before = JSON.stringify(S.sanctuary.mergeBoard);
      const moved = sanctMergeDrop(17, 18);
      render();
      return {
        paused: window.__SHADOWREACH_SANCTUARY_PAUSED,
        endgameLoaded: !!window.__srSanctuaryEndgameV130,
        mergeLoaded: !!window.__srAccomplishmentsMergeV126,
        screenAvailable: typeof SCREENS.sanctuaire === 'function',
        moved,
        sameBoard: JSON.stringify(S.sanctuary.mergeBoard) === before,
        length: S.sanctuary.mergeBoard.length,
        mythic: S.sanctuary.mergeBoard[17],
        epic: S.sanctuary.mergeBoard[20]
      };
    });
    expect(result).toMatchObject({
      paused: true, endgameLoaded: false, mergeLoaded: false,
      screenAvailable: false, moved: false, sameBoard: true,
      length: 21, mythic: 'MYTHIQUE_I', epic: 'EPIQUE_I'
    });
  });

  test('active gold and XP bonuses multiply rewards, then expire without affecting the board', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'One deterministic engine test is sufficient.');
    await page.goto('/?smoke=1');
    await page.waitForFunction(() => !!window.__smoke && window.__srSanctuaryPauseBoostsV1 === true);
    const result = await page.evaluate(() => {
      S.sanctuary = S.sanctuary || {};
      const st = S.sanctuary;
      st.mergeBoard = Array(21).fill(null);
      st.mergeBoard[20] = 'MYTHIQUE_I';
      st.boardExpansions = 5;
      st.activeBoosts = {};
      const goldBase = goldReward(50), xpBase = expReward(50);
      st.activeBoosts.gold = { pct: 50, end: Date.now() + 600000, queue: [] };
      st.activeBoosts.xp = { pct: 20, end: Date.now() + 600000, queue: [] };
      const goldBoosted = goldReward(50), xpBoosted = expReward(50);
      st.activeBoosts.gold.end = Date.now() - 1;
      st.activeBoosts.xp.end = Date.now() - 1;
      const goldExpired = goldReward(50), xpExpired = expReward(50);
      return {
        goldBase, xpBase, goldBoosted, xpBoosted, goldExpired, xpExpired,
        boardLength: st.mergeBoard.length, lastPiece: st.mergeBoard[20]
      };
    });
    expect(result.goldBase).toBeGreaterThan(0);
    expect(result.xpBase).toBeGreaterThan(0);
    expect(result.goldBoosted).toBeCloseTo(result.goldBase * 1.5, 6);
    expect(result.xpBoosted).toBeCloseTo(result.xpBase * 1.2, 6);
    expect(result.goldExpired).toBeCloseTo(result.goldBase, 6);
    expect(result.xpExpired).toBeCloseTo(result.xpBase, 6);
    expect(result.boardLength).toBe(21);
    expect(result.lastPiece).toBe('MYTHIQUE_I');
  });
});
