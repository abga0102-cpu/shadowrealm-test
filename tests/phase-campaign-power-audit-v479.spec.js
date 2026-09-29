const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path'),crypto=require('crypto');

const PRE_V478_V465_BLOB='450cd7820689c93de637a1ccad9ef99c99fa0318';

function gitBlobSha(text){
  const body=Buffer.from(text,'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([
    Buffer.from('blob '+body.length+'\0','utf8'),body
  ])).digest('hex');
}

async function openCleanGame(page){
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srCampaignEarlyRebalanceConfigV449 &&
    typeof makeEnemy === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V479 restores campaign-early-rebalance byte-for-byte to the pre-V478 V465 runtime', async()=>{
  const root=path.join(__dirname,'..');
  const src=fs.readFileSync(path.join(root,'campaign-early-rebalance-v449.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  expect(gitBlobSha(src)).toBe(PRE_V478_V465_BLOB);
  expect(src).toContain('if(!m.band)return enemy;');
  expect(src).not.toContain('FINAL_RULES');
  expect(src).not.toContain('__srCampaignPowerFinalV478');
  expect(src).not.toContain('__srCampaignPowerAuthorityConfigV478');
  expect(index).toContain('shadowreach-build" content="2026.09.29.479"');
  expect(index).toContain('campaign-early-rebalance-v449.js?v=2026.09.29.479a');
});

test('V479 audit samples final Campaign values without replacing makeEnemy', async({page})=>{
  await openCleanGame(page);
  const out=await page.evaluate(()=>{
    const original=makeEnemy;
    const type=ENEMY_TYPES[0];
    const floors=[1,2,5,20,40,50,75,84,85,86,99,100,101,105,107,130,150];
    const rows=floors.map(f=>{
      const boss=(f%5===0);
      const e=makeEnemy('campaign',{type,name:'V479 audit',tier:'COMMUN',floor:f,boss,x:200});
      return {
        floor:f,boss,
        hp:e.maxHP,damage:e.dmg,
        early:e.__srCampaignEarlyRebalanceV449||null,
        bridge:e.__srCampaignBalanceV362||null
      };
    });
    return {
      sameFunction:original===makeEnemy,
      hasV478Runtime:!!window.__srCampaignPowerAuthorityConfigV478,
      rows
    };
  });
  expect(out.sameFunction).toBe(true);
  expect(out.hasV478Runtime).toBe(false);
  expect(out.rows.find(r=>r.floor===50).early).toMatchObject({hpMul:0.60,dmgMul:1.60,band:1});
  expect(out.rows.find(r=>r.floor===85).early).toMatchObject({hpMul:0.70,dmgMul:0.85,band:2});
  expect(out.rows.find(r=>r.floor===86).early).toMatchObject({hpMul:0.70,dmgMul:0.70,band:2});
  expect(out.rows.find(r=>r.floor===100).early).toBeNull();
  expect(out.rows.find(r=>r.floor===105).early).toBeNull();
  expect(out.rows.find(r=>r.floor===105).bridge).not.toBeNull();
});

test('V479 power audit remains test-only: Raid and Mega construction have no audit state', async({page})=>{
  await openCleanGame(page);
  const out=await page.evaluate(()=>{
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
