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

test('V467 keeps Roman thresholds and doubles every Equipment Mastery Dust reward', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => ({
    tiers:EQUIPMENT_MASTERY_TIERS.map(t => [t.need,t.roman,t.bonusPct,t.rewardDust]),
    at299:equipmentMasteryInfoFromCount(299),
    at300:equipmentMasteryInfoFromCount(300),
    at600:equipmentMasteryInfoFromCount(600)
  }));
  expect(out.tiers).toEqual([
    [0,'—',0,0],[100,'I',10,100],[300,'II',20,200],[600,'III',30,300],
    [1000,'IV',40,400],[1500,'V',50,500],[2500,'VI',60,600],
    [4000,'VII',70,700],[6500,'VIII',75,800],[10000,'IX',80,900]
  ]);
  expect(out.at299).toMatchObject({rank:1,roman:'I',nextRoman:'II',nextRewardDust:200});
  expect(out.at300).toMatchObject({rank:2,roman:'II',rewardDust:200,nextRoman:'III',nextRewardDust:300});
  expect(out.at600).toMatchObject({rank:3,roman:'III',rewardDust:300});
});

test('V467 gives a never-paid rank-II save the current doubled rewards once', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    const raw=defaultState('Legacy II');
    raw.forge.lifetimeCount=304;
    raw.forge.summonCount=304;
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
  expect(out.first).toEqual({dust:317,claimed:2,version:467,roman:'II'});
  expect(out.second).toEqual({dust:317,claimed:2,version:467});
});

test('V464 respects partial historical claim state and only pays the missing rank', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    const raw=defaultState('Partial');
    raw.forge.lifetimeCount=304;
    raw.forge.summonCount=304;
    raw.forge.masteryDustClaimedRank=1;
    raw.forge.masteryDustRewardVersion=449;
    raw.poussiere=20;
    const migrated=migrate(raw,'Partial');
    return {dust:migrated.poussiere,claimed:migrated.forge.masteryDustClaimedRank,version:migrated.forge.masteryDustRewardVersion};
  });
  expect(out).toEqual({dust:220,claimed:2,version:467});
});

test('V467 paid Forge crossing I -> II grants +200 Dust and cannot double-pay', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    S.forge.lifetimeCount=299;
    S.forge.summonCount=299;
    S.forge.masteryDustClaimedRank=1;
    S.forge.masteryDustRewardVersion=467;
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
    dustAfterCross:200,
    claimedAfterCross:2,
    replayDust:0,
    dustAfterReplay:200
  });
});

test('V467 Forge panel previews the doubled next Roman-rank Dust reward', async ({ page }) => {
  await clean(page);
  await page.evaluate(() => {
    S.forge.lifetimeCount=304;
    S.forge.masteryDustClaimedRank=2;
    nav('accueil');
    render();
  });
  await expect(page.locator('#homeForge')).toContainText('MAÎTRISE ÉQUIPEMENT II');
  await expect(page.locator('#homeForge')).toContainText('+20% base');
  await expect(page.locator('#homeForge')).toContainText('→ III · +300 poussières');
});
