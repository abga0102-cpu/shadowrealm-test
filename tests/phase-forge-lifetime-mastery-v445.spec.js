const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof S !== 'undefined' &&
    window.__srForgeLifetimeMasteryV445 &&
    window.__srEquipmentCurveAuthority &&
    window.__srEquipmentCurveAuthority.version === 372 &&
    window.__srEquipmentCurveAuthority.forgeLifetimeMasteryVersion === 445
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V474 uses the exact I-X lifetime Forge ladder and caps at +240%', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const api=window.__srForgeLifetimeMasteryV445;
    const counts=[0,199,200,599,600,1199,1200,2499,2500,4999,5000,9999,10000,19999,20000,29999,30000,39999,40000,49999,50000,60000];
    return {
      tiers:api.tiers,
      infos:counts.map((count)=>{const s={forge:{lifetimeCount:count}};const i=api.info(s);return {count,rank:i.rank,roman:i.roman,bonus:i.bonusPct,maxed:i.maxed};})
    };
  });
  expect(out.tiers.map(t=>[t.need,t.roman,t.bonusPct])).toEqual([
    [0,'—',0],[200,'I',30],[600,'II',60],[1200,'III',90],[2500,'IV',120],
    [5000,'V',140],[10000,'VI',160],[20000,'VII',180],[30000,'VIII',200],
    [40000,'IX',220],[50000,'X',240]
  ]);
  expect(out.infos.find(x=>x.count===40000)).toMatchObject({rank:9,roman:'IX',bonus:220,maxed:false});
  expect(out.infos.find(x=>x.count===50000)).toMatchObject({rank:10,roman:'X',bonus:240,maxed:true});
  expect(out.infos.find(x=>x.count===60000)).toMatchObject({rank:10,roman:'X',bonus:240,maxed:true});
});

test('V474 200th paid forge instantly boosts owned equipment and does not inflate Dust recycling', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    S.forge.lifetimeCount=199;
    S.forge.summonCount=0;
    S.forge.lifetimeMasteryVersion=445;
    S.minerai=100000;
    S.inventory=[];
    Object.keys(S.equipped).forEach(k=>S.equipped[k]=null);
    const it=makeItem('arme','COMMUN',S.forge.level);
    S.equipped.arme=it;
    const id=it.id, beforeBase=it.baseDamage, beforeOriginal=it.originalPower, beforeDust=dustValue(S,it);
    const beforePower=computePower(S);
    forgeSummon(1);
    const after=S.equipped.arme;
    return {
      count:S.forge.lifetimeCount,
      summonCount:S.forge.summonCount,
      bonus:window.__srForgeLifetimeMasteryV445.info(S).bonusPct,
      beforeBase,afterBase:after.baseDamage,
      beforeOriginal,afterOriginal:after.originalPower,
      beforeDust,afterDust:dustValue(S,after),
      beforePower,afterPower:computePower(S),
      sameId:after.id===id
    };
  });
  expect(out.count).toBe(200);
  expect(out.summonCount).toBe(1);
  expect(out.bonus).toBe(30);
  expect(out.afterBase).toBeGreaterThan(out.beforeBase);
  expect(out.afterBase / out.beforeBase).toBeLessThanOrEqual(1.301);
  expect(out.afterOriginal).toBe(out.beforeOriginal);
  expect(out.afterDust).toBe(out.beforeDust);
  expect(out.afterPower).toBeGreaterThan(out.beforePower);
  expect(out.sameId).toBe(true);
});

test('V445 preserves Dust upgrade ratio when a lifetime tier changes', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const api=window.__srForgeLifetimeMasteryV445;
    S.forge.lifetimeCount=0;
    const it=makeItem('arme','RARE',S.forge.level);
    S.inventory=[it];
    it.damage=it.baseDamage*1.37;
    it.power=it.damage+it.hp;
    const beforeRatio=it.damage/it.baseDamage;
    S.forge.lifetimeCount=5000;
    api.applyState(S);
    return {
      beforeRatio,
      afterRatio:it.damage/it.baseDamage,
      bonus:api.info(S).bonusPct,
      masteryPct:it.forgeLifetimeMasteryPct
    };
  });
  expect(out.bonus).toBe(140);
  expect(out.masteryPct).toBe(140);
  expect(out.afterRatio).toBeCloseTo(out.beforeRatio,8);
});

test('V445 never lets a rarity reach the same-quality base of the next rarity', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const api=window.__srForgeLifetimeMasteryV445;
    const order=['COMMUN','PEU_COMMUN','RARE','EPIQUE','HEROIQUE','MYTHIQUE','ARTEFACT','LEGENDAIRE','INFERNAL','IMMORTEL','DIVIN'];
    return order.slice(0,-1).map((rar,i)=>{
      const cur=api.statsFor('arme',rar,1,1,240);
      const next=api.statsFor('arme',order[i+1],1,1,240);
      return {rar,cur:cur.d,next:next.d};
    });
  });
  out.forEach(row=>expect(row.cur).toBeLessThan(row.next));
});

test('V445 Forge Ascension resets the cycle but keeps lifetime mastery', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    S.forge.level=RULES.FORGE_MAX;
    S.forge.summonCount=777;
    S.forge.lifetimeCount=30000;
    S.stars.forge=0;
    const r=doAscendMastery('forge');
    return {
      ok:r.ok,
      level:S.forge.level,
      summonCount:S.forge.summonCount,
      lifetimeCount:S.forge.lifetimeCount,
      bonus:window.__srForgeLifetimeMasteryV445.info(S).bonusPct
    };
  });
  expect(out).toEqual({ok:true,level:1,summonCount:0,lifetimeCount:30000,bonus:200});
});

test('V445 migrates old saves conservatively from the provable current paid Forge count', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const raw=JSON.parse(JSON.stringify(S));
    raw.forge.summonCount=321;
    delete raw.forge.lifetimeCount;
    delete raw.forge.lifetimeMasteryVersion;
    const migrated=migrate(raw,'V445 legacy');
    return {lifetime:migrated.forge.lifetimeCount,cycle:migrated.forge.summonCount};
  });
  expect(out).toEqual({lifetime:321,cycle:321});
});

test('V445 Forge panel exposes lifetime mastery progress', async ({ page }) => {
  await openCleanGame(page);
  await page.evaluate(() => {
    S.forge.lifetimeCount=2500;
    nav('accueil');
    render();
  });
  await expect(page.locator('#homeForge')).toContainText('MAÎTRISE ÉQUIPEMENT IV');
  await expect(page.locator('#homeForge')).toContainText('+120% base');
  await expect(page.locator('#homeForge')).toContainText('2 500 / 5 000 forges');
});
