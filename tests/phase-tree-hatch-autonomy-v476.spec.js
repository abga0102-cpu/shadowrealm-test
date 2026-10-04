const { test, expect } = require('@playwright/test');

async function clean(page){
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srAutonomyYieldConfigV476 &&
    typeof hatchSpeedFor === 'function' &&
    typeof treeTime === 'function' &&
    typeof goldMul === 'function' &&
    window.__srTreeResearchV477 === true
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V476 hatch timers and Tree speed cap match the approved curve', async ({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>{
    const expected=['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE','ANCESTRAL','LEGENDAIRE','DIVIN'];
    S.tree=S.tree||{};S.tree.levels=S.tree.levels||{};
    const by={};
    expected.forEach(r=>{
      const nodes=TREE_NODES.filter(n=>n.effect==='hatch_'+r);
      nodes.forEach(n=>{S.tree.levels[n.id]=5;});
      by[r]={
        timer:EGG_TIMERS[r],
        nodes:nodes.length,
        total:nodes.reduce((sum,n)=>sum+treeEffectivePer(n)*n.max,0),
        speed:hatchSpeedFor(S,r),
        boostedSeconds:EGG_TIMERS[r]/hatchSpeedFor(S,r)
      };
      nodes.forEach(n=>{S.tree.levels[n.id]=0;});
    });
    return by;
  });
  const timers={
    COMMUN:600,PEU_COMMUN:1800,RARE:7200,EPIQUE:28800,
    MYTHIQUE:86400,ANCESTRAL:172800,LEGENDAIRE:518400,DIVIN:1814400
  };
  for(const [r,timer] of Object.entries(timers)){
    expect(out[r].timer).toBe(timer);
    expect(out[r].nodes).toBe(4);
    expect(out[r].total).toBeCloseTo(120,8);
    expect(out[r].speed).toBeCloseTo(2.2,8);
    expect(out[r].boostedSeconds).toBeCloseTo(timer/2.2,8);
  }
});

test('V476 Palier research times and 0/1 special duration are exact', async ({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>{
    S.tree=S.tree||{};S.tree.levels={};
    const normal={};
    for(let tier=1;tier<=4;tier++){
      const n=TREE_NODES.find(x=>x.tier===tier&&!x.special);
      normal[tier]=n.times.slice();
    }
    return {
      normal,
      special:{
        p1:treeTime(S,TREE_BY_ID.sp_slot1,1),
        p2:treeTime(S,TREE_BY_ID.sp_forge3,1),
        p3:treeTime(S,TREE_BY_ID.sp_forge5,1),
        p4:treeTime(S,TREE_BY_ID.sp_slot2,1)
      },
      mastery:treeTime(S,TREE_BY_ID.mk_familier,1)
    };
  });
  expect(out.normal[1]).toEqual([240,480,840,1320,1920]);
  expect(out.normal[2]).toEqual([10800,11100,11400,11700,12000]);
  expect(out.normal[3]).toEqual([36000,36300,36600,36900,37200]);
  expect(out.normal[4]).toEqual([259200,277200,295200,313200,331200]);
  expect(out.special).toEqual({
    p1:4800,
    p2:57000,
    p3:183000,
    p4:1476000
  });
  expect(out.mastery).toBe(7*24*3600);
});

test('V496 Global Gold reaches 50 percent and Autonomy resources stay independent at 10% base', async ({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>{
    S.tree=S.tree||{};S.tree.levels=S.tree.levels||{};
    TREE_NODES.forEach(n=>{ if(['goldAll','afkGold','afkMinerai','afkEssence','afkEclat'].includes(n.effect)) S.tree.levels[n.id]=0; });
    const base=harvestRates(S);
    TREE_NODES.filter(n=>n.effect==='goldAll').forEach(n=>{S.tree.levels[n.id]=5;});
    const goldBonus=treeSum(S,'goldAll');
    const goldMultiplier=goldMul(S);
    TREE_NODES.filter(n=>n.effect==='afkEssence').forEach(n=>{S.tree.levels[n.id]=5;});
    const essenceOnly=harvestRates(S);
    return {
      goldBonus,goldMultiplier,base,essenceOnly,
      rewards:{
        minerai:raidReward('minerai',S.raids.minerai.level),
        essence:raidReward('familier',S.raids.familier.level),
        eclat:raidReward('competence',S.raids.competence.level),
        gold:raidReward('or',S.raids.or.level)
      }
    };
  });
  expect(out.goldBonus).toBeCloseTo(50,8);
  expect(out.goldMultiplier).toBeCloseTo(1.5,8);
  expect(out.essenceOnly.essence).toBeCloseTo(out.rewards.essence*0.20,8);
  expect(out.essenceOnly.minerai).toBeCloseTo(out.rewards.minerai*0.10,8);
  expect(out.essenceOnly.eclat).toBeCloseTo(out.rewards.eclat*0.10,8);
  expect(out.essenceOnly.gold).toBeCloseTo(out.rewards.gold*0.10,8);
});
