const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

const root=path.join(__dirname,'..');

async function boot(page){
  await page.route('**/npm/**', route => route.abort());
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srCampaignEarlyRebalanceConfigV449?.version === 483 &&
    typeof makeEnemy === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V483 applies +30% to the CURRENT V465 damage, not +30 points on the old source multiplier', async({page})=>{
  await boot(page);
  const out=await page.evaluate(()=>{
    const c=window.__srCampaignEarlyRebalanceConfigV449;
    return {
      cfg:c.currentDamageBoostV483,
      at2:c.applyCurrentDamageBoost(100,2,false),
      at3:c.applyCurrentDamageBoost(100,3,false),
      at41:c.applyCurrentDamageBoost(100,41,false),
      at42:c.applyCurrentDamageBoost(100,42,false),
      at43:c.applyCurrentDamageBoost(100,43,false),
      at44:c.applyCurrentDamageBoost(100,44,false),
      at45:c.applyCurrentDamageBoost(100,45,false),
      megaExcluded:c.applyCurrentDamageBoost(100,5,true)
    };
  });

  expect(out.cfg).toMatchObject({
    from:3,to:41,visible:'Facile 1-3 → Facile 3-1',
    relativeToCurrentMul:1.30,hpChanged:false,raidsChanged:false,megaBossChanged:false
  });
  expect(out.at2).toBe(100);
  expect(out.at3).toBe(130);
  expect(out.at41).toBe(130);
  expect(out.at42).toBe(121);
  expect(out.at43).toBe(114);
  expect(out.at44).toBe(107);
  expect(out.at45).toBe(100);
  expect(out.megaExcluded).toBe(100);
});

test('V483 runs after the existing V465 x1.60 pass and changes damage only', async()=> {
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

test('V483 exit guard prevents Facile 3-2 through 3-4 from dropping below boosted 3-1', async({page})=>{
  await boot(page);
  const rows=await page.evaluate(()=>{
    const type=Object.assign({},ENEMY_TYPES[2]);
    return [41,42,43,44,45].map(f=>{
      const e=makeEnemy('campaign',{type,name:type.name,tier:'EPIQUE',floor:f,x:260});
      return {floor:f,damage:e.dmg,hp:e.maxHP,boost:window.__srCampaignEarlyRebalanceConfigV449.currentDamageBoostMultiplier(f)};
    });
  });

  for(let i=1;i<rows.length;i++){
    expect(rows[i].damage, 'floor '+rows[i].floor+' should not be weaker than '+rows[i-1].floor)
      .toBeGreaterThanOrEqual(rows[i-1].damage);
  }
  expect(rows.map(r=>r.boost)).toEqual([1.30,1.21,1.14,1.07,1]);
});

test('V483 new +30% scope excludes Raid and Mega construction', async({page})=>{
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
