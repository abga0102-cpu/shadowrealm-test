const { test, expect } = require('@playwright/test');

async function clean(page){
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{try{localStorage.removeItem('shadowreach.save.local');}catch(_){}});
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(()=>window.__srStarterPacingV462?.version===462 && window.__srEnemyDamageConfigV289?.starterBossV462);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V462 Build intro is gated to 1-5 and Familiar intro to 1-8', async ({page})=>{
  await clean(page);
  await page.evaluate(()=>{
    S.onboardingV461.active=true;S.onboardingV461.completed=false;
    S.floor=4;S.recordFloor=4;S.checkpoint=1;S.tutorial.seen.equipement=false;nav('equipement');
  });
  await expect(page.locator('#tutorialCard')).toHaveCount(0);

  await page.evaluate(()=>{S.floor=5;S.recordFloor=5;nav('accueil');nav('equipement');});
  await expect(page.locator('#tutorialCard')).toContainText('Prépare ton build');
  await page.getByRole('button',{name:'Compris',exact:true}).click();

  await page.evaluate(()=>{S.floor=7;S.recordFloor=7;S.tutorial.seen.familier=false;nav('familiers');});
  await expect(page.locator('#tutorialCard')).toHaveCount(0);

  await page.evaluate(()=>{
    S.floor=8;S.recordFloor=8;S.bossClears=S.bossClears||{};S.bossClears['5']=true;
    window.__srStarterPacingV462.applyMilestones(S,false);nav('familiers');
  });
  await expect(page.locator('#tutorialCard')).toContainText('premier œuf');
  await expect(page.locator('#screen')).toContainText('Œufs en stock (1)');
  await expect(page.getByRole('button',{name:'Lancer l’éclosion',exact:true})).toHaveCount(1);
});

test('V462 strengthens only the live campaign Boss at Facile 1-5', async ({page})=>{
  await clean(page);
  const data=await page.evaluate(()=>{
    const type=Object.assign({},ENEMY_TYPES[1],{id:'v462_test_boss',name:'Test Boss',img:'boss_chefgobelin'});
    const baseline=makeEnemy('campaign',{type,name:'Test Boss',tier:'RARE',floor:5,boss:true,noFastback:true,x:260});
    const tuned=makeEnemy('campaign',{type,name:'Test Boss',tier:'RARE',floor:5,boss:true,x:260});
    const next=makeEnemy('campaign',{type,name:'Test Boss',tier:'RARE',floor:10,boss:true,x:260});
    return {
      cfg:window.__srEnemyDamageConfigV289.starterBossV462,
      baseline:{hp:baseline.maxHP,dmg:baseline.dmg,tag:!!baseline.__srStarterBossV462},
      tuned:{hp:tuned.maxHP,dmg:tuned.dmg,tag:!!tuned.__srStarterBossV462},
      nextTag:!!next.__srStarterBossV462
    };
  });
  expect(data.cfg).toMatchObject({visibleStage:'Facile 1-5',floor:5,hpMul:1.4,damageMul:1.2,megaBossChanged:false});
  expect(data.baseline.tag).toBe(false);
  expect(data.tuned.tag).toBe(true);
  expect(data.nextTag).toBe(false);
  expect(data.tuned.hp/data.baseline.hp).toBeGreaterThan(1.38);
  expect(data.tuned.hp/data.baseline.hp).toBeLessThan(1.42);
  expect(data.tuned.dmg/data.baseline.dmg).toBeGreaterThan(1.15);
  expect(data.tuned.dmg/data.baseline.dmg).toBeLessThan(1.25);
});
