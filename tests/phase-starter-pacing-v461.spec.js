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
    window.__srStarterPacingV462 &&
    window.__srStarterPacingV462.version === 462 &&
    window.__srProgressionIntegrationConfigV305 &&
    window.__srProgressionIntegrationConfigV305.revision === 462
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

test('V462 starter Egg arrives stored at Facile 1-8 and starts only after player action', async ({ page }) => {
  await openCleanGame(page);
  const data=await page.evaluate(() => {
    S.onboardingV461.active=true;
    S.onboardingV461.completed=false;
    S.onboardingV461.starterEggGranted=false;
    S.onboardingV461.starterEggId=null;
    S.onboardingV461.starterEggStarted=false;
    S.bossClears=S.bossClears||{};S.bossClears['5']=true;
    S.floor=8;S.recordFloor=8;S.checkpoint=1;
    S.eggs=[];
    const result=window.__srStarterPacingV462.applyMilestones(S,false);
    const egg=S.eggs.find(e=>e&&e.starterV462);
    return {
      changed:result.changed,
      count:S.eggs.length,
      id:S.onboardingV461.starterEggId,
      egg:egg&&{rarity:egg.rarity,stored:!eggIsHatching(egg),hatchEnd:egg.hatchEnd,seconds:egg.starterHatchSeconds},
      step:window.__srStarterPacingV462.nextStep(S)
    };
  });
  expect(data.changed).toBe(true);
  expect(data.count).toBe(1);
  expect(data.id).toBeTruthy();
  expect(data.egg).toEqual({rarity:'COMMUN',stored:true,hatchEnd:0,seconds:30});
  expect(data.step).toMatchObject({id:'startHatch',title:'Lance l’éclosion',go:'familiers',ready:true});

  await page.evaluate(()=>nav('familiers'));
  await expect(page.locator('#tutorialCard')).toHaveAttribute('data-tutorial-key','familier');
  await expect(page.locator('#tutorialCard')).toContainText('Lancer l’éclosion');
  await page.getByRole('button',{name:'Compris',exact:true}).click();
  await page.getByRole('button',{name:'Lancer l’éclosion',exact:true}).click();

  const after=await page.evaluate(() => {
    const egg=S.eggs.find(e=>e&&e.id===S.onboardingV461.starterEggId);
    return {
      hatching:eggIsHatching(egg),
      remaining:(egg.hatchEnd-Date.now())/1000,
      active:S.onboardingV461.active,
      completed:S.onboardingV461.completed,
      started:S.onboardingV461.starterEggStarted
    };
  });
  expect(after.hatching).toBe(true);
  expect(after.remaining).toBeGreaterThanOrEqual(28);
  expect(after.remaining).toBeLessThanOrEqual(31);
  expect(after).toMatchObject({active:false,completed:true,started:true});
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
    const floor=document.querySelector('#arena .floorTag').getBoundingClientRect();
    return {
      card:{top:card.top,bottom:card.bottom,left:card.left,right:card.right},
      floor:{top:floor.top,bottom:floor.bottom,left:floor.left,right:floor.right},
      world:{top:world.top,bottom:world.bottom,height:world.height},
      arena:{top:arena.top,bottom:arena.bottom,height:arena.height}
    };
  });
  expect(geometry.card.top).toBeGreaterThanOrEqual(geometry.world.top);
  expect(geometry.card.bottom).toBeLessThanOrEqual(geometry.world.bottom);
  expect(Math.abs(geometry.arena.height-geometry.world.height)).toBeLessThanOrEqual(1);
  const overlaps=!(geometry.card.bottom<=geometry.floor.top || geometry.card.top>=geometry.floor.bottom || geometry.card.right<=geometry.floor.left || geometry.card.left>=geometry.floor.right);
  expect(overlaps).toBe(false);
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

test('V462 Boss 1-5 hands off to Familier 1-8; starter flow ends only after manual hatch start', async ({ page }) => {
  await openCleanGame(page);
  const data=await page.evaluate(() => {
    S.onboardingV461.active=true;
    S.onboardingV461.completed=false;
    S.onboardingV461.starterEggGranted=false;
    S.onboardingV461.starterEggId=null;
    S.onboardingV461.starterEggStarted=false;
    S.bossClears=S.bossClears||{};
    S.floor=5;S.recordFloor=5;S.bossClears['5']=true;
    window.__srStarterPacingV462.applyMilestones(S,false);
    const afterBoss={
      active:S.onboardingV461.active,
      completed:S.onboardingV461.completed,
      next:window.__srStarterPacingV462.nextStep(S)
    };
    S.floor=8;S.recordFloor=8;
    window.__srStarterPacingV462.applyMilestones(S,false);
    const egg=S.eggs.find(e=>e&&e.id===S.onboardingV461.starterEggId);
    const beforeStart={active:S.onboardingV461.active,completed:S.onboardingV461.completed,hatching:eggIsHatching(egg)};
    startEgg(egg.id);
    return {
      afterBoss,beforeStart,
      afterStart:{active:S.onboardingV461.active,completed:S.onboardingV461.completed,hatching:eggIsHatching(egg)}
    };
  });
  expect(data.afterBoss.active).toBe(true);
  expect(data.afterBoss.completed).toBe(false);
  expect(data.afterBoss.next).toMatchObject({id:'familiarIntro',title:'Familiers',max:8});
  expect(data.beforeStart).toEqual({active:true,completed:false,hatching:false});
  expect(data.afterStart).toEqual({active:false,completed:true,hatching:true});
});


test('V462 source keeps pacing inside the existing integration owner', async () => {
  const src=fs.readFileSync('progression-integration-pack-v305.js','utf8');
  expect(src).toContain('SKILL_UNLOCK_LEVEL=2');
  expect(src).toContain('V462_BUILD_INTRO_FLOOR=5');
  expect(src).toContain('V462_FAMILIAR_INTRO_FLOOR=8');
  expect(src).toContain('V462_STARTER_HATCH_SECS=30');
  expect(src).toContain('starterEggStarted');
  expect(src).toContain('freeSkillSummons');
  expect(src).toContain('oldExpRewardV461');
  expect(src).not.toContain('SKILL_UNLOCK_LEVEL=4');
});
