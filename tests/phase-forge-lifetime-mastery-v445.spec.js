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
    window.__srEquipmentCurveAuthority.version >= 445
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V445 uses the exact I-IX lifetime Forge ladder and caps at +80%', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const api=window.__srForgeLifetimeMasteryV445;
    const counts=[0,99,100,299,300,599,600,999,1000,1499,1500,2499,2500,3999,4000,6499,6500,9999,10000,20000];
    return {
      tiers:api.tiers,
      infos:counts.map((count)=>{const s={forge:{lifetimeCount:count}};const i=api.info(s);return {count,rank:i.rank,roman:i.roman,bonus:i.bonusPct,maxed:i.maxed};})
    };
  });
  expect(out.tiers.map(t=>[t.need,t.roman,t.bonusPct])).toEqual([
    [0,'—',0],[100,'I',10],[300,'II',20],[600,'III',30],[1000,'IV',40],
    [1500,'V',50],[2500,'VI',60],[4000,'VII',70],[6500,'VIII',75],[10000,'IX',80]
  ]);
  expect(out.infos.find(x=>x.count===10000)).toMatchObject({rank:9,roman:'IX',bonus:80,maxed:true});
  expect(out.infos.find(x=>x.count===20000)).toMatchObject({rank:9,roman:'IX',bonus:80,maxed:true});
});

test('V445 100th paid forge instantly boosts owned equipment and does not inflate Dust recycling', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    S.forge.lifetimeCount=99;
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
  expect(out.count).toBe(100);
  expect(out.summonCount).toBe(1);
  expect(out.bonus).toBe(10);
  expect(out.afterBase).toBeGreaterThan(out.beforeBase);
  expect(out.afterBase / out.beforeBase).toBeLessThanOrEqual(1.101);
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
    S.forge.lifetimeCount=6500;
    api.applyState(S);
    return {
      beforeRatio,
      afterRatio:it.damage/it.baseDamage,
      bonus:api.info(S).bonusPct,
      masteryPct:it.forgeLifetimeMasteryPct
    };
  });
  expect(out.bonus).toBe(75);
  expect(out.masteryPct).toBe(75);
  expect(out.afterRatio).toBeCloseTo(out.beforeRatio,8);
});

test('V445 never lets a rarity reach the same-quality base of the next rarity', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const api=window.__srForgeLifetimeMasteryV445;
    const order=['COMMUN','PEU_COMMUN','RARE','EPIQUE','HEROIQUE','MYTHIQUE','ARTEFACT','LEGENDAIRE','INFERNAL','IMMORTEL','DIVIN'];
    return order.slice(0,-1).map((rar,i)=>{
      const cur=api.statsFor('arme',rar,1,1,80);
      const next=api.rawStats('arme',order[i+1],1,1);
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
    S.forge.lifetimeCount=6500;
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
  expect(out).toEqual({ok:true,level:1,summonCount:0,lifetimeCount:6500,bonus:75});
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
    S.forge.lifetimeCount=1000;
    nav('accueil');
    render();
  });
  await expect(page.locator('#homeForge')).toContainText('MAÎTRISE ÉQUIPEMENT IV');
  await expect(page.locator('#homeForge')).toContainText('+40% base');
  await expect(page.locator('#homeForge')).toContainText('1 000 / 1 500 forges');
});
