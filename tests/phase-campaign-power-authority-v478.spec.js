const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srCampaignPowerAuthorityConfigV478 &&
    window.__srCampaignEarlyRebalanceConfigV449 &&
    typeof makeEnemy === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V478 keeps one existing final Campaign owner and adds no sibling runtime module', async()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const owner=fs.readFileSync(path.join(root,'campaign-early-rebalance-v449.js'),'utf8');
  expect(index).toContain('shadowreach-build" content="2026.09.29.478"');
  expect(index).toContain('campaign-early-rebalance-v449.js?v=2026.09.29.478a');
  expect(index).not.toContain('campaign-power-authority-v478.js');
  expect(index).not.toContain('campaign-power-authority.js');
  expect(owner).toContain("finalOwner:'campaign-early-rebalance-v449.js'");
  expect(owner).toContain("do not add another makeEnemy balance wrapper");
});

test('V478 is balance-neutral and preserves the approved V465 early band exactly', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const type=ENEMY_TYPES[0];
    const e=makeEnemy('campaign',{type,name:'V478 audit',tier:'COMMUN',floor:50,x:200});
    return {
      cfg:{
        version:window.__srCampaignPowerAuthorityConfigV478.version,
        neutral:window.__srCampaignPowerAuthorityConfigV478.balanceNeutral,
        rules:window.__srCampaignPowerAuthorityConfigV478.finalRules.length
      },
      hp:e.maxHP,dmg:e.dmg,audit:e.__srCampaignPowerFinalV478,
      legacy:e.__srCampaignEarlyRebalanceV449
    };
  });
  expect(out.cfg).toEqual({version:478,neutral:true,rules:0});
  expect(out.legacy).toMatchObject({floor:50,hpMul:0.60,dmgMul:1.60,band:1});
  expect(out.hp).toBe(Math.max(1,Math.floor(out.audit.preFinalHP*0.60)));
  expect(out.dmg).toBe(Math.max(1,Math.floor(out.audit.preFinalDamage*1.60)));
  expect(out.audit.hp).toBe(out.hp);
  expect(out.audit.damage).toBe(out.dmg);
  expect(out.audit.upstreamLayers).toContain('earlyRebalanceV449/V465');
  expect(out.audit.finalRules).toEqual([]);
});

test('V478 observes an untouched later Campaign spawn without changing it', async ({ page }) => {
  await openCleanGame(page);
  const out=await page.evaluate(()=>{
    const type=ENEMY_TYPES[0];
    const e=makeEnemy('campaign',{type,name:'V478 later',tier:'COMMUN',floor:105,x:200});
    return {hp:e.maxHP,dmg:e.dmg,audit:e.__srCampaignPowerFinalV478,legacy:e.__srCampaignEarlyRebalanceV449||null};
  });
  expect(out.legacy).toBeNull();
  expect(out.hp).toBe(out.audit.preFinalHP);
  expect(out.dmg).toBe(out.audit.preFinalDamage);
  expect(out.audit.upstreamLayers).toContain('campaignTierV362/V473');
});

test('V478 future final rule applies once to the already-final Campaign values', async ({ page }) => {
  await openCleanGame(page);
  const out=await page.evaluate(()=>{
    const cfg=window.__srCampaignPowerAuthorityConfigV478;
    const type=ENEMY_TYPES[0];
    const before=makeEnemy('campaign',{type,name:'before',tier:'COMMUN',floor:50,x:200});
    cfg.addRule({id:'test-final-half',from:50,to:50,hpMul:0.5,damageMul:0.5,types:['normal']});
    const after=makeEnemy('campaign',{type,name:'after',tier:'COMMUN',floor:50,x:200});
    return {
      before:{hp:before.maxHP,dmg:before.dmg},
      after:{hp:after.maxHP,dmg:after.dmg},
      audit:after.__srCampaignPowerFinalV478
    };
  });
  expect(out.after.hp).toBe(Math.max(1,Math.floor(out.before.hp*0.5)));
  expect(out.after.dmg).toBe(Math.max(1,Math.floor(out.before.dmg*0.5)));
  expect(out.audit.finalRules).toEqual(['test-final-half']);
});

test('V478 final rules never touch Raid or Mega-Boss construction', async ({ page }) => {
  await openCleanGame(page);
  const out=await page.evaluate(()=>{
    const cfg=window.__srCampaignPowerAuthorityConfigV478;
    cfg.addRule({id:'campaign-only-test',from:1,to:800,hpMul:0.1,damageMul:0.1});
    const type=ENEMY_TYPES[0];
    const raid=makeEnemy('raid',{type,name:'Raid',tier:'COMMUN',floor:1,x:200});
    const mega=makeEnemy('campaign',{type,name:'Mega',tier:'COMMUN',floor:5,boss:true,megaBoss:true,noFastback:true,x:200});
    return {
      raidAudit:raid.__srCampaignPowerFinalV478||null,
      megaAudit:mega.__srCampaignPowerFinalV478||null
    };
  });
  expect(out.raidAudit).toBeNull();
  expect(out.megaAudit).toBeNull();
});
