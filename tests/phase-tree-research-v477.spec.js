const { test, expect } = require('@playwright/test');

async function clean(page){
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srTreeResearchV477 === true &&
    window.__srTreeResearchConfigV477 &&
    typeof treeTime === 'function' &&
    typeof TREE_BY_ID === 'object'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V477 final late authority keeps the approved Palier II-IV research ladders', async ({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>({
    config:window.__srTreeResearchConfigV477,
    t2:TREE_BY_ID.n2_06.times.slice(),
    t3:TREE_BY_ID.n3_06.times.slice(),
    t4:TREE_BY_ID.n4_06.times.slice()
  }));
  expect(out.config.version).toBe(477);
  expect(out.t2).toEqual([10800,11100,11400,11700,12000]);
  expect(out.t3).toEqual([36000,36300,36600,36900,37200]);
  expect(out.t4).toEqual([259200,277200,295200,313200,331200]);
});

test('V477 popup/runtime treeTime sees the same ladders and full-tier 0/1 durations', async ({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>{
    S.tree=S.tree||{};S.tree.levels={};S.tree.active=null;S.tree.activeEnd=0;
    return {
      p2next:treeTime(S,TREE_BY_ID.n2_06,1),
      p3next:treeTime(S,TREE_BY_ID.n3_06,1),
      p4next:treeTime(S,TREE_BY_ID.n4_06,1),
      sp2:treeTime(S,TREE_BY_ID.sp_forge3,1),
      sp3:treeTime(S,TREE_BY_ID.sp_forge5,1),
      sp4:treeTime(S,TREE_BY_ID.sp_slot2,1)
    };
  });
  expect(out).toEqual({
    p2next:10800,
    p3next:36000,
    p4next:259200,
    sp2:57000,
    sp3:183000,
    sp4:1476000
  });
});
