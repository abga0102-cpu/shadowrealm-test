const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

async function clean(page){
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof megaBossFloors === 'function' &&
    typeof makeMegaBossEnemy === 'function' &&
    typeof megaBossTrack === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V480 Mega eligibility rejects Elite floors and keeps only Campaign Boss floors', async({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>{
    const s=defaultState('QA');
    s.level=18;
    s.bossClears={'5':true,'10':true,'15':true,'20':true,'25':true,'30':true};
    return {
      floors:megaBossFloors(s),
      kinds:[5,10,15,20,25,30].map(f=>({f,boss:isBoss(f),elite:isElite(f)}))
    };
  });
  expect(out.floors).toEqual([10,20,30]);
  expect(out.kinds.filter(x=>x.elite).map(x=>x.f)).toEqual([5,15,25]);
});

test('V480 every started Mega stage is one Boss and never an Elite', async({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>{
    S=defaultState('QA');
    S.level=18;
    S.bossClears={'10':true};
    S.megaBossClears={};
    const started=startMegaBoss(10);
    const e=started&&combat&&combat.enemies&&combat.enemies[0];
    return {
      started,
      ctx:combat&&combat.ctx,
      combatBoss:combat&&combat.boss,
      combatElite:combat&&combat.elite,
      enemyCount:combat&&combat.enemies&&combat.enemies.length,
      enemyBoss:e&&e.boss,
      enemyElite:e&&e.elite,
      enemyMega:e&&e.mega
    };
  });
  expect(out).toEqual({
    started:true,ctx:'mega',combatBoss:true,combatElite:false,
    enemyCount:1,enemyBoss:true,enemyElite:false,enemyMega:true
  });
});

test('V480 Mega track renders every stage as a Boss and no Elite marker', async({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>({
    campaign:floorTrack(10),
    mega:megaBossTrack(10)
  }));
  expect(out.campaign).toContain('elite');
  expect(out.mega).not.toContain('elite');
  expect((out.mega.match(/sdot boss/g)||[])).toHaveLength(10);
  expect((out.mega.match(/<svg/g)||[])).toHaveLength(10);
});

test('V480 does not change the existing Mega x10 HP/damage rule', async({page})=>{
  await clean(page);
  const out=await page.evaluate(()=>{
    const floor=20,def=bossFor(floor);
    const type=Object.assign({},ENEMY_TYPES[1],{
      id:'mega_'+def.id,name:'Méga-'+def.name,img:def.img,
      ranged:!!def.ranged,proj:def.proj||'magic'
    });
    const normal=makeEnemy('campaign',{
      type,name:type.name,tier:def.tier,floor,boss:true,
      abils:def.abils,noFastback:true,x:AW-60
    });
    const mega=makeMegaBossEnemy(floor);
    return {
      normalHP:normal.maxHP,normalDamage:normal.dmg,
      megaHP:mega.maxHP,megaDamage:mega.dmg,
      boss:mega.boss,elite:mega.elite
    };
  });
  expect(out.megaHP).toBe(Math.max(1,Math.floor(out.normalHP*10)));
  expect(out.megaDamage).toBe(Math.max(1,Math.floor(out.normalDamage*10)));
  expect(out.boss).toBe(true);
  expect(out.elite).toBe(false);
});

test('V480 build loads only the changed Mega owners', async()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  expect(index).toContain('shadowreach-build" content="2026.09.29.480"');
  expect(index).toContain('game-2.js?v=2026.09.29.480a');
  expect(index).toContain('game-3.js?v=2026.09.29.480b');
  expect(index).toContain('game-4.js?v=2026.09.29.480c');
});
