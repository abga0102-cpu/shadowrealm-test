const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('shadowreach.save.local');
      localStorage.removeItem('shadowreach.social.v1.messages');
    } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof pendingTutorialStepForRoute === 'function' &&
    typeof checkTutorial === 'function' &&
    window.__srTutorialAutoV100 === true
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

function allSeen(overrides = {}) {
  return Object.assign({
    combat: true,
    equipement: true,
    competence: true,
    familier: true,
    forge: true,
    raid: true,
    megaBoss: true,
    tree: true,
  }, overrides);
}

test('V459 Familiars intro appears on entry even when another unseen tutorial has higher global priority', async ({ page }) => {
  await openCleanGame(page);

  const setup = await page.evaluate(() => {
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = {
      combat: true,
      equipement: false,
      competence: true,
      familier: false,
      forge: true,
      raid: true,
      megaBoss: true,
      tree: true,
    };
    S.inventory = [makeItem('arme', 'COMMUN', S.forge.level)];
    S.eggs = [{ id:'v459-egg', rarity:'RARE', species:'loup', hatchEnd:0 }];
    const card = document.getElementById('tutorialCard');
    if (card) card.remove();
    if (typeof clearTutorialGuide === 'function') clearTutorialGuide();
    tutorialCurrentKey = null;
    const globalFirst = pendingTutorialStep();
    nav('familiers');
    return { globalFirst: globalFirst && globalFirst.key, route };
  });

  expect(setup.globalFirst).toBe('equipement');
  expect(setup.route).toBe('familiers');
  const card = page.locator('#tutorialCard');
  await expect(card).toBeVisible({ timeout: 1500 });
  await expect(card).toContainText('Familiers');
  await expect(card).toHaveAttribute('data-tutorial-key', 'familier');
  await expect(card).toHaveAttribute('data-tutorial-route', 'familiers');
});

test('V459 leaving a system does not make its unseen intro appear afterwards on Home', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = {
      combat: true,
      equipement: true,
      competence: true,
      familier: false,
      forge: true,
      raid: true,
      megaBoss: true,
      tree: true,
    };
    S.eggs = [{ id:'v459-egg-leave', rarity:'RARE', species:'loup', hatchEnd:0 }];
    const card = document.getElementById('tutorialCard');
    if (card) card.remove();
    tutorialCurrentKey = null;
    nav('familiers');
  });

  await expect(page.locator('#tutorialCard')).toHaveAttribute('data-tutorial-key', 'familier', { timeout: 1500 });

  await page.evaluate(() => nav('accueil'));
  await expect(page.locator('#tutorialCard')).toHaveCount(0, { timeout: 1500 });

  const state = await page.evaluate(() => ({
    route,
    familiarSeen: !!S.tutorial.seen.familier,
    homeStep: pendingTutorialStepForRoute('accueil'),
  }));
  expect(state.route).toBe('accueil');
  expect(state.familiarSeen).toBe(false);
  expect(state.homeStep).toBeNull();
});

test('V459 dismissing the intro inside the system marks it seen and prevents repeat entry', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = {
      combat: true,
      equipement: true,
      competence: true,
      familier: false,
      forge: true,
      raid: true,
      megaBoss: true,
      tree: true,
    };
    S.eggs = [{ id:'v459-egg-seen', rarity:'RARE', species:'loup', hatchEnd:0 }];
    nav('familiers');
  });

  await expect(page.locator('#tutorialCard')).toContainText('Familiers', { timeout: 1500 });
  await page.locator('#tutorialCard [data-act="tutorialNext"]').click();
  await expect(page.locator('#tutorialCard')).toHaveCount(0);

  const seen = await page.evaluate(() => {
    nav('accueil');
    nav('familiers');
    return !!S.tutorial.seen.familier;
  });
  expect(seen).toBe(true);
  await expect(page.locator('#tutorialCard')).toHaveCount(0, { timeout: 1000 });
});

test('V459 Skills and Tree intros also belong to their destination screens, not their hubs', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = {
      combat: true,
      equipement: true,
      competence: false,
      familier: true,
      forge: true,
      raid: true,
      megaBoss: true,
      tree: false,
    };
    S.skills.taillade = { level:1, count:0 };
    S.pe = 100;
    nav('developpement');
  });
  await expect(page.locator('#tutorialCard')).toHaveCount(0, { timeout: 1000 });

  await page.evaluate(() => nav('competences'));
  await expect(page.locator('#tutorialCard')).toHaveAttribute('data-tutorial-key', 'competence', { timeout: 1500 });
  await page.locator('#tutorialCard [data-act="tutorialNext"]').click();

  await page.evaluate(() => nav('developpement'));
  await expect(page.locator('#tutorialCard')).toHaveCount(0, { timeout: 1000 });

  await page.evaluate(() => nav('arbre'));
  await expect(page.locator('#tutorialCard')).toHaveAttribute('data-tutorial-key', 'tree', { timeout: 1500 });
  await expect(page.locator('#tutorialCard')).toHaveAttribute('data-tutorial-route', 'arbre');
});

test('V459 scheduler no longer waits for Home or a 180ms navigation delay', async () => {
  const tutorial = fs.readFileSync('tutorial-auto-v100.js', 'utf8');
  const game = fs.readFileSync('game-5.js', 'utf8');

  expect(tutorial).not.toContain("route !== 'accueil'");
  expect(tutorial).not.toContain('scheduleTutorialCheck(180)');
  expect(tutorial).toContain('scheduleTutorialCheck(0)');
  expect(game).toContain('function pendingTutorialStepForRoute');
  expect(game).toContain('data-tutorial-route');
  expect(game).toContain('requestAnimationFrame(() => {');
  expect(game).toContain('checkTutorial();');
});
