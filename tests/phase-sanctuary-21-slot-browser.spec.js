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
    const events = [];
    const boardSnapshot = label => {
      const live = S.sanctuary?.mergeBoard?.slice() || [];
      let persisted = [];
      try { persisted = JSON.parse(localStorage.getItem(SAVE_KEY)||'{}').sanctuary?.mergeBoard || []; } catch (_) {}
      events.push({ label, liveCount:live.filter(Boolean).length, live20:live[20]||null,
        persistedCount:persisted.filter(Boolean).length, persisted20:persisted[20]||null });
    };
    const oldSave = saveNow, oldRender = render;
    // Diagnostic only: identify the exact synchronous render stage that
    // changes the live board, without changing game logic or player saves.
    const stageChanges = [];
    const originalSanctuary = S.sanctuary;
    const originalBoard = S.sanctuary.mergeBoard;
    const wrapped = [];
    function inspectStage(label, original, args, context) {
      const before = JSON.stringify(S.sanctuary?.mergeBoard || []);
      let value;
      try { value = original.apply(context, args); }
      finally {
        const after = JSON.stringify(S.sanctuary?.mergeBoard || []);
        if (before !== after) stageChanges.push({
          stage: label, before: JSON.parse(before), after: JSON.parse(after),
          sameSanctuary: S.sanctuary === originalSanctuary,
          sameBoard: S.sanctuary?.mergeBoard === originalBoard
        });
      }
      return value;
    }
    for (const name of [
      'trackGoalProgress','renderHUD','renderTabs','checkRewardNotice',
      'checkBossReward','checkNotable','checkSkipNotice','checkLevelUp',
      'attachArena','sanctMergeState'
    ]) {
      const original = globalThis[name];
      if (typeof original !== 'function') continue;
      globalThis[name] = function(...args) {
        return inspectStage(name, original, args, this);
      };
      wrapped.push([name, original]);
    }
    const originalScreen = SCREENS.sanctuaire;
    SCREENS.sanctuaire = function(...args) {
      return inspectStage('SCREENS.sanctuaire', originalScreen, args, this);
    };
    saveNow = function(...args) {
      boardSnapshot('before saveNow');
      const result = oldSave.apply(this,args);
      boardSnapshot('after saveNow');
      return result;
    };
    render = function(...args) {
      boardSnapshot('before render');
      const result = oldRender.apply(this,args);
      boardSnapshot('after render');
      return result;
    };
    boardSnapshot('before move');
    let moved;
    try { moved = sanctMergeDrop(0, 20); }
    finally { saveNow = oldSave; render = oldRender; SCREENS.sanctuaire = originalScreen; for (const [name, original] of wrapped) globalThis[name] = original; }
    boardSnapshot('after move');
    const board = sanctMergeState().mergeBoard.slice();
    return { moved, capacity: board.length, count: board.filter(Boolean).length,
      destination: board[20], source: board[0], initialBoard, events,
      savedBoard: JSON.parse(localStorage.getItem(SAVE_KEY)||'{}').sanctuary?.mergeBoard || [], stageChanges,
      sameSanctuary: S.sanctuary === originalSanctuary,
      sameBoard: S.sanctuary?.mergeBoard === originalBoard };
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


test('iPhone pointer drag between adjacent paid slots 20 and 21 preserves fragment after reload', async ({page},testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone','Mobile WebKit only');
  await seedPaidBoard(page);
  // Both endpoints must be simultaneously visible. Dragging from slot 1 to
  // slot 21 on an iPhone cannot work without scrolling mid-gesture.
  await page.evaluate(() => {
    const st = sanctMergeState();
    st.mergeBoard[0] = null;
    st.mergeBoard[19] = 'COMMUN';
    if (saveNow() === false) throw Error('Initial board save refused');
    render();
  });
  await expect(page.locator('.sanctMergePiece[data-sanct-slot="19"]')).toHaveCount(1);
  await page.evaluate(() => {
    const cell = document.querySelector('.sanctMergeCell[data-sanct-slot="20"]');
    if (!cell) throw Error('Purchased slot 21 missing');
    cell.scrollIntoView({block:'center',inline:'nearest'});
  });
  const points = await page.evaluate(() => {
    const a = document.querySelector('.sanctMergePiece[data-sanct-slot="19"]')?.getBoundingClientRect();
    const b = document.querySelector('.sanctMergeCell[data-sanct-slot="20"]')?.getBoundingClientRect();
    if (!a || !b) throw Error('Adjacent paid slot endpoints missing');
    const source = {x:a.left+a.width/2,y:a.top+a.height/2};
    const target = {x:b.left+b.width/2,y:b.top+b.height/2};
    const visible = p => p.x>=0 && p.y>=0 && p.x<innerWidth && p.y<innerHeight;
    if (!visible(source) || !visible(target)) throw Error('Both drag endpoints must be visible together');
    return {source,target};
  });
  await page.evaluate(({source,target}) => {
    // Synthetic pointer events test the gesture-handler contract. A separate
    // real touchscreen tap test covers device input end-to-end.
    const dispatch = (kind,p) => {
      const el = document.elementFromPoint(p.x,p.y);
      if (!el) throw Error('Pointer outside viewport: '+kind);
      el.dispatchEvent(new PointerEvent(kind,{bubbles:true,cancelable:true,
        pointerId:71,pointerType:'touch',isPrimary:true,clientX:p.x,clientY:p.y}));
    };
    dispatch('pointerdown',source);
    for (let i=1;i<=8;i++) dispatch('pointermove',{
      x:source.x+(target.x-source.x)*i/8,
      y:source.y+(target.y-source.y)*i/8
    });
    dispatch('pointerup',target);
  },points);
  await expect.poll(()=>page.evaluate(()=>{
    const b=sanctMergeState().mergeBoard;
    return {capacity:b.length,count:b.filter(Boolean).length,from:b[19],to:b[20]};
  })).toEqual({capacity:21,count:1,from:null,to:'COMMUN'});
  await page.reload();
  await page.waitForFunction(()=>typeof sanctMergeState==='function');
  const persisted = await page.evaluate(()=>{
    const b=sanctMergeState().mergeBoard;
    return {capacity:b.length,count:b.filter(Boolean).length,from:b[19],to:b[20]};
  });
  expect(persisted).toEqual({capacity:21,count:1,from:null,to:'COMMUN'});
});
