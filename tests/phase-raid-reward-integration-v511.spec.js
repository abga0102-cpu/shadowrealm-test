const { test, expect } = require('@playwright/test');
const legacy = require('./fixtures/raid-rewards-through-70.json');

async function openGame(page) {
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/npm/**',route=>route.abort());
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(()=>window.__srRaidRewardConfigV396 && window.__srMobileUiStabilityV211);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  return errors;
}

test('V511 loaded reward owner preserves every old level and all five raids stay capped at 500',async({page})=>{
  const errors=await openGame(page);
  const out=await page.evaluate(()=>({
    final:raidReward.__srFinalAuthorityV396,
    same:window.__srRaidRewardConfigV396.reward===raidReward,
    max:RULES.RAID_MAX_LEVEL,
    rewards:Object.fromEntries(RAID_IDS.map(id=>[id,Array.from({length:70},(_,i)=>raidReward(id,i+1))])),
    endpoints:Object.fromEntries(RAID_IDS.map(id=>[id,[500,501,1000].map(lv=>raidReward(id,lv))]))
  }));
  expect(out.final).toBe(true);expect(out.same).toBe(true);expect(out.max).toBe(500);
  expect(out.rewards).toEqual(legacy.rewards);
  for(const values of Object.values(out.endpoints))expect(values).toEqual([values[0],values[0],values[0]]);
  expect(errors).toEqual([]);
});

test('V511 actual Raid victory credits the previewed reward at every representative level',async({page})=>{
  await openGame(page);
  const rows=await page.evaluate(()=>{
    combat=null; S.tree.levels={}; S.economyDebt={essence:0,eclat:0};
    const keys={or:'gold',minerai:'minerai',competence:'eclat',familier:'essence',evolution:'pe'};
    const rows=[];
    for(const id of RAID_IDS)for(const lv of [69,70,71,100,200,300,400,499,500]){
      combat=null;
      S.raids[id]={...S.raids[id],level:lv,record:lv-1,keys:2};S[keys[id]]=100;
      const preview=raidReward(id,lv),card=document.createElement('div');card.innerHTML=scrRaid();
      const cardText=[...card.querySelectorAll('.raidCard')].find(el=>el.querySelector('[data-act="startRaid"]').dataset.arg===id).textContent;
      let payout;const started=startRaid(id,false,(_won,pay)=>{payout=pay;});
      const active=document.createElement('div');active.innerHTML=scrRaid();
      const runningPreview=active.textContent.includes(fmt(preview)+' '+RAIDS[id].reward);
      if(started)combat.onEnd(true);
      rows.push({id,lv,started,preview,payout,delta:S[keys[id]]-100,keys:S.raids[id].keys,
        next:S.raids[id].level,record:S.raids[id].record,
        previewMatches:cardText.includes('+'+fmt(preview)+' '+RAIDS[id].reward),runningPreview});
    }
    combat=null;return rows;
  });
  expect(rows).toHaveLength(45);
  for(const row of rows){
    expect(row.started,JSON.stringify(row)).toBe(true);
    expect(row.previewMatches).toBe(true);expect(row.runningPreview).toBe(true);
    expect(row.delta).toBe(row.preview);
    expect(row.payout).toEqual({gross:row.preview,credited:row.preview,repaid:0});
    expect(row.keys).toBe(1);expect(row.next).toBe(Math.min(500,row.lv+1));expect(row.record).toBe(row.lv);
  }
});

test('V511 real Tree bonuses and historical debt are applied once and result UI matches credited amounts',async({page})=>{
  await openGame(page);
  const rows=await page.evaluate(()=>{
    combat=null;
    const keys={or:'gold',minerai:'minerai',competence:'eclat',familier:'essence',evolution:'pe'};
    const effects={or:['goldAll'],minerai:['minerai','raidMinerai'],competence:['skillPts'],familier:['essence'],evolution:['peRaid']};
    const rows=[];
    for(const id of RAID_IDS){
      S.tree.levels={};
      for(const node of TREE_NODES)if(effects[id].includes(node.effect))S.tree.levels[node.id]=node.max;
      S.economyDebt={essence:7,eclat:7};S[keys[id]]=100;S.universalKeys=2;
      S.raids[id]={...S.raids[id],level:500,record:499,keys:2};
      const percent=effects[id].reduce((n,e)=>n+treeSum(S,e),0);
      const gross=Math.floor(raidReward(id,500)*(1+percent/100));
      let payout;startRaid(id,true,(_won,pay)=>{payout=pay;});combat.onEnd(true);
      showRaidResult({raidId:id,won:true,level:500,reward:payout});
      const resultText=document.body.textContent;
      rows.push({id,percent,gross,payout,delta:S[keys[id]]-100,universal:S.universalKeys,keys:S.raids[id].keys,
        resultMatches:resultText.includes('+'+fmt(payout.credited)+' '+RAIDS[id].reward),
        debt:S.economyDebt[keys[id]]||0});
      closeModal();combat=null;
    }
    return rows;
  });
  for(const row of rows){
    const repaid=['familier','competence'].includes(row.id)?7:0;
    expect(row.payout).toEqual({gross:row.gross,credited:row.gross-repaid,repaid});
    expect(row.delta).toBe(row.gross-repaid);expect(row.debt).toBe(0);
    expect(row.resultMatches,JSON.stringify(row)).toBe(true);
    expect(row.universal).toBe(1);expect(row.keys).toBe(2);
  }
  expect(rows.find(r=>r.id==='or').percent).toBe(50);
});

test('V511 Autonomy keeps its rates and pays the extended rewards without changing an existing reserve',async({page})=>{
  await openGame(page);
  const out=await page.evaluate(()=>{
    const st=JSON.parse(JSON.stringify(S));st.tree.levels={};st.economyDebt={essence:0,eclat:0};
    for(const id of RAID_IDS)st.raids[id].level=500;
    const keys={minerai:'minerai',essence:'familier',eclat:'competence',gold:'or'};
    st.harvest={secs:0,minerai:12.25,essence:13.25,eclat:14.25,gold:15.25};
    const before=JSON.parse(JSON.stringify(st.harvest));
    const rates=harvestRates(st);
    const afterRead=JSON.parse(JSON.stringify(st.harvest));
    const advanced=harvestAdvance(st,3600),balanceBefore=Object.fromEntries(Object.keys(keys).map(k=>[k,st[k]]));
    const got=harvestClaim(st);
    return {before,afterRead,rates,advanced,got,
      raw:Object.fromEntries(Object.entries(keys).map(([k,id])=>[k,raidReward(id,500)])),
      delta:Object.fromEntries(Object.keys(keys).map(k=>[k,st[k]-balanceBefore[k]])),after:st.harvest};
  });
  expect(out.afterRead).toEqual(out.before);expect(out.advanced).toBe(3600);
  for(const key of ['minerai','essence','eclat','gold']){
    expect(out.rates[key]).toBeCloseTo(out.raw[key]*0.1,6);
    expect(out.got[key]).toBe(Math.floor(out.before[key]+out.rates[key]));
    expect(out.delta[key]).toBe(out.got[key]);
    expect(out.after[key]).toBeGreaterThanOrEqual(0);expect(out.after[key]).toBeLessThan(1);
  }
});

test('V511 serialized existing saves preserve balances, progress, debt and past reward markers',async({page})=>{
  await openGame(page);
  const out=await page.evaluate(()=>{
    // Normalize pre-existing migrations before simulating an already-played save.
    const st=migrate(JSON.parse(JSON.stringify(S)),'V511 fixture initialization');
    for(const [index,id] of RAID_IDS.entries())st.raids[id]={...st.raids[id],level:[70,71,200,400,500][index],record:[69,70,199,399,500][index],keys:2};
    Object.assign(st,{gold:456789,minerai:12345,essence:6789,eclat:9876,pe:5432});
    st.economyDebt={essence:7,eclat:11};
    st.raidMineraiDifferenceCompensationV500={done:true,throughLevel:70,amount:1,curveFrom:496,curveTo:499};
    const pick=s=>({raids:s.raids,gold:s.gold,minerai:s.minerai,essence:s.essence,eclat:s.eclat,pe:s.pe,
      debt:s.economyDebt,mineraiMarker:s.raidMineraiDifferenceCompensationV500,goldMarker:s.raidRewardMigrationV337,
      harvest:s.harvest});
    const before=JSON.parse(JSON.stringify(pick(st)));
    const restored=migrate(JSON.parse(JSON.stringify(st)),'V511 existing save compatibility');
    const once=JSON.parse(JSON.stringify(pick(restored)));
    const twice=pick(migrate(JSON.parse(JSON.stringify(restored)),'V511 repeated compatibility'));
    return {before,once,twice};
  });
  expect(out.once).toEqual(out.before);expect(out.twice).toEqual(out.once);
});
