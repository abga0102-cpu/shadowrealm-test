const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof S !== 'undefined' &&
    window.__srRaidCampaignLinkedV444 &&
    window.__srRaidRewardConfigV396
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V444 links the 70 Raid levels to Campaign progression and retires Raid Ascension', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => ({
    max: RULES.RAID_MAX_LEVEL,
    ascendMax: RULES.RAID_ASCEND_MAX_STARS,
    labels: [1,10,11,21,70].map(raidLevelLabel),
    refs: [1,10,11,21,70].map(raidReferenceCampaignFloor),
    refLabels: [1,11,21,70].map(raidReferenceCampaignLabel),
    ascend: canAscendRaid(S,'familier'),
    ascendDo: doAscendRaid('familier'),
  }));
  expect(out.max).toBe(70);
  expect(out.ascendMax).toBe(0);
  expect(out.labels).toEqual(['1-1','1-10','2-1','3-1','7-10']);
  expect(out.refs).toEqual([22,40,62,102,280]);
  expect(out.refLabels[0]).toContain('Facile 2-2');
  expect(out.refLabels[1]).toContain('Facile 4-2');
  expect(out.refLabels[2]).toContain('Difficile 1-2');
  expect(out.refLabels[3]).toContain('Expert 4-20');
  expect(out.ascend).toBe(false);
  expect(out.ascendDo).toMatchObject({ ok:false, retired:true });
});

test('V444 Familiar Raid Essence is 200, +5 to 250, then +2 through 368', async ({ page }) => {
  await openCleanGame(page);
  const rewards = await page.evaluate(() => [1,10,11,12,20,50,70].map((lv) => raidReward('familier',lv)));
  expect(rewards).toEqual([200,245,250,252,268,328,368]);
  const cfg = await page.evaluate(() => window.__srRaidRewardConfigV396.familier);
  expect(cfg).toMatchObject({level1:200,level11:250,perLevelAfter250:2,level70:368});
});

test('V471 Minerai Raid uses +25 to 10, +10 to 50, then +5; Autonomy follows it', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const levels=[1,5,10,11,20,50,51,70];
    const rewards=levels.map((lv) => raidReward('minerai',lv));
    const cfg=window.__srRaidRewardConfigV396.minerai;
    const st=JSON.parse(JSON.stringify(S));
    st.tree={levels:{},active:null,activeLevel:0,activeEnd:0};
    st.raids.minerai.level=70;
    const baseAutonomy=harvestRates(st).minerai;
    return {rewards,cfg,baseAutonomy};
  });
  expect(out.rewards).toEqual([500,600,725,735,825,1125,1130,1225]);
  expect(out.cfg).toMatchObject({curveVersion:471,level1:500,perLevelTo10:25,level10:725,perLevelTo50:10,level50:1125,perLevelAfter50:5,level70:1225});
  expect(out.baseAutonomy).toBeCloseTo(61.25,8);
});

test('V444 Campaign gate follows the agreed 2x mapping', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const s = JSON.parse(JSON.stringify(S));
    s.recordFloor = 61;
    const before = raidCampaignReady(s,11);
    s.recordFloor = 62;
    const at = raidCampaignReady(s,11);
    s.recordFloor = 279;
    const maxBefore = raidCampaignReady(s,70);
    s.recordFloor = 280;
    const maxAt = raidCampaignReady(s,70);
    return {before,at,maxBefore,maxAt};
  });
  expect(out).toEqual({before:false,at:true,maxBefore:false,maxAt:true});
});

test('V444 migrates old Raid stars into linear progress without deleting evidence', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const raw = JSON.parse(JSON.stringify(S));
    delete raw.raidAscensionRetiredV444;
    raw.raids.familier = {level:20,keys:2,record:50,stars:1};
    const m = migrate(raw,'Migration V444');
    return {
      level:m.raids.familier.level,
      record:m.raids.familier.record,
      stars:m.raids.familier.stars,
      legacy:m.raids.familier.legacyRaidProgressV444,
      marker:m.raidAscensionRetiredV444
    };
  });
  expect(out).toEqual({
    level:70, record:69, stars:0,
    legacy:{level:20,record:50,stars:1},
    marker:true
  });
});

test('V485 Raid difficulty is +7.5% every 5 levels; Campaign references are context only', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const levels=[1,4,5,9,10,14,15,20,40,50,69,70];
    const rows=levels.map(lv=>({
      lv,
      hp:raidWaveHP('familier',lv),
      dmg:raidWaveDamage('familier',lv),
      ref:raidReferenceCampaignFloor(lv),
      mul:window.__srRaidCampaignLinkedV444.powerStepV485.multiplier(lv)
    }));
    return {
      rows,
      cap:window.__srRaidCampaignLinkedV444.growthCap,
      step:window.__srRaidCampaignLinkedV444.powerStepV485,
      compat:window.__srRaidCampaignLinkedV444.powerStepV484
    };
  });
  expect(out.cap).toBeNull();
  expect(out.step).toMatchObject({
    everyLevels:5,addPct:7.5,level70Multiplier:2.05,campaignReferenceAffectsPower:false
  });
  expect(out.compat).toMatchObject({addPct:7.5,level70Multiplier:2.05,supersededBy:485});
  const expected=[1,1,1.075,1.075,1.15,1.15,1.225,1.30,1.60,1.75,1.975,2.05];
  out.rows.forEach((r,i)=>expect(r.mul).toBeCloseTo(expected[i],10));
  const baseHP=out.rows[0].hp,baseDmg=out.rows[0].dmg;
  for(const r of out.rows){
    expect(r.hp/baseHP).toBeCloseTo(r.mul,8);
    expect(r.dmg/baseDmg).toBeCloseTo(r.mul,8);
  }
  expect(out.rows[2].ref).toBeGreaterThan(out.rows[1].ref);
  expect(out.rows[out.rows.length-1].ref).toBe(280);
});


test('V444 shows chapter notation in local Raid records', async ({ page }) => {
  await openCleanGame(page);
  await page.evaluate(() => {
    S.raids.familier.record = 11;
    nav('classement');
    render();
  });
  await expect(page.locator('#screen')).toContainText('niv. 2-1');
});
