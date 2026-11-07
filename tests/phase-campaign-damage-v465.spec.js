const { test, expect } = require('@playwright/test');

async function boot(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srCampaignEarlyRebalanceConfigV449?.version === 483 &&
    typeof makeEnemy === 'function' &&
    typeof bossFor === 'function' &&
    typeof eliteFor === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

function stageFactorySource() {
  return () => {
    function enemyAt(floor) {
      const boss = isBoss(floor);
      const elite = !boss && isElite(floor);
      if (boss) {
        const def = bossFor(floor);
        const type = Object.assign({}, ENEMY_TYPES[1], {
          id:def.id,name:def.name,img:def.img,ranged:!!def.ranged,proj:def.proj||'magic'
        });
        return makeEnemy('campaign', {
          type,name:def.name,tier:def.tier,floor,boss:true,abils:def.abils,x:260
        });
      }
      if (elite) {
        const def = eliteFor(floor);
        const base = typeById(def.base);
        const type = Object.assign({}, base, {
          id:def.id,name:def.name,img:def.img,
          ranged:!!def.ranged,proj:def.proj||base.proj
        });
        return makeEnemy('campaign', {
          type,name:def.name,tier:def.tier,floor,elite:true,abil:def.ability,x:260
        });
      }
      const type = Object.assign({}, ENEMY_TYPES[1]);
      return makeEnemy('campaign', {
        type,name:type.name,tier:'MYTHIQUE',floor,x:260
      });
    }
    return [84,85,86,89,90,94,95,99,100].map(f => {
      const e=enemyAt(f);
      return {floor:f,label:window.__srCampaignLabel(f),boss:!!e.boss,elite:!!e.elite,dmg:e.dmg,hp:e.maxHP,
        rebalance:e.__srCampaignEarlyRebalanceV449||null};
    });
  };
}

test('V465 keeps 5-5 stronger than 5-4, then applies full -30% after the Boss', async ({ page }) => {
  await boot(page);
  const rows = await page.evaluate(stageFactorySource());
  const byFloor = Object.fromEntries(rows.map(r => [r.floor,r]));

  expect(byFloor[85].dmg).toBeGreaterThan(byFloor[84].dmg);
  expect(byFloor[85].rebalance).toMatchObject({floor:85,hpMul:0.70,dmgMul:0.85,band:2});
  expect(byFloor[86].rebalance).toMatchObject({floor:86,hpMul:0.70,dmgMul:0.70,band:2});
});

test('V465 keeps later pre-Boss steps coherent and 5-20 resumes the uncut curve', async ({ page }) => {
  await boot(page);
  const rows = await page.evaluate(stageFactorySource());
  const byFloor = Object.fromEntries(rows.map(r => [r.floor,r]));

  expect(byFloor[90].dmg).toBeGreaterThan(byFloor[89].dmg);
  expect(byFloor[95].dmg).toBeGreaterThan(byFloor[94].dmg);
  expect(byFloor[100].dmg).toBeGreaterThan(byFloor[99].dmg);
  expect(byFloor[99].rebalance.dmgMul).toBe(0.70);
  expect(byFloor[100].rebalance).toBeNull();
});

test('V465 config exposes the 5-5 continuity guard and full reduction from 5-6', async ({ page }) => {
  await boot(page);
  const cfg = await page.evaluate(() => {
    const c=window.__srCampaignEarlyRebalanceConfigV449;
    return {
      version:c.version,
      second:c.second,
      m85:c.multipliers(85),
      m86:c.multipliers(86),
      m99:c.multipliers(99),
      m100:c.multipliers(100),
      postBoss86:c.postBossException(86)
    };
  });
  expect(cfg.version).toBe(483);
  expect(cfg.second).toMatchObject({
    from:85,to:99,hpMul:0.70,damageMul:0.70,
    entryFloor:85,entryDamageMul:0.85,fullDamageFrom:86
  });
  expect(cfg.m85).toMatchObject({hp:0.70,dmg:0.85,band:2,continuityGuard:true});
  expect(cfg.m86).toMatchObject({hp:0.70,dmg:0.70,band:2});
  expect(cfg.m99).toMatchObject({hp:0.70,dmg:0.70,band:2});
  expect(cfg.m100).toMatchObject({hp:1,dmg:1,band:0});
  expect(cfg.postBoss86).toBe(true);
});
