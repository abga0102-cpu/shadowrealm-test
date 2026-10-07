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

test('V496 Familiar Raid Essence is 225, +5 to 275, then +2 through 393', async ({ page }) => {
  await openCleanGame(page);
  const rewards = await page.evaluate(() => [1,10,11,12,20,50,70].map((lv) => raidReward('familier',lv)));
  expect(rewards).toEqual([225,270,275,277,293,353,393]);
  const cfg = await page.evaluate(() => window.__srRaidRewardConfigV396.familier);
  expect(cfg).toMatchObject({level1:225,level11:275,perLevelAfter11:2,level70:393});
});

test('V496 Raid Or and Compétence rewards follow the new anchors', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => ({
    gold:[1,10,15,20,21].map((lv)=>raidReward('or',lv)),
    skill:[1,2,10].map((lv)=>raidReward('competence',lv)),
    cfg:window.__srRaidRewardConfigV396
  }));
  expect(out.gold).toEqual([5000,10000,20000,30000,31500]);
  expect(out.skill).toEqual([300,310,390]);
  expect(out.cfg.or).toMatchObject({level1:5000,level10:10000,level15:20000,level20:30000,growthAfter20:1.05});
  expect(out.cfg.competence).toMatchObject({level1:300,perLevel:10});
});

test('V486 Raid Evolution PE is 150, +10 through level 14, then +5 through level 70', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => ({
    rewards:[1,2,10,14,15,20,50,70,71].map((lv)=>raidReward('evolution',lv)),
    cfg:window.__srRaidRewardConfigV396.evolution
  }));
  expect(out.rewards).toEqual([150,160,240,280,285,310,460,560,560]);
  expect(out.cfg).toMatchObject({
    curveVersion:486,level1:150,perLevelTo14:10,level14:280,
    perLevelFrom15:5,level15:285,level70:560
  });
});

test('V502 Raid keys reset at 01:00 local time and not before', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const before = new Date(2026, 9, 8, 0, 59, 59, 999);
    const at = new Date(2026, 9, 8, 1, 0, 0, 0);
    const s = JSON.parse(JSON.stringify(S));
    s.lastKeyReset = raidKeyResetDayKey(before);
    RAID_IDS.forEach((id) => { s.raids[id].keys = 0; });
    const beforeApplied = applyRaidKeyReset(s, before.getTime());
    const keysBefore = RAID_IDS.map((id) => s.raids[id].keys);
    const atApplied = applyRaidKeyReset(s, at.getTime());
    const keysAt = RAID_IDS.map((id) => s.raids[id].keys);
    return {
      beforeKey: raidKeyResetDayKey(before.getTime()),
      atKey: raidKeyResetDayKey(at.getTime()),
      beforeApplied, keysBefore, atApplied, keysAt
    };
  });
  expect(out.beforeKey).toBe('2026-10-07');
  expect(out.atKey).toBe('2026-10-08');
  expect(out.beforeApplied).toBe(false);
  expect(out.keysBefore).toEqual([0,0,0,0,0]);
  expect(out.atApplied).toBe(true);
  expect(out.keysAt).toEqual([2,2,2,2,2]);
});

test('V500 Minerai catch-up adds only the old-to-new difference and cannot be claimed twice', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const comp=window.__shadowreachRaidMineraiBalance.compensation;
    const st=JSON.parse(JSON.stringify(S));
    st.minerai=2000;
    st.raids.minerai.record=21;
    delete st.raidMineraiDifferenceCompensationV500;
    const first=comp.apply(st);
    const afterFirst=st.minerai;
    const second=comp.apply(st);
    return {first,afterFirst,second,marker:st.raidMineraiDifferenceCompensationV500};
  });
  expect(out.first).toMatchObject({applied:true,amount:11875,throughLevel:21});
  expect(out.afterFirst).toBe(13875);
  expect(out.second).toMatchObject({applied:false,amount:0});
  expect(out.marker).toMatchObject({done:true,throughLevel:21,amount:11875,curveFrom:496,curveTo:499});
});

test('V499 Minerai Raid starts at 1000, reaches 2000/2500/2800, then +5; Autonomy stays 10%', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const levels=[1,5,10,20,21,40,41,60,61,62,70];
    const rewards=levels.map((lv) => raidReward('minerai',lv));
    const cfg=window.__srRaidRewardConfigV396.minerai;
    const st=JSON.parse(JSON.stringify(S));
    st.tree={levels:{},active:null,activeLevel:0,activeEnd:0};
    st.raids.minerai.level=70;
    const baseAutonomy=harvestRates(st).minerai;
    return {rewards,cfg,baseAutonomy};
  });
  expect(out.rewards).toEqual([1000,1200,1450,1950,2000,2475,2500,2785,2800,2805,2845]);
  expect(out.cfg).toMatchObject({
    level1:1000,perLevelTo2000:50,level21:2000,
    perLevelTo2500:25,level41:2500,
    perLevelTo2800:15,level61:2800,
    perLevelAfter2800:5,level70:2845
  });
  expect(out.baseAutonomy).toBeCloseTo(284.5,8);
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

test('V496 Raid difficulty is +15 points through level 15, then +10 points every 5 levels from 20', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const levels=[1,4,5,9,10,14,15,20,40,50,69,70];
    const rows=levels.map(lv=>({
      lv,
      hp:raidWaveHP('familier',lv),
      dmg:raidWaveDamage('familier',lv),
      ref:raidReferenceCampaignFloor(lv),
      mul:window.__srRaidCampaignLinkedV444.powerStepV496.multiplier(lv)
    }));
    return {
      rows,
      cap:window.__srRaidCampaignLinkedV444.growthCap,
      step:window.__srRaidCampaignLinkedV444.powerStepV496,
      compat:window.__srRaidCampaignLinkedV444.powerStepV485
    };
  });
  expect(out.cap).toBeNull();
  expect(out.step).toMatchObject({
    everyLevels:5,addPctBefore20:15,addPctFrom20:10,level70Multiplier:2.55,campaignReferenceAffectsPower:false
  });
  expect(out.compat).toMatchObject({addPctBefore20:15,addPctFrom20:10,level70Multiplier:2.55,supersededBy:496});
  const expected=[1,1,1.15,1.15,1.30,1.30,1.45,1.55,1.95,2.15,2.45,2.55];
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
