const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('shadowreach.save.local');
      localStorage.removeItem('shadowreach.social.v1.messages');
    } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });
  await page.waitForFunction(() => window.__srCampaign800V322 === true);
  await page.evaluate(() => {
    if (typeof clearTutorialGuide === 'function') clearTutorialGuide();
    const card = document.getElementById('tutorialCard');
    if (card) card.remove();
    S.tutorial = null;
  });
  await expect(page.locator('#tutorialCard')).toHaveCount(0);
}

test('V322 campaign keeps 800 internal stages with five 20-stage chapters per difficulty', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const sample = [1, 4, 5, 20, 21, 100, 101, 200, 201, 300, 301, 400, 401, 500, 501, 600, 601, 700, 701, 800]
      .map((floor) => __srCampaignMeta(floor));
    return {
      maxFloor: __srCampaignMaxFloor,
      difficulties: __srCampaignDifficulties.map((d) => d.label),
      sample,
      config: {
        chaptersPerDifficulty: __srCombatProgressionConfigV285.chaptersPerDifficulty,
        floorsPerChapter: __srCombatProgressionConfigV285.floorsPerChapter,
        totalChapters: __srCombatProgressionConfigV285.totalChapters,
      },
    };
  });

  expect(result.maxFloor).toBe(800);
  expect(result.difficulties).toEqual([
    'Facile', 'Difficile', 'Expert', 'Cauchemar',
    'Infernal', 'Abyssal', 'Immortel', 'Divin',
  ]);
  expect(result.config).toEqual({ chaptersPerDifficulty: 5, floorsPerChapter: 20, totalChapters: 40 });

  const byFloor = Object.fromEntries(result.sample.map((m) => [m.floor, m]));
  expect(byFloor[1]).toMatchObject({ difficulty: 'Facile', chapter: 1, globalChapter: 1, stage: 1, stageCode: '1-1', kind: 'normal' });
  expect(byFloor[4]).toMatchObject({ difficulty: 'Facile', stage: 4, stageCode: '1-4', kind: 'elite', isElite: true });
  expect(byFloor[5]).toMatchObject({ difficulty: 'Facile', stage: 5, stageCode: '1-5', kind: 'boss', isBoss: true });
  expect(byFloor[20]).toMatchObject({ difficulty: 'Facile', chapter: 1, stage: 20, stageCode: '1-20', kind: 'boss', isBoss: true });
  expect(byFloor[21]).toMatchObject({ difficulty: 'Facile', chapter: 2, globalChapter: 2, stage: 1, stageCode: '2-1' });
  expect(byFloor[100]).toMatchObject({ difficulty: 'Facile', chapter: 5, globalChapter: 5, stageCode: '5-20', isBoss: true });
  expect(byFloor[101]).toMatchObject({ difficulty: 'Difficile', chapter: 1, globalChapter: 6, stageCode: '1-1' });
  expect(byFloor[200]).toMatchObject({ difficulty: 'Difficile', chapter: 5, globalChapter: 10, stageCode: '5-20', isBoss: true });
  expect(byFloor[301]).toMatchObject({ difficulty: 'Cauchemar', chapter: 1, globalChapter: 16, stageCode: '1-1' });
  expect(byFloor[401]).toMatchObject({ difficulty: 'Infernal', chapter: 1, globalChapter: 21, stageCode: '1-1' });
  expect(byFloor[501]).toMatchObject({ difficulty: 'Abyssal', chapter: 1, globalChapter: 26, stageCode: '1-1' });
  expect(byFloor[601]).toMatchObject({ difficulty: 'Immortel', chapter: 1, globalChapter: 31, stageCode: '1-1' });
  expect(byFloor[701]).toMatchObject({ difficulty: 'Divin', chapter: 1, globalChapter: 36, stageCode: '1-1' });
  expect(byFloor[800]).toMatchObject({ difficulty: 'Divin', chapter: 5, globalChapter: 40, stageCode: '5-20', isBoss: true });
});

test('V322 keeps the approved stage-800 endpoints while applying the early Facile HP resistance', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => ({
    first: { hp: __srV285EnemyHP(1), dmg: __srV289EnemyDamage(1) },
    final: { hp: __srV285EnemyHP(800), boss: __srV285BossHP(800), dmg: __srV289EnemyDamage(800) },
    mid: { hp: __srV285EnemyHP(400), boss: __srV285BossHP(400), dmg: __srV289EnemyDamage(400) },
  }));
  expect(result.first).toEqual({ hp: 24, dmg: 2 });
  expect(result.final).toEqual({ hp: 320000000000, boss: 6000000000000, dmg: 2300000000 });
  expect(result.mid.hp).toBeGreaterThan(result.first.hp);
  expect(result.mid.hp).toBeLessThan(result.final.hp);
  expect(result.mid.boss).toBeGreaterThan(result.mid.hp);
  expect(result.mid.dmg).toBeGreaterThan(result.first.dmg);
  expect(result.mid.dmg).toBeLessThan(result.final.dmg);
});

test('V322 final Divin boss uses final boss HP authority', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    const floor = 800;
    const def = bossFor(floor);
    const type = Object.assign({}, ENEMY_TYPES[0], { id:'v322-final-'+def.id, name:def.name, img:def.img, ranged:!!def.ranged, proj:def.proj||'magic' });
    const enemy = makeEnemy('campaign', { type, name:type.name, tier:def.tier, floor, boss:true, abils:def.abils, noFastback:true, x:AW-60 });
    return { hp: enemy.maxHP, damage: enemy.dmg, expectedHp: __srV285BossHP(800) };
  });
  expect(result.hp).toBe(result.expectedHp);
  expect(result.hp).toBe(6000000000000);
  expect(result.damage).toBeGreaterThan(0);
});

test('V322 Home arena shows difficulty plus local 20-stage chapter notation', async ({ page }) => {
  await openCleanGame(page);
  await page.evaluate(() => {
    update((st) => { st.floor=301; st.step=1; st.recordFloor=Math.max(Number(st.recordFloor)||1,301); st.pendingBossFloor=0; });
    combat=spawnCampaign(S); nav('accueil'); scheduleRender();
  });
  await expect(page.locator('#aLabel')).toHaveText('Cauchemar · 1-1', { timeout: 5000 });
});

test('V322 final Boss completion stays on replayable Divin 5-20 without creating stage 801', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    update((st) => {
      st.migrations = st.migrations || {}; st.migrations.campaign800V322 = true;
      st.floor=800; st.step=1; st.recordFloor=799; st.checkpoint=795; st.pendingBossFloor=0;
      st.bossClears=st.bossClears||{}; st.bossRewardsClaimed=st.bossRewardsClaimed||{};
    });
    const c=spawnCampaign(S); c.ctx='campaign'; c.floor=800; c.boss=true; c.status='won'; handleCombatEnd(c);
    return { floor:S.floor, step:S.step, recordFloor:S.recordFloor, checkpoint:S.checkpoint, complete:S.campaignComplete800, boss800:!!S.bossClears['800'], label:__srCampaignLabel(S.floor), stage:__srCampaignStageLabel(S.floor) };
  });
  expect(result).toEqual({ floor:800, step:1, recordFloor:800, checkpoint:800, complete:true, boss800:true, label:'Divin · 5-20', stage:'5-20' });
  await page.waitForTimeout(100);
  const stable=await page.evaluate(() => ({ floor:S.floor, combatFloor:combat&&combat.floor }));
  expect(stable.floor).toBe(800);
  expect(stable.combatFloor).toBe(800);
});
