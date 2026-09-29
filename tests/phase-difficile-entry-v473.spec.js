const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srCampaignDifficultyBridgeV473 &&
    typeof makeEnemy === 'function' &&
    typeof campaignMeta === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V473 bridge maps Difficile 1-1 through 2-10 and returns smoothly to full curve', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const b = window.__srCampaignDifficultyBridgeV473;
    return {
      from:b.fromFloor,
      to:b.toFloor,
      labels:[101,105,130].map(f => campaignMeta(f).label),
      hpNormal101:b.hpMultiplier(101,false),
      hpBoss101:b.hpMultiplier(101,true),
      dmg101:b.damageMultiplier(101),
      hpBoss105:b.hpMultiplier(105,true),
      dmg105:b.damageMultiplier(105),
      hpBoss130:b.hpMultiplier(130,true),
      dmg130:b.damageMultiplier(130)
    };
  });
  expect(out.from).toBe(101);
  expect(out.to).toBe(130);
  expect(out.labels).toEqual(['Difficile · 1-1','Difficile · 1-5','Difficile · 2-10']);
  expect(out.hpNormal101).toBeCloseTo(0.52,8);
  expect(out.hpBoss101).toBeCloseTo(0.42,8);
  expect(out.dmg101).toBeCloseTo(0.50,8);
  expect(out.hpBoss105).toBeCloseTo(0.50,2);
  expect(out.dmg105).toBeCloseTo(0.56897,4);
  expect(out.hpBoss130).toBeCloseTo(1,8);
  expect(out.dmg130).toBeCloseTo(1,8);
});

test('V473 Difficile 1-5 Boss is a controlled step above Facile 5-20', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const type = ENEMY_TYPES[0];
    function bossAt(floor) {
      const e = makeEnemy('campaign', {
        type, name:'Balance test', tier:'COMMUN', floor,
        boss:true, noFastback:true, x:200
      });
      return {hp:e.maxHP,dmg:e.dmg,m:e.__srCampaignBalanceV362 || null};
    }
    return {easy:bossAt(100), hard:bossAt(105), end:bossAt(130)};
  });
  const hpRatio = out.hard.hp / out.easy.hp;
  const dmgRatio = out.hard.dmg / out.easy.dmg;
  expect(hpRatio).toBeGreaterThan(1.45);
  expect(hpRatio).toBeLessThan(1.70);
  expect(dmgRatio).toBeGreaterThan(1.45);
  expect(dmgRatio).toBeLessThan(1.75);
  expect(out.hard.m.difficileBridgeV473).toBe(true);
  expect(out.end.m.hpMul).toBeCloseTo(1,8);
  expect(out.end.m.dmgMul).toBeCloseTo(1,8);
});

test('V473 bridge multipliers never decrease inside Difficile', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const b=window.__srCampaignDifficultyBridgeV473;
    const rows=[];
    for(let f=101;f<=130;f++) rows.push({
      f,
      normalHp:b.hpMultiplier(f,false),
      bossHp:b.hpMultiplier(f,true),
      dmg:b.damageMultiplier(f)
    });
    return rows;
  });
  for(let i=1;i<out.length;i++){
    expect(out[i].normalHp).toBeGreaterThanOrEqual(out[i-1].normalHp);
    expect(out[i].bossHp).toBeGreaterThanOrEqual(out[i-1].bossHp);
    expect(out[i].dmg).toBeGreaterThanOrEqual(out[i-1].dmg);
  }
});
