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
    const initialBoard = sanctMergeState().mergeBoard.slice();
    const moved = sanctMergeDrop(0, 20);
    const board = sanctMergeState().mergeBoard.slice();
    return { moved, capacity: board.length, count: board.filter(Boolean).length,
      destination: board[20], source: board[0], initialBoard,
      savedBoard: JSON.parse(localStorage.getItem(SAVE_KEY)||'{}').sanctuary?.mergeBoard || [] };
  });
  console.log('SANCT_MOVE_STATE', JSON.stringify(before));
  expect({moved:before.moved,capacity:before.capacity,count:before.count,destination:before.destination,source:before.source}).toEqual({ moved: true, capacity: 21, count: 1,
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


test('21-slot board preserves four rarities through chained moves and reload', async ({ page }) => {
  await seedPaidBoard(page);
  const before = await page.evaluate(() => {
    const st = sanctMergeState();
    st.mergeBoard = Array(21).fill(null);
    st.mergeBoard[0] = 'COMMUN';
    st.mergeBoard[1] = 'EPIQUE_I';
    st.mergeBoard[2] = 'MYTHIQUE_I';
    st.mergeBoard[3] = 'LEGENDAIRE_I';
    st.mergeLastPurchaseAudit = null;
    if (saveNow() === false) throw Error('Initial board save refused');
    const moves = [[0,20],[1,16],[2,17],[3,19],[20,18]];
    const outcomes = moves.map(([from,to]) => sanctMergeDrop(from,to));
    return { outcomes, board: sanctMergeState().mergeBoard.slice() };
  });
  expect(before.outcomes).toEqual([true,true,true,true,true]);
  expect(before.board.filter(Boolean)).toHaveLength(4);
  expect(before.board[16]).toBe('EPIQUE_I');
  expect(before.board[17]).toBe('MYTHIQUE_I');
  expect(before.board[18]).toBe('COMMUN');
  expect(before.board[19]).toBe('LEGENDAIRE_I');
  await page.reload();
  await page.waitForFunction(() => typeof sanctMergeState === 'function');
  const after = await page.evaluate(() => sanctMergeState().mergeBoard.slice());
  expect(after).toEqual(before.board);
});


test('iPhone pointer drag to paid slot 21 preserves fragment after reload', async ({page},testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone','Mobile WebKit only');
  await seedPaidBoard(page);
  const piece=page.locator('.sanctMergePiece[data-sanct-slot="0"]');
  const destination=page.locator('.sanctMergeCell[data-sanct-slot="20"]');
  await expect(piece).toBeVisible();
  await expect(destination).toBeVisible();
  await destination.scrollIntoViewIfNeeded();
  await piece.scrollIntoViewIfNeeded();
  const points=await page.evaluate(() => {
    const a=document.querySelector('.sanctMergePiece[data-sanct-slot="0"]').getBoundingClientRect();
    const b=document.querySelector('.sanctMergeCell[data-sanct-slot="20"]').getBoundingClientRect();
    return {a:{x:a.left+a.width/2,y:a.top+a.height/2},b:{x:b.left+b.width/2,y:b.top+b.height/2}};
  });
  await page.evaluate(({a,b}) => {
    const dispatch=(kind,p) => {
      const el=document.elementFromPoint(p.x,p.y);
      if(!el)throw Error('Pointer position is outside viewport: '+kind);
      el.dispatchEvent(new PointerEvent(kind,{bubbles:true,cancelable:true,
        pointerId:71,pointerType:'touch',isPrimary:true,clientX:p.x,clientY:p.y}));
    };
    dispatch('pointerdown',a);
    for(let i=1;i<=8;i++)dispatch('pointermove',{x:a.x+(b.x-a.x)*i/8,y:a.y+(b.y-a.y)*i/8});
    dispatch('pointerup',b);
  },points);
  await expect.poll(()=>page.evaluate(()=>{
    const b=sanctMergeState().mergeBoard;
    return {count:b.filter(Boolean).length,from:b[0],to:b[20]};
  })).toEqual({count:1,from:null,to:'COMMUN'});
  await page.reload();
  await page.waitForFunction(()=>typeof sanctMergeState==='function');
  expect(await page.evaluate(()=>sanctMergeState().mergeBoard[20])).toBe('COMMUN');
});
