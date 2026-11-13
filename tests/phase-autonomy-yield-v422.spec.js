const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

async function clean(page){
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srAutonomyYieldConfigV476 && typeof harvestRates === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V496 Autonomy has four independent 10%/h -> 25%/h branches', async ({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>{
    const effects={minerai:'afkMinerai',essence:'afkEssence',eclat:'afkEclat',gold:'afkGold'};
    S.tree=S.tree||{};S.tree.levels=S.tree.levels||{};
    Object.values(effects).forEach(e=>TREE_NODES.filter(n=>n.effect===e).forEach(n=>{S.tree.levels[n.id]=0;}));
    const base=harvestRates(S);
    TREE_NODES.filter(n=>n.effect==='afkMinerai').forEach(n=>{S.tree.levels[n.id]=5;});
    const mineralOnly=harvestRates(S);
    Object.entries(effects).forEach(([resource,e])=>TREE_NODES.filter(n=>n.effect===e).forEach(n=>{S.tree.levels[n.id]=5;}));
    const allMax=harvestRates(S);
    return {
      base,mineralOnly,allMax,
      reward:{
        minerai:raidReward('minerai',S.raids.minerai.level),
        essence:raidReward('familier',S.raids.familier.level),
        eclat:raidReward('competence',S.raids.competence.level),
        gold:raidReward('or',S.raids.or.level)
      },
      counts:Object.fromEntries(Object.entries(effects).map(([k,e])=>[k,TREE_NODES.filter(n=>n.effect===e).length])),
      config:window.__srAutonomyYieldConfigV476
    };
  });
  for(const k of ['minerai','essence','eclat','gold']){
    expect(out.base[k]).toBeCloseTo(out.reward[k]*0.10,8);
    expect(out.allMax[k]).toBeCloseTo(out.reward[k]*0.25,8);
    expect(out.counts[k]).toBe(4);
  }
  expect(out.mineralOnly.minerai).toBeCloseTo(out.reward.minerai*0.25,8);
  expect(out.mineralOnly.essence).toBeCloseTo(out.reward.essence*0.10,8);
  expect(out.mineralOnly.eclat).toBeCloseTo(out.reward.eclat*0.10,8);
  expect(out.mineralOnly.gold).toBeCloseTo(out.reward.gold*0.10,8);
  expect(out.config).toMatchObject({basePctPerHour:10,maxPctPerHour:25,treeAddsPctPoints:15,rebalanceVersion:496,legacyUniversalNodeMigrated:true});
});

test('V476 preserves old universal Autonomy levels through one-time split migration source', async()=>{
  const root=path.join(__dirname,'..');
  const authority=fs.readFileSync(path.join(root,'familiar-ladder-authority-v295.js'),'utf8');
  expect(authority).toContain('!S.autonomySplitV476');
  expect(authority).toContain("S.tree.levels[id]=Math.max(Number(S.tree.levels[id])||0,lv)");
  expect(authority).toContain("S.autonomySplitV476=true");
  expect(authority).toContain("branchShare(s,'afkMinerai')");
  expect(authority).toContain("branchShare(s,'afkEssence')");
  expect(authority).toContain("branchShare(s,'afkEclat')");
  expect(authority).toContain("branchShare(s,'afkGold')");
});
