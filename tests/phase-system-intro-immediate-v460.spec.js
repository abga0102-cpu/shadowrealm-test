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

function seenExcept(key) {
  const seen = {
    combat:true,equipement:true,competence:true,familier:true,
    forge:true,raid:true,megaBoss:true,tree:true
  };
  seen[key] = false;
  return seen;
}

test('V460 Familiars intro appears on the first mounted frame before eggs or pets exist', async ({ page }) => {
  await openCleanGame(page);

  const state = await page.evaluate(async () => {
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = {
      combat:true,equipement:true,competence:true,familier:false,
      forge:true,raid:true,megaBoss:true,tree:true
    };
    S.pets = [];
    S.eggs = [];
    S.activePetId = null;
    const old = document.getElementById('tutorialCard');
    if (old) old.remove();
    tutorialCurrentKey = null;

    nav('familiers');
    const immediateBeforeFrame = !!document.getElementById('tutorialCard');
    await new Promise(resolve => requestAnimationFrame(resolve));
    const card = document.getElementById('tutorialCard');
    return {
      route,
      immediateBeforeFrame,
      afterFirstFrame: !!card,
      key: card && card.getAttribute('data-tutorial-key'),
      pets: S.pets.length,
      eggs: S.eggs.length,
    };
  });

  expect(state.route).toBe('familiers');
  expect(state.pets).toBe(0);
  expect(state.eggs).toBe(0);
  expect(state.afterFirstFrame).toBe(true);
  expect(state.key).toBe('familier');
});

test('V460 Skills intro appears before the player owns or summons any skill', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = {
      combat:true,equipement:true,competence:false,familier:true,
      forge:true,raid:true,megaBoss:true,tree:true
    };
    S.skills = {};
    S.skillSlots = [null,null,null,null,null];
    const old = document.getElementById('tutorialCard');
    if (old) old.remove();
    tutorialCurrentKey = null;
    nav('competences');
  });

  const card = page.locator('#tutorialCard');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-tutorial-key', 'competence');
  await expect(card).toContainText('Compétences');
  expect(await page.evaluate(() => Object.keys(S.skills).length)).toBe(0);
});

test('V460 Tree intro appears on entry even before the first PE is earned', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = {
      combat:true,equipement:true,competence:true,familier:true,
      forge:true,raid:true,megaBoss:true,tree:false
    };
    S.pe = 0;
    const old = document.getElementById('tutorialCard');
    if (old) old.remove();
    tutorialCurrentKey = null;
    nav('arbre');
  });

  const card = page.locator('#tutorialCard');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-tutorial-key', 'tree');
  expect(await page.evaluate(() => S.pe)).toBe(0);
});

test('V460 Equipment intro appears before the player owns equipment', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = {
      combat:true,equipement:false,competence:true,familier:true,
      forge:true,raid:true,megaBoss:true,tree:true
    };
    S.inventory = [];
    Object.keys(S.equipped || {}).forEach(k => S.equipped[k] = null);
    const old = document.getElementById('tutorialCard');
    if (old) old.remove();
    tutorialCurrentKey = null;
    nav('equipement');
  });

  const card = page.locator('#tutorialCard');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-tutorial-key', 'equipement');
});

test('V460 stale modal-close callback cannot show a Familiar intro after leaving Familiars', async ({ page }) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    S.tutorial = S.tutorial || {};
    S.tutorial.seen = {
      combat:true,equipement:true,competence:true,familier:false,
      forge:true,raid:true,megaBoss:true,tree:true
    };
    S.pets = [];
    S.eggs = [];
    const old = document.getElementById('tutorialCard');
    if (old) old.remove();
    tutorialCurrentKey = null;

    nav('familiers');
  });

  await expect(page.locator('#tutorialCard')).toHaveAttribute('data-tutorial-key', 'familier');

  await page.evaluate(() => {
    // Simulate an interaction owning the screen: tutorial is removed but not seen.
    openModal('<div>Test interaction</div><button class="btn" data-act="closeModal">Fermer</button>', 'Test');
  });
  await expect(page.locator('#tutorialCard')).toHaveCount(0);

  await page.evaluate(() => {
    closeModal(); // schedules a route-scoped tutorial check for Familiars
    nav('accueil'); // leave immediately before any delayed callback can run
  });

  await page.waitForTimeout(80);
  await expect(page.locator('#tutorialCard')).toHaveCount(0);
  expect(await page.evaluate(() => ({ route, seen: !!S.tutorial.seen.familier }))).toEqual({
    route:'accueil', seen:false
  });
});

test('V460 scheduler uses synchronous mounted-route check and route-scoped delayed callbacks', async () => {
  const tutorial = fs.readFileSync('tutorial-auto-v100.js', 'utf8');
  const game = fs.readFileSync('game-5.js', 'utf8');

  expect(tutorial).toContain('nativeCheckTutorial(expected)');
  expect(tutorial).toContain("route!==expected");
  expect(tutorial).not.toContain('scheduleTutorialCheck(0);');
  expect(game).toContain('function checkTutorial(expectedRoute)');
  expect(game).toContain('checkTutorial(route);');
  expect(game).toContain('if (key === "familier")');
  expect(game).toContain('if (key === "competence")');
  expect(game).toContain('if (key === "tree")');
});
