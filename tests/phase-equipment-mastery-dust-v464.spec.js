const { test, expect } = require('@playwright/test');

async function clean(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof S !== 'undefined' &&
    typeof claimEquipmentMasteryDustRewards === 'function' &&
    window.__srForgeLifetimeMasteryV445 &&
    window.__srForgeLifetimeMasteryV445.info
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V474 uses the new Roman thresholds and adds +50 Dust to each reward', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => ({
    tiers:EQUIPMENT_MASTERY_TIERS.map(t => [t.need,t.roman,t.bonusPct,t.rewardDust]),
    at599:equipmentMasteryInfoFromCount(599),
    at600:equipmentMasteryInfoFromCount(600),
    at1200:equipmentMasteryInfoFromCount(1200)
  }));
  expect(out.tiers).toEqual([
    [0,'—',0,0],[200,'I',30,150],[600,'II',60,250],[1200,'III',90,350],
    [2500,'IV',120,450],[5000,'V',140,550],[10000,'VI',160,650],
    [20000,'VII',180,750],[30000,'VIII',200,850],[40000,'IX',220,950],
    [50000,'X',240,1050]
  ]);
  expect(out.at599).toMatchObject({rank:1,roman:'I',nextRoman:'II',nextRewardDust:250});
  expect(out.at600).toMatchObject({rank:2,roman:'II',rewardDust:250,nextRoman:'III',nextRewardDust:350});
  expect(out.at1200).toMatchObject({rank:3,roman:'III',rewardDust:350});
});

test('V474 gives a never-paid rank-II save the new rewards once', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    const raw=defaultState('Legacy II');
    raw.forge.lifetimeCount=604;
    raw.forge.summonCount=604;
    raw.poussiere=17;
    delete raw.forge.masteryDustClaimedRank;
    delete raw.forge.masteryDustRewardVersion;
    const first=migrate(raw,'Legacy II');
    const second=migrate(JSON.parse(JSON.stringify(first)),'Legacy II again');
    return {
      first:{dust:first.poussiere,claimed:first.forge.masteryDustClaimedRank,version:first.forge.masteryDustRewardVersion,roman:equipmentMasteryInfoFromCount(first.forge.lifetimeCount).roman},
      second:{dust:second.poussiere,claimed:second.forge.masteryDustClaimedRank,version:second.forge.masteryDustRewardVersion}
    };
  });
  expect(out.first).toEqual({dust:417,claimed:2,version:474,roman:'II'});
  expect(out.second).toEqual({dust:417,claimed:2,version:474});
});

test('V464 respects partial historical claim state and only pays the missing rank', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    const raw=defaultState('Partial');
    raw.forge.lifetimeCount=604;
    raw.forge.summonCount=604;
    raw.forge.masteryDustClaimedRank=1;
    raw.forge.masteryDustRewardVersion=449;
    raw.poussiere=20;
    const migrated=migrate(raw,'Partial');
    return {dust:migrated.poussiere,claimed:migrated.forge.masteryDustClaimedRank,version:migrated.forge.masteryDustRewardVersion};
  });
  expect(out).toEqual({dust:320,claimed:2,version:474});
});

test('V474 paid Forge crossing I -> II grants +250 Dust and cannot double-pay', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    S.forge.lifetimeCount=599;
    S.forge.summonCount=599;
    S.forge.masteryDustClaimedRank=1;
    S.forge.masteryDustRewardVersion=474;
    S.forge.masteryDustPaidTotal=150;
    S.poussiere=0;
    S.minerai=100000;
    S.forge.filter=false;
    const before=equipmentMasteryInfo(S);
    forgeSummon(1);
    const after=equipmentMasteryInfo(S);
    const dustAfterCross=S.poussiere;
    const claimedAfterCross=S.forge.masteryDustClaimedRank;
    const replay=claimEquipmentMasteryDustRewards(S);
    return {before:{rank:before.rank,roman:before.roman},after:{rank:after.rank,roman:after.roman},dustAfterCross,claimedAfterCross,replayDust:replay.dust,dustAfterReplay:S.poussiere};
  });
  expect(out).toEqual({
    before:{rank:1,roman:'I'},
    after:{rank:2,roman:'II'},
    dustAfterCross:250,
    claimedAfterCross:2,
    replayDust:0,
    dustAfterReplay:250
  });
});

test('V474 remaps an old IX save without replaying already-paid Dust', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    const raw=defaultState('Legacy IX');
    raw.forge.lifetimeCount=10000;
    raw.forge.summonCount=10000;
    raw.forge.masteryDustClaimedRank=9;
    raw.forge.masteryDustRewardVersion=467;
    delete raw.forge.masteryDustPaidTotal;
    raw.poussiere=0;
    const migrated=migrate(raw,'Legacy IX V474');
    const at10k={dust:migrated.poussiere,rank:equipmentMasteryInfo(migrated).rank,claimed:migrated.forge.masteryDustClaimedRank,paid:migrated.forge.masteryDustPaidTotal};
    migrated.forge.lifetimeCount=40000;
    const at40=claimEquipmentMasteryDustRewards(migrated);
    migrated.forge.lifetimeCount=50000;
    const at50=claimEquipmentMasteryDustRewards(migrated);
    return {at10k,at40,at50,total:migrated.poussiere};
  });
  expect(out.at10k).toEqual({dust:0,rank:6,claimed:6,paid:4500});
  expect(out.at40.dust).toBe(450);
  expect(out.at50.dust).toBe(1050);
  expect(out.total).toBe(1500);
});

test('V474 Forge panel previews the next Roman-rank Dust reward', async ({ page }) => {
  await clean(page);
  await page.evaluate(() => {
    S.forge.lifetimeCount=604;
    S.forge.masteryDustClaimedRank=2;
    S.forge.masteryDustPaidTotal=400;
    nav('accueil');
    render();
  });
  await expect(page.locator('#homeForge')).toContainText('MAÎTRISE ÉQUIPEMENT II');
  await expect(page.locator('#homeForge')).toContainText('+60% base');
  await expect(page.locator('#homeForge')).toContainText('→ III · +350 poussières');
});
