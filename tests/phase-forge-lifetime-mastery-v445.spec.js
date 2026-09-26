const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof S !== 'undefined' && window.__srForgeMasteryV449 && window.__srForgeLifetimeMasteryV445 && window.__srForgeLifetimeMasteryV445.version === 449);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V449 uses the exact I-IX lifetime Forge ladder and caps at 30k / +80%', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const api=window.__srForgeMasteryV449;
    const counts=[0,99,100,499,500,1499,1500,2999,3000,4999,5000,7999,8000,11999,12000,19999,20000,29999,30000,40000];
    return {tiers:api.tiers,infos:counts.map(count=>{const s={forge:{lifetimeCount:count}};const i=api.info(s);return {count,rank:i.rank,roman:i.roman,bonus:i.bonusPct,maxed:i.maxed,nextReward:i.nextReward};})};
  });
  expect(out.tiers.map(t=>[t.need,t.roman,t.bonusPct,t.reward])).toEqual([
    [0,'—',0,0],[100,'I',10,50],[500,'II',20,100],[1500,'III',30,150],[3000,'IV',40,200],
    [5000,'V',50,250],[8000,'VI',60,300],[12000,'VII',70,350],[20000,'VIII',75,400],[30000,'IX',80,450]
  ]);
  expect(out.infos.find(x=>x.count===30000)).toMatchObject({rank:9,roman:'IX',bonus:80,maxed:true});
  expect(out.infos.find(x=>x.count===40000)).toMatchObject({rank:9,roman:'IX',bonus:80,maxed:true});
});

test('V449 100th paid forge boosts equipment and grants rank-I Dust once', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    S.forge.lifetimeCount=99;S.forge.summonCount=0;S.forge.lifetimeMasteryVersion=449;S.forge.masteryDustClaimedRank=0;S.minerai=100000;S.poussiere=0;S.inventory=[];
    Object.keys(S.equipped).forEach(k=>S.equipped[k]=null);
    const it=makeItem('arme','COMMUN',S.forge.level);S.equipped.arme=it;
    const id=it.id,beforeBase=it.baseDamage,beforeOriginal=it.originalPower,beforeDustValue=dustValue(S,it),beforePower=computePower(S);
    forgeSummon(1);
    const after=S.equipped.arme, dustAfterFirst=S.poussiere;
    window.__srForgeMasteryV449.applyState(S);
    return {count:S.forge.lifetimeCount,bonus:window.__srForgeMasteryV449.info(S).bonusPct,beforeBase,afterBase:after.baseDamage,beforeOriginal,afterOriginal:after.originalPower,beforeDustValue,afterDustValue:dustValue(S,after),beforePower,afterPower:computePower(S),sameId:after.id===id,dustAfterFirst,dustAfterReapply:S.poussiere,claimed:S.forge.masteryDustClaimedRank};
  });
  expect(out.count).toBe(100);expect(out.bonus).toBe(10);expect(out.afterBase).toBeGreaterThan(out.beforeBase);expect(out.afterOriginal).toBe(out.beforeOriginal);expect(out.afterDustValue).toBe(out.beforeDustValue);expect(out.afterPower).toBeGreaterThan(out.beforePower);expect(out.sameId).toBe(true);
  expect(out.dustAfterFirst).toBe(50);expect(out.dustAfterReapply).toBe(50);expect(out.claimed).toBe(1);
});

test('V449 preserves Dust upgrade ratio when a lifetime tier changes', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const api=window.__srForgeMasteryV449;S.forge.lifetimeCount=0;const it=makeItem('arme','RARE',S.forge.level);S.inventory=[it];it.damage=it.baseDamage*1.37;it.power=it.damage+it.hp;const beforeRatio=it.damage/it.baseDamage;S.forge.lifetimeCount=20000;api.applyState(S);return {beforeRatio,afterRatio:it.damage/it.baseDamage,bonus:api.info(S).bonusPct,masteryPct:it.forgeLifetimeMasteryPct};
  });
  expect(out.bonus).toBe(75);expect(out.masteryPct).toBe(75);expect(out.afterRatio).toBeCloseTo(out.beforeRatio,8);
});

test('V449 never lets a rarity reach the same-quality base of the next rarity', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {const api=window.__srForgeMasteryV449;const order=['COMMUN','PEU_COMMUN','RARE','EPIQUE','HEROIQUE','MYTHIQUE','ARTEFACT','LEGENDAIRE','INFERNAL','IMMORTEL','DIVIN'];return order.slice(0,-1).map((rar,i)=>{const cur=api.statsFor('arme',rar,1,1,80);const next=api.rawStats('arme',order[i+1],1,1);return {rar,cur:cur.d,next:next.d};});});
  out.forEach(row=>expect(row.cur).toBeLessThan(row.next));
});

test('V449 Forge Ascension resets the cycle but keeps lifetime mastery', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {S.forge.level=RULES.FORGE_MAX;S.forge.summonCount=777;S.forge.lifetimeCount=20000;S.forge.masteryDustClaimedRank=8;S.stars.forge=0;const r=doAscendMastery('forge');return {ok:r.ok,level:S.forge.level,summonCount:S.forge.summonCount,lifetimeCount:S.forge.lifetimeCount,bonus:window.__srForgeMasteryV449.info(S).bonusPct,claimed:S.forge.masteryDustClaimedRank};});
  expect(out).toEqual({ok:true,level:1,summonCount:0,lifetimeCount:20000,bonus:75,claimed:8});
});

test('V449 grandfathers existing saves without retroactive Dust', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {S.forge.lifetimeCount=5000;delete S.forge.masteryDustClaimedRank;S.poussiere=17;window.__srForgeMasteryV449.applyState(S);return {rank:window.__srForgeMasteryV449.info(S).rank,dust:S.poussiere,claimed:S.forge.masteryDustClaimedRank};});
  expect(out).toEqual({rank:5,dust:17,claimed:5});
});

test('V449 Forge panel exposes next Dust reward', async ({ page }) => {
  await openCleanGame(page);
  await page.evaluate(() => {S.forge.lifetimeCount=100;nav('accueil');render();});
  await expect(page.locator('#homeForge')).toContainText('MAÎTRISE ÉQUIPEMENT I');
  await expect(page.locator('#homeForge')).toContainText('+10% base');
  await expect(page.locator('#homeForge')).toContainText('100 / 500 forges');
  await expect(page.locator('#homeForge')).toContainText('Prochain rang : +100 poussières');
});
