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
  await page.waitForFunction(() => window.__srCampaign400V314 === true);
}

test('V314 campaign is exactly 8 difficulties x 5 chapters x 10 stages with global 1-1 .. 40-10 notation', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const sample = [1, 10, 11, 50, 51, 100, 101, 150, 151, 200, 201, 250, 251, 300, 301, 350, 351, 400]
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

  expect(result.maxFloor).toBe(400);
  expect(result.difficulties).toEqual([
    'Normal', 'Difficile', 'Expert', 'Cauchemar',
    'Infernal', 'Abyssal', 'Immortel', 'Divin',
  ]);
  expect(result.config).toEqual({ chaptersPerDifficulty: 5, floorsPerChapter: 10, totalChapters: 40 });

  const byFloor = Object.fromEntries(result.sample.map((m) => [m.floor, m]));
  expect(byFloor[1]).toMatchObject({ difficulty: 'Normal', chapter: 1, difficultyChapter: 1, stage: 1, stageCode: '1-1' });
  expect(byFloor[10]).toMatchObject({ difficulty: 'Normal', chapter: 1, difficultyChapter: 1, stage: 10, stageCode: '1-10', isBoss: true });
  expect(byFloor[11]).toMatchObject({ difficulty: 'Normal', chapter: 2, difficultyChapter: 2, stage: 1, stageCode: '2-1' });
  expect(byFloor[50]).toMatchObject({ difficulty: 'Normal', chapter: 5, difficultyChapter: 5, stage: 10, stageCode: '5-10', isBoss: true });
  expect(byFloor[51]).toMatchObject({ difficulty: 'Difficile', chapter: 6, difficultyChapter: 1, stage: 1, stageCode: '6-1' });
  expect(byFloor[100]).toMatchObject({ difficulty: 'Difficile', chapter: 10, difficultyChapter: 5, stage: 10, stageCode: '10-10', isBoss: true });
  expect(byFloor[101]).toMatchObject({ difficulty: 'Expert', chapter: 11, difficultyChapter: 1, stage: 1, stageCode: '11-1' });
  expect(byFloor[150]).toMatchObject({ difficulty: 'Expert', chapter: 15, difficultyChapter: 5, stage: 10, stageCode: '15-10', isBoss: true });
  expect(byFloor[151]).toMatchObject({ difficulty: 'Cauchemar', chapter: 16, difficultyChapter: 1, stage: 1, stageCode: '16-1' });
  expect(byFloor[200]).toMatchObject({ difficulty: 'Cauchemar', chapter: 20, difficultyChapter: 5, stage: 10, stageCode: '20-10', isBoss: true });
  expect(byFloor[201]).toMatchObject({ difficulty: 'Infernal', chapter: 21, difficultyChapter: 1, stage: 1, stageCode: '21-1' });
  expect(byFloor[250]).toMatchObject({ difficulty: 'Infernal', chapter: 25, difficultyChapter: 5, stage: 10, stageCode: '25-10', isBoss: true });
  expect(byFloor[251]).toMatchObject({ difficulty: 'Abyssal', chapter: 26, difficultyChapter: 1, stage: 1, stageCode: '26-1' });
  expect(byFloor[300]).toMatchObject({ difficulty: 'Abyssal', chapter: 30, difficultyChapter: 5, stage: 10, stageCode: '30-10', isBoss: true });
  expect(byFloor[301]).toMatchObject({ difficulty: 'Immortel', chapter: 31, difficultyChapter: 1, stage: 1, stageCode: '31-1' });
  expect(byFloor[350]).toMatchObject({ difficulty: 'Immortel', chapter: 35, difficultyChapter: 5, stage: 10, stageCode: '35-10', isBoss: true });
  expect(byFloor[351]).toMatchObject({ difficulty: 'Divin', chapter: 36, difficultyChapter: 1, stage: 1, stageCode: '36-1' });
  expect(byFloor[400]).toMatchObject({ difficulty: 'Divin', chapter: 40, difficultyChapter: 5, stage: 10, stageCode: '40-10', isBoss: true });
});

test('V314 keeps every approved 1..150 combat anchor and extends fixed curves to 400', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => ({
    hp: [
      [150, __srV285EnemyHP(150)],
      [200, __srV285EnemyHP(200)],
      [250, __srV285EnemyHP(250)],
      [300, __srV285EnemyHP(300)],
      [350, __srV285EnemyHP(350)],
      [400, __srV285EnemyHP(400)],
    ],
    boss: [
      [150, __srV285BossHP(150)],
      [200, __srV285BossHP(200)],
      [250, __srV285BossHP(250)],
      [300, __srV285BossHP(300)],
      [350, __srV285BossHP(350)],
      [400, __srV285BossHP(400)],
    ],
    dmg: [
      [150, __srV289EnemyDamage(150)],
      [200, __srV289EnemyDamage(200)],
      [250, __srV289EnemyDamage(250)],
      [300, __srV289EnemyDamage(300)],
      [350, __srV289EnemyDamage(350)],
      [400, __srV289EnemyDamage(400)],
    ],
    clamped: {
      hp401: __srV285EnemyHP(401),
      boss999: __srV285BossHP(999),
      dmg401: __srV289EnemyDamage(401),
    },
  }));

  expect(result.hp).toEqual([
    [150, 550000000], [200, 2200000000], [250, 8000000000],
    [300, 28000000000], [350, 95000000000], [400, 320000000000],
  ]);
  expect(result.boss).toEqual([
    [150, 7000000000], [200, 30000000000], [250, 120000000000],
    [300, 480000000000], [350, 1800000000000], [400, 6000000000000],
  ]);
  expect(result.dmg).toEqual([
    [150, 38000000], [200, 90000000], [250, 210000000],
    [300, 480000000], [350, 1050000000], [400, 2300000000],
  ]);

  for (const rows of [result.hp, result.boss, result.dmg]) {
    for (let i = 1; i < rows.length; i += 1) expect(rows[i][1]).toBeGreaterThan(rows[i - 1][1]);
  }
  expect(result.clamped.hp401).toBe(320000000000);
  expect(result.clamped.boss999).toBe(6000000000000);
  expect(result.clamped.dmg401).toBe(2300000000);
});

test('V314 Boss 40-10 uses the final boss HP authority, not extrapolated legacy scaling', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    const floor = 400;
    const def = bossFor(floor);
    const type = Object.assign({}, ENEMY_TYPES[0], {
      id: 'v314-final-' + def.id,
      name: def.name,
      img: def.img,
      ranged: !!def.ranged,
      proj: def.proj || 'magic',
    });
    const enemy = makeEnemy('campaign', {
      type,
      name: type.name,
      tier: def.tier,
      floor,
      boss: true,
      abils: def.abils,
      noFastback: true,
      x: AW - 60,
    });
    return { hp: enemy.maxHP, damage: enemy.dmg, expectedHp: __srV285BossHP(400) };
  });

  expect(result.hp).toBe(result.expectedHp);
  expect(result.hp).toBe(6000000000000);
  expect(result.damage).toBeGreaterThan(0);
});

test('V314 Home arena shows difficulty plus canonical chapter-stage notation', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    update((st) => {
      st.floor = 151;
      st.step = 1;
      st.recordFloor = Math.max(Number(st.recordFloor) || 1, 151);
      st.pendingBossFloor = 0;
    });
    combat = spawnCampaign(S);
    nav('accueil');
    scheduleRender();
  });

  await expect(page.locator('#aLabel')).toHaveText('Cauchemar · 16-1', { timeout: 5000 });
});

test('V314 final Boss completion cannot create 41-1 and keeps 40-10 replayable', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => {
    update((st) => {
      st.floor = 400;
      st.step = 1;
      st.recordFloor = 399;
      st.checkpoint = 395;
      st.pendingBossFloor = 0;
      st.bossClears = st.bossClears || {};
      st.bossRewardsClaimed = st.bossRewardsClaimed || {};
    });
    const c = spawnCampaign(S);
    c.ctx = 'campaign';
    c.floor = 400;
    c.boss = true;
    c.status = 'won';
    handleCombatEnd(c);
    return {
      floor: S.floor,
      step: S.step,
      recordFloor: S.recordFloor,
      checkpoint: S.checkpoint,
      complete: S.campaignComplete400,
      boss400: !!S.bossClears['400'],
      label: __srCampaignLabel(S.floor),
      stage: __srCampaignStageLabel(S.floor),
    };
  });

  expect(result).toEqual({
    floor: 400,
    step: 1,
    recordFloor: 400,
    checkpoint: 400,
    complete: true,
    boss400: true,
    label: 'Divin · 40-10',
    stage: '40-10',
  });

  await page.waitForTimeout(100);
  const stable = await page.evaluate(() => ({ floor: S.floor, combatFloor: combat && combat.floor }));
  expect(stable.floor).toBe(400);
  expect(stable.combatFloor).toBe(400);
});
