const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function openCleanGame(page, viewport={width:390,height:844}) {
  await page.setViewportSize(viewport);
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('shadowreach.save.local');
      localStorage.removeItem('shadowreach.social.v1.messages');
    } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srStarterPacingV461 &&
    window.__srStarterPacingV461.version === 461 &&
    window.__srProgressionIntegrationConfigV305 &&
    window.__srProgressionIntegrationConfigV305.revision === 461
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V461 fresh start accelerates only the first hero level and unlocks Skills at level 2', async ({ page }) => {
  await openCleanGame(page);
  const data=await page.evaluate(() => {
    const api=window.__srStarterPacingV461;
    const before={
      active:api.active(S),
      level:S.level,
      skillUnlock:api.skillUnlockLevel,
      exp1:expReward(1),
      normalBase:Math.floor(4.5*Math.pow(1,1.05)+4),
      need:expToNext(1)
    };
    S.exp=expToNext(1);
    grantLevels(S);
    return {
      before,
      after:{
        level:S.level,
        free:S.onboardingV461.freeSkillSummons,
        granted:S.onboardingV461.skillCreditGranted,
        unlocked:window.__srProgressionUnlocksV321.skillsUnlocked()
      }
    };
  });
  expect(data.before.active).toBe(true);
  expect(data.before.level).toBe(1);
  expect(data.before.skillUnlock).toBe(2);
  expect(data.before.exp1).toBe(Math.ceil(data.before.need/3));
  expect(data.before.exp1).toBeGreaterThan(data.before.normalBase);
  expect(data.after).toMatchObject({level:2,free:1,granted:true,unlocked:true});
});

test('V461 first Skill summon is free exactly once and consumes no shards', async ({ page }) => {
  await openCleanGame(page);
  const data=await page.evaluate(() => {
    S.level=2;
    S.eclat=0;
    S.skills={};
    S.skillSlots=[null,null,null,null,null];
    S.onboardingV461.active=true;
    S.onboardingV461.completed=false;
    S.onboardingV461.skillCreditGranted=true;
    S.onboardingV461.freeSkillSummons=1;

    const costBefore=skillSummonCost(S);
    const first=summonSkill(1);
    const afterFirst={
      eclat:S.eclat,
      free:S.onboardingV461.freeSkillSummons,
      owned:Object.keys(S.skills).length,
      results:first.length
    };
    const second=summonSkill(1);
    return {
      costBefore,
      afterFirst,
      secondResults:second.length,
      afterSecondEclat:S.eclat
    };
  });
  expect(data.costBefore).toBeGreaterThan(0);
  expect(data.afterFirst).toEqual({eclat:0,free:0,owned:1,results:1});
  expect(data.secondResults).toBe(0);
  expect(data.afterSecondEclat).toBe(0);
});

test('V461 starter Egg arrives at Facile 1-3 and is already hatching for about 30 seconds', async ({ page }) => {
  await openCleanGame(page);
  const data=await page.evaluate(() => {
    S.onboardingV461.active=true;
    S.onboardingV461.completed=false;
    S.onboardingV461.starterEggGranted=false;
    S.onboardingV461.starterEggId=null;
    S.floor=3;S.recordFloor=3;S.checkpoint=1;
    S.eggs=[];
    const before=Date.now();
    const result=window.__srStarterPacingV461.applyMilestones(S,false);
    const egg=S.eggs.find(e=>e&&e.starterV461);
    return {
      changed:result.changed,
      count:S.eggs.length,
      id:S.onboardingV461.starterEggId,
      egg:egg&&{
        rarity:egg.rarity,
        starter:egg.starterV461,
        hatching:eggIsHatching(egg),
        seconds:(egg.hatchEnd-before)/1000
      },
      step:window.__srStarterPacingV461.nextStep(S)
    };
  });
  expect(data.changed).toBe(true);
  expect(data.count).toBe(1);
  expect(data.id).toBeTruthy();
  expect(data.egg).toMatchObject({rarity:'COMMUN',starter:true,hatching:true});
  expect(data.egg.seconds).toBeGreaterThanOrEqual(29);
  expect(data.egg.seconds).toBeLessThanOrEqual(31);
  expect(data.step).toMatchObject({id:'hatch',title:'Premier familier',go:'familiers'});
});

test('V461 advanced saves are not retroactively enrolled in starter rewards', async ({ page }) => {
  await openCleanGame(page);
  const data=await page.evaluate(() => {
    const advanced=JSON.parse(JSON.stringify(S));
    delete advanced.onboardingV461;
    advanced.firstSeen=Date.now();
    advanced.floor=30;advanced.recordFloor=30;advanced.checkpoint=20;
    advanced.level=10;advanced.eggs=[];advanced.skills={};
    const changed=window.__srStarterPacingV461.ensure(advanced,false);
    const applied=window.__srStarterPacingV461.applyMilestones(advanced,false);
    return {
      changed,
      appliedChanged:applied.changed,
      state:advanced.onboardingV461,
      eggs:advanced.eggs.length,
      skills:Object.keys(advanced.skills).length
    };
  });
  expect(data.state.active).toBe(false);
  expect(data.eggs).toBe(0);
  expect(data.skills).toBe(0);
});

test('V461 Home shows a compact next milestone overlay without shrinking the arena', async ({ page }) => {
  await openCleanGame(page,{width:390,height:844});
  await page.evaluate(() => {
    S.onboardingV461.active=true;
    S.onboardingV461.completed=false;
    S.onboardingV461.freeSkillSummons=0;
    S.onboardingV461.skillCreditGranted=false;
    S.onboardingV461.starterEggGranted=false;
    S.forge.summonCount=0;
    S.floor=1;S.recordFloor=1;S.checkpoint=1;S.level=1;
    nav('accueil');
  });

  const card=page.locator('.srStarterRoadmapV461');
  await expect(card).toBeVisible();
  await expect(card).toContainText('DÉBUT RAPIDE');
  await expect(card).toContainText('Forge');
  const geometry=await page.evaluate(() => {
    const card=document.querySelector('.srStarterRoadmapV461').getBoundingClientRect();
    const world=document.querySelector('.campaignWorld').getBoundingClientRect();
    const arena=document.querySelector('#arenaSlot').getBoundingClientRect();
    return {
      card:{top:card.top,bottom:card.bottom,left:card.left,right:card.right},
      world:{top:world.top,bottom:world.bottom,height:world.height},
      arena:{top:arena.top,bottom:arena.bottom,height:arena.height}
    };
  });
  expect(geometry.card.top).toBeGreaterThanOrEqual(geometry.world.top);
  expect(geometry.card.bottom).toBeLessThanOrEqual(geometry.world.bottom);
  expect(Math.abs(geometry.arena.height-geometry.world.height)).toBeLessThanOrEqual(1);
});

test('V461 Skills screen exposes one free summon but keeps x10 priced for the remaining nine', async ({ page }) => {
  await openCleanGame(page);
  await page.evaluate(() => {
    S.level=2;
    S.eclat=0;
    S.onboardingV461.active=true;
    S.onboardingV461.completed=false;
    S.onboardingV461.skillCreditGranted=true;
    S.onboardingV461.freeSkillSummons=1;
    nav('competences');
  });
  await expect(page.locator('#screen')).toContainText('Première invocation offerte');
  await expect(page.locator('#screen')).toContainText('Invoquer · GRATUIT');
  await expect(page.locator('#screen')).toContainText('1 offerte + 225');
});

test('V461 starter flow ends on the first Facile 1-5 Boss and normal EXP resumes', async ({ page }) => {
  await openCleanGame(page);
  const data=await page.evaluate(() => {
    S.onboardingV461.active=true;
    S.onboardingV461.completed=false;
    S.level=1;
    S.bossClears=S.bossClears||{};
    S.bossClears['5']=true;
    const result=window.__srStarterPacingV461.applyMilestones(S,false);
    return {
      result,
      state:S.onboardingV461,
      next:window.__srStarterPacingV461.nextStep(S),
      expAfter:expReward(1),
      normalBase:Math.floor(4.5*Math.pow(1,1.05)+4)
    };
  });
  expect(data.state.active).toBe(false);
  expect(data.state.completed).toBe(true);
  expect(data.next).toBeNull();
  expect(data.expAfter).toBe(data.normalBase);
});

test('V461 source keeps pacing inside the existing integration owner', async () => {
  const src=fs.readFileSync('progression-integration-pack-v305.js','utf8');
  expect(src).toContain('SKILL_UNLOCK_LEVEL=2');
  expect(src).toContain('V461_STARTER_EGG_FLOOR=3');
  expect(src).toContain('V461_STARTER_HATCH_SECS=30');
  expect(src).toContain('freeSkillSummons');
  expect(src).toContain('oldExpRewardV461');
  expect(src).not.toContain('SKILL_UNLOCK_LEVEL=4');
});
