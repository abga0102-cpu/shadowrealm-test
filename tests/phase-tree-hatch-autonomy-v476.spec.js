const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('shadowreach.save.local');
      localStorage.removeItem('shadowreach.social.v1.messages');
    } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof EGG_TIMERS !== 'undefined' &&
    typeof TREE_BY_ID !== 'undefined' &&
    typeof harvestRates === 'function' &&
    window.__srAutonomyYieldConfigV476
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V476 hatch timers and +120 percent Tree cap are exact for every rarity', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const rarities=['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE','ANCESTRAL','LEGENDAIRE','DIVIN'];
    const ids={
      COMMUN:['n1_23','n2_23','n3_23','n4_23'],
      PEU_COMMUN:['n1_pc','n2_pc','n3_pc','n4_pc'],
      RARE:['n1_24','n2_24','n3_24','n4_24'],
      EPIQUE:['n1_25','n2_25','n3_25','n4_25'],
      MYTHIQUE:['n1_26','n2_26','n3_26','n4_26'],
      ANCESTRAL:['n1_ha','n2_ha','n3_ha','n4_ha'],
      LEGENDAIRE:['n1_27','n2_27','n3_27','n4_27'],
      DIVIN:['n1_hd','n2_hd','n3_hd','n4_hd']
    };
    const state=JSON.parse(JSON.stringify(S));
    state.tree=state.tree||{}; state.tree.levels={};
    rarities.forEach(r=>ids[r].forEach(id=>state.tree.levels[id]=5));
    return {
      timers:Object.fromEntries(rarities.map(r=>[r,EGG_TIMERS[r]])),
      bonuses:Object.fromEntries(rarities.map(r=>[r,treeSum(state,'hatch_'+r)])),
      speeds:Object.fromEntries(rarities.map(r=>[r,hatchSpeedFor(state,r)])),
      hatchNodes:Object.fromEntries(rarities.map(r=>[r,ids[r].map(id=>({id,per:TREE_BY_ID[id].per,max:TREE_BY_ID[id].max,tierScale:TREE_BY_ID[id].tierScale}))]))
    };
  });
  expect(out.timers).toEqual({
    COMMUN:600, PEU_COMMUN:1800, RARE:7200, EPIQUE:28800,
    MYTHIQUE:86400, ANCESTRAL:172800, LEGENDAIRE:518400, DIVIN:1814400
  });
  Object.values(out.bonuses).forEach(v=>expect(v).toBeCloseTo(120,8));
  Object.values(out.speeds).forEach(v=>expect(v).toBeCloseTo(2.2,8));
  Object.values(out.hatchNodes).flat().forEach(n=>{
    expect(n.max).toBe(5);
    expect(n.tierScale).toBe(false);
  });
  expect(out.hatchNodes.DIVIN.map(n=>n.per)).toEqual([3,5,7,9]);
});

test('V476 Tree research timers and 0/1 duration equal the whole tier 0→5 duration', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => ({
    p1:TREE_BY_ID.n1_09.times,
    p2:TREE_BY_ID.n2_09.times,
    p3:TREE_BY_ID.n3_09.times,
    p4:TREE_BY_ID.n4_09.times,
    special1:TREE_BY_ID.sp_forge1.times[0],
    special2:TREE_BY_ID.sp_forge3.times[0],
    special3:TREE_BY_ID.sp_forge5.times[0],
    special4:TREE_BY_ID.sp_slot2.times[0]
  }));
  expect(out.p1).toEqual([240,480,840,1320,1920]);
  expect(out.p2).toEqual([10800,11100,11400,11700,12000]);
  expect(out.p3).toEqual([36000,36300,36600,36900,37200]);
  expect(out.p4).toEqual([259200,277200,295200,313200,331200]);
  expect(out.special1).toBe(out.p1.reduce((a,b)=>a+b,0));
  expect(out.special2).toBe(out.p2.reduce((a,b)=>a+b,0));
  expect(out.special3).toBe(out.p3.reduce((a,b)=>a+b,0));
  expect(out.special4).toBe(out.p4.reduce((a,b)=>a+b,0));
});

test('V476 Autonomy resources are independent and each reaches 20 percent per hour', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const state=JSON.parse(JSON.stringify(S));
    state.tree=state.tree||{}; state.tree.levels={};
    const refs={
      minerai:raidReward('minerai',state.raids.minerai.level),
      essence:raidReward('familier',state.raids.familier.level),
      eclat:raidReward('competence',state.raids.competence.level),
      gold:raidReward('or',state.raids.or.level)
    };
    const base=harvestRates(state);
    ['n1_am','n2_am','n3_am','n4_am'].forEach(id=>state.tree.levels[id]=5);
    const onlyMinerai=harvestRates(state);
    ['n1_07','n2_07','n3_07','n4_07','n1_ae','n2_ae','n3_ae','n4_ae','n1_as','n2_as','n3_as','n4_as'].forEach(id=>state.tree.levels[id]=5);
    const all=harvestRates(state);
    return {refs,base,onlyMinerai,all,config:window.__srAutonomyYieldConfigV476};
  });
  for (const k of ['minerai','essence','eclat','gold']) expect(out.base[k]/out.refs[k]).toBeCloseTo(.05,8);
  expect(out.onlyMinerai.minerai/out.refs.minerai).toBeCloseTo(.20,8);
  for (const k of ['essence','eclat','gold']) expect(out.onlyMinerai[k]/out.refs[k]).toBeCloseTo(.05,8);
  for (const k of ['minerai','essence','eclat','gold']) expect(out.all[k]/out.refs[k]).toBeCloseTo(.20,8);
  expect(out.config.independent).toBe(true);
});

test('V476 Global Gold reaches exactly +50 percent', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const state=JSON.parse(JSON.stringify(S));
    state.tree=state.tree||{}; state.tree.levels={};
    ['n1_06','n2_06','n3_06','n4_06'].forEach(id=>state.tree.levels[id]=5);
    return {bonus:treeSum(state,'goldAll'),mul:goldMul(state)};
  });
  expect(out.bonus).toBeCloseTo(50,8);
  expect(out.mul).toBeCloseTo(1.5,8);
});
