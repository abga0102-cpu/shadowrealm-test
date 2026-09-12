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
  await page.waitForFunction(() => window.__srForgeMasterStageFlowV316 === true);
}

test('V316 repeats the exact Normal/Elite/Boss composition every ten visible stages', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    function wave(floor, step) {
      S.floor=floor; S.step=step; S.pendingBossFloor=0;
      const c=spawnCampaign(S);
      return { floor, step, waves:campaignWaveCount(floor), kind:__srCampaignStageKindV316(floor), boss:!!c.boss, elite:!!c.elite };
    }
    return [
      wave(1,1),wave(1,2),wave(1,3),
      wave(2,1),wave(2,2),wave(2,3),
      wave(3,1),wave(3,2),wave(3,3),
      wave(4,1),wave(4,2),wave(5,1),
      wave(6,1),wave(6,2),wave(6,3),
      wave(7,1),wave(7,2),wave(7,3),
      wave(8,1),wave(8,2),wave(8,3),
      wave(9,1),wave(9,2),wave(10,1),
      wave(14,1),wave(14,2),wave(15,1),
      wave(54,1),wave(54,2),wave(55,1),
    ];
  });

  const by = (floor, step) => result.find((x) => x.floor===floor && x.step===step);
  for (const floor of [1,2,3,6,7,8]) {
    expect(by(floor,1)).toMatchObject({ waves:3, kind:'normal', boss:false, elite:false });
    expect(by(floor,2)).toMatchObject({ waves:3, kind:'normal', boss:false, elite:false });
    expect(by(floor,3)).toMatchObject({ waves:3, kind:'normal', boss:false, elite:false });
  }
  expect(by(4,1)).toMatchObject({ waves:2, kind:'elite', boss:false, elite:false });
  expect(by(4,2)).toMatchObject({ waves:2, kind:'elite', boss:false, elite:true });
  expect(by(5,1)).toMatchObject({ waves:1, kind:'boss', boss:true, elite:false });
  expect(by(9,1)).toMatchObject({ waves:2, kind:'elite', boss:false, elite:false });
  expect(by(9,2)).toMatchObject({ waves:2, kind:'elite', boss:false, elite:true });
  expect(by(10,1)).toMatchObject({ waves:1, kind:'boss', boss:true, elite:false });
  expect(by(14,2)).toMatchObject({ waves:2, kind:'elite', elite:true });
  expect(by(15,1)).toMatchObject({ waves:1, kind:'boss', boss:true });
  expect(by(54,2)).toMatchObject({ waves:2, kind:'elite', elite:true });
  expect(by(55,1)).toMatchObject({ waves:1, kind:'boss', boss:true });
});

test('V316 mini-track shows only encounters belonging to the current stage', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    function inspect(floor, step) {
      combat={ctx:'campaign',floor,step};
      const t=document.createElement('template');
      t.innerHTML=__srCompactStageTrackHTMLV315(floor);
      const dots=[...t.content.querySelectorAll('.srStageMiniDot')];
      return {
        dots:dots.length,
        links:t.content.querySelectorAll('i').length,
        current:t.content.querySelectorAll('.cur').length,
        completed:t.content.querySelectorAll('.on').length,
        elite:dots.map((d)=>d.classList.contains('elite')),
        boss:dots.map((d)=>d.classList.contains('boss')),
      };
    }
    return { normal:inspect(1,2), elite1:inspect(4,1), elite2:inspect(4,2), boss:inspect(5,1), elite9:inspect(9,1), boss10:inspect(10,1) };
  });

  expect(result.normal).toMatchObject({ dots:3, links:2, current:1, completed:1, elite:[false,false,false], boss:[false,false,false] });
  expect(result.elite1).toMatchObject({ dots:2, links:1, current:1, completed:0, elite:[false,true], boss:[false,false] });
  expect(result.elite2).toMatchObject({ dots:2, links:1, current:1, completed:1, elite:[false,true] });
  expect(result.boss).toMatchObject({ dots:1, links:0, current:1, completed:0, elite:[false], boss:[true] });
  expect(result.elite9.elite).toEqual([false,true]);
  expect(result.boss10.boss).toEqual([true]);
});

test('V316 live Home counter uses each stage real encounter total', async ({ page }) => {
  await openCleanGame(page);
  async function show(floor, step) {
    await page.evaluate(({floor,step}) => {
      update((st)=>{st.floor=floor;st.step=step;st.pendingBossFloor=0;st.recordFloor=Math.max(Number(st.recordFloor)||1,floor);});
      combat=spawnCampaign(S);nav('accueil');scheduleRender();
    }, {floor,step});
    await expect(page.locator('#aTrack .srStageMiniDot')).toHaveCount(await page.evaluate((f)=>campaignWaveCount(f),floor));
    return (await page.locator('#aSub').innerText()).replace(/\s+/g,' ');
  }
  expect(await show(1,1)).toContain('Vague 1/3');
  expect(await show(4,1)).toContain('Vague 1/2');
  expect(await show(4,2)).toContain('Vague 2/2');
  expect(await show(5,1)).toContain('Vague 1/1');
  expect(await show(9,2)).toContain('Vague 2/2');
  expect(await show(10,1)).toContain('Vague 1/1');
});

test('V316 normalizes old three-wave saves on shortened Elite and Boss stages', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    function normalize(floor, step) {
      S.floor=floor;S.step=step;S.pendingBossFloor=0;startCampaign();
      return {floor:S.floor,step:S.step,combatFloor:combat.floor,combatStep:combat.step,waves:campaignWaveCount(floor),boss:!!combat.boss,elite:!!combat.elite};
    }
    const elite=normalize(4,3);
    const boss=normalize(5,3);
    return {elite,boss};
  });
  expect(result.elite).toMatchObject({floor:4,step:2,combatFloor:4,combatStep:2,waves:2,elite:true,boss:false});
  expect(result.boss).toMatchObject({floor:5,step:1,combatFloor:5,combatStep:1,waves:1,boss:true});
});

test('V316 Boss 1-5 is a real boss and advances to 1-6 after victory', async ({ page }) => {
  await openCleanGame(page);
  const result = await page.evaluate(() => {
    S.floor=5;S.step=1;S.pendingBossFloor=0;S.bossClears=S.bossClears||{};delete S.bossClears['5'];
    const c=spawnCampaign(S);
    const hp=c.enemies[0]&&c.enemies[0].maxHP;
    c.status='won';
    handleCombatEnd(c);
    return {wasBoss:!!c.boss,hp,floor:S.floor,step:S.step,cleared:!!S.bossClears['5'],nextLabel:__srCampaignLabel(S.floor)};
  });
  expect(result).toEqual({wasBoss:true,hp:500,floor:6,step:1,cleared:true,nextLabel:'Normal · 1-6'});
});
