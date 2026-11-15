const { test, expect } = require('@playwright/test');

async function clean(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srFusionMilestoneRewardsV468Api &&
    window.__srAccomplishmentsCanonicalV139 &&
    typeof ACT !== 'undefined' &&
    typeof ACT.accomplishments === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V468 pays the five requested free Fusion milestones in Minerai exactly once', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    S.sanctuary = S.sanctuary || {};
    S.sanctuary.mergeCrafts = 500;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = {};
    S.accomplishments.premiumClaimed = {};
    S.minerai = 0;
    S.gold = 0;
    const api = window.__srFusionMilestoneRewardsV468Api;
    const ids = ['fusion50','fusion150','fusion250','fusion350','fusion500'];
    const gains = [];
    let before = S.minerai;
    ids.forEach(id => {
      const ok = api.claim(id,false);
      gains.push({id,ok,gain:S.minerai-before});
      before = S.minerai;
    });
    const repeat = api.claim('fusion50',false);
    return {gains,minerai:S.minerai,gold:S.gold,repeat,claimed:{...S.accomplishments.claimed}};
  });
  expect(out.gains).toEqual([
    {id:'fusion50',ok:true,gain:500},
    {id:'fusion150',ok:true,gain:750},
    {id:'fusion250',ok:true,gain:1000},
    {id:'fusion350',ok:true,gain:1500},
    {id:'fusion500',ok:true,gain:2000},
  ]);
  expect(out.minerai).toBe(5750);
  expect(out.gold).toBe(0);
  expect(out.repeat).toBe(false);
  expect(out.claimed).toMatchObject({fusion50:true,fusion150:true,fusion250:true,fusion350:true,fusion500:true});
});

test('V468 keeps Premium Fusion rewards in Gold', async ({ page }) => {
  await clean(page);
  const out = await page.evaluate(() => {
    S.sanctuary = S.sanctuary || {};
    S.sanctuary.mergeCrafts = 500;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = {};
    S.accomplishments.premiumClaimed = {};
    S.accomplishments.premiumPassOwned = true;
    S.minerai = 0;
    S.gold = 0;
    const api = window.__srFusionMilestoneRewardsV468Api;
    ['fusion50','fusion150','fusion250','fusion350','fusion500'].forEach(id => api.claim(id,true));
    return {gold:S.gold,minerai:S.minerai,premiumClaimed:{...S.accomplishments.premiumClaimed}};
  });
  expect(out.gold).toBe(160000);
  expect(out.minerai).toBe(0);
  expect(out.premiumClaimed).toMatchObject({fusion50:true,fusion150:true,fusion250:true,fusion350:true,fusion500:true});
});

test('V468 Accomplishments UI shows the Minerai ladder and unchanged Premium Gold', async ({ page }) => {
  await clean(page);
  await page.evaluate(() => {
    S.sanctuary = S.sanctuary || {};
    S.sanctuary.mergeCrafts = 0;
    ACT.accomplishments();
  });
  await page.locator('.srAch139 [data-ach-tab="defis"]').click();
  const rows = page.locator('.srAch139 .achPassRow');
  const expected = new Map([
    ['50 Fusions',['500 Minéraux','10 000 Or']],
    ['150 Fusions',['750 Minéraux','20 000 Or']],
    ['250 Fusions',['1 000 Minéraux','30 000 Or']],
    ['350 Fusions',['1 500 Minéraux','40 000 Or']],
    ['500 Fusions',['2 000 Minéraux','60 000 Or']],
  ]);
  for (const [title,rewards] of expected) {
    const row = rows.filter({hasText:title}).first();
    await expect(row).toContainText(rewards[0]);
    await expect(row).toContainText(rewards[1]);
  }
});
