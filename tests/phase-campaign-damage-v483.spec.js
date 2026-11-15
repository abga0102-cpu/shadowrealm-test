const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

const root=path.join(__dirname,'..');

async function boot(page){
  await page.route('**/npm/**', route => route.abort());
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srCampaignEarlyRebalanceConfigV449?.version === 497 &&
    typeof makeEnemy === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V497 keeps the +30% current-damage boost and extends it toward Facile 3-10', async({page})=>{
  await boot(page);
  const out=await page.evaluate(()=>{
    const c=window.__srCampaignEarlyRebalanceConfigV449;
    return {
      cfg:c.currentDamageBoostV497,
      compat:c.currentDamageBoostV483,
      at2:c.applyCurrentDamageBoost(100,2,false),
      at3:c.applyCurrentDamageBoost(100,3,false),
      at46:c.applyCurrentDamageBoost(100,46,false),
      at47:c.applyCurrentDamageBoost(100,47,false),
      at48:c.applyCurrentDamageBoost(100,48,false),
      at49:c.applyCurrentDamageBoost(100,49,false),
      at50:c.applyCurrentDamageBoost(100,50,false),
      at51:c.applyCurrentDamageBoost(100,51,false),
      megaExcluded:c.applyCurrentDamageBoost(100,5,true)
    };
  });

  expect(out.cfg).toMatchObject({
    from:3,to:50,visible:'Facile 1-3 → Facile 3-10',
    relativeToCurrentMul:1.30,fullBoostThrough:46,
    exitContinuity:{from:47,to:50,multipliers:[1.22,1.18,1.12,1.06],returnsToCurrentAt:51},
    hpChanged:false,raidsChanged:false,megaBossChanged:false
  });
  expect(out.compat).toMatchObject({supersededBy:497,to:50});
  expect(out.at2).toBe(100);
  expect(out.at3).toBe(130);
  expect(out.at46).toBe(130);
  expect(out.at47).toBe(122);
  expect(out.at48).toBe(118);
  expect(out.at49).toBe(112);
  expect(out.at50).toBe(106);
  expect(out.at51).toBe(100);
  expect(out.megaExcluded).toBe(100);
});

test('V497 still runs after the existing V465 x1.60 pass and changes damage only', async()=> {
  const src=fs.readFileSync(path.join(root,'campaign-early-rebalance-v449.js'),'utf8');
  const existing='enemy.dmg=Math.max(1,Math.floor(beforeDmg*m.dmg));';
  const boost='enemy.dmg=applyCurrentDamageBoost(enemy.dmg,f,!!opts.noFastback);';
  expect(src).toContain(existing);
  expect(src).toContain(boost);
  expect(src.indexOf(boost)).toBeGreaterThan(src.indexOf(existing));
  expect(src).toContain('CURRENT_DAMAGE_BOOST_MUL=1.30');
  expect(src).toContain('hpChanged:false');
  expect(src).not.toContain('__srCampaignPowerFinalV478');
});

test('V497 transition stays progressive and Facile 3-8 never exceeds normal Facile 3-11', async({page})=>{
  await boot(page);
  const rows=await page.evaluate(()=>{
    const type=Object.assign({},ENEMY_TYPES[2]);
    return [46,47,48,49,50,51].map(f=>{
      const e=makeEnemy('campaign',{type,name:type.name,tier:'EPIQUE',floor:f,x:260});
      return {floor:f,damage:e.dmg,hp:e.maxHP,boost:window.__srCampaignEarlyRebalanceConfigV449.currentDamageBoostMultiplier(f)};
    });
  });

  for(let i=1;i<rows.length;i++){
    expect(rows[i].damage, 'floor '+rows[i].floor+' should not be weaker than '+rows[i-1].floor)
      .toBeGreaterThanOrEqual(rows[i-1].damage);
    expect(rows[i].hp, 'HP floor '+rows[i].floor+' should not be weaker than '+rows[i-1].floor)
      .toBeGreaterThanOrEqual(rows[i-1].hp);
  }
  const f48=rows.find(r=>r.floor===48), f51=rows.find(r=>r.floor===51);
  expect(f48.damage).toBeLessThanOrEqual(f51.damage);
  expect(f48.hp).toBeLessThanOrEqual(f51.hp);
  expect(rows.map(r=>r.boost)).toEqual([1.30,1.22,1.18,1.12,1.06,1]);
});

test('V497 early-pressure scope excludes Raid and Mega construction', async({page})=>{
  await boot(page);
  const out=await page.evaluate(()=>{
    const c=window.__srCampaignEarlyRebalanceConfigV449;
    const type=ENEMY_TYPES[0];
    const raid=makeEnemy('raid',{type,name:'Raid',tier:'COMMUN',floor:5,raidId:'or',raidLevel:1,x:200});
    const megaBeforeBoost=c.applyCurrentDamageBoost(raid.dmg,5,true);
    return {
      raidHasEarlyMarker:!!raid.__srCampaignEarlyRebalanceV449,
      excludedSample:megaBeforeBoost,
      originalSample:raid.dmg
    };
  });
  expect(out.raidHasEarlyMarker).toBe(false);
  expect(out.excludedSample).toBe(out.originalSample);
});
