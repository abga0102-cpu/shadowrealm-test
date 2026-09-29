const { test, expect } = require('@playwright/test');
const fs=require('fs');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srCampaignEarlyRebalanceConfigV449?.version === 465 &&
    typeof makeEnemy === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V479 removes every V478 runtime Campaign observer/rule hook', async()=>{
  const src=fs.readFileSync('campaign-early-rebalance-v449.js','utf8');
  const html=fs.readFileSync('index.html','utf8');
  expect(src).not.toContain('__srCampaignPowerAuthorityV478');
  expect(src).not.toContain('__srCampaignPowerFinalV478');
  expect(src).not.toContain('FINAL_RULES');
  expect(src).not.toContain('addRule:function');
  expect(src).toContain('if(!m.band)return enemy;');
  expect(html).toContain('shadowreach-build" content="2026.09.29.479"');
  expect(html).toContain('campaign-early-rebalance-v449.js?v=2026.09.29.479a');
});

test('V479 runtime exposes only the historical V465 early rebalance marker', async ({page})=>{
  await openCleanGame(page);
  const out=await page.evaluate(()=>{
    const type=ENEMY_TYPES[0];
    const early=makeEnemy('campaign',{type,name:'early',tier:'COMMUN',floor:50,x:200});
    const endEasy=makeEnemy('campaign',{type,name:'end',tier:'COMMUN',floor:100,x:200});
    const difficult=makeEnemy('campaign',{type,name:'difficult',tier:'COMMUN',floor:105,x:200});
    return {
      earlyLegacy:early.__srCampaignEarlyRebalanceV449||null,
      earlyV478:early.__srCampaignPowerFinalV478||null,
      endLegacy:endEasy.__srCampaignEarlyRebalanceV449||null,
      endV478:endEasy.__srCampaignPowerFinalV478||null,
      difficultLegacy:difficult.__srCampaignEarlyRebalanceV449||null,
      difficultV478:difficult.__srCampaignPowerFinalV478||null
    };
  });
  expect(out.earlyLegacy).toMatchObject({floor:50,hpMul:0.60,dmgMul:1.60,band:1});
  expect(out.earlyV478).toBeNull();
  expect(out.endLegacy).toBeNull();
  expect(out.endV478).toBeNull();
  expect(out.difficultLegacy).toBeNull();
  expect(out.difficultV478).toBeNull();
});

test('V479 keeps V473 Difficile bridge intact while removing V478 observation', async ({page})=>{
  await openCleanGame(page);
  const out=await page.evaluate(()=>{
    const type=ENEMY_TYPES[0];
    const e=makeEnemy('campaign',{type,name:'bridge',tier:'COMMUN',floor:105,x:200});
    return {
      bridge:e.__srCampaignBalanceV362||null,
      v478:e.__srCampaignPowerFinalV478||null,
      hp:e.maxHP,dmg:e.dmg
    };
  });
  expect(out.bridge).not.toBeNull();
  expect(out.bridge.difficileBridgeV473).toBe(true);
  expect(out.v478).toBeNull();
  expect(out.hp).toBeGreaterThan(0);
  expect(out.dmg).toBeGreaterThan(0);
});
