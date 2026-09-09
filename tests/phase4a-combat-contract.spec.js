const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

function combatScripts(html) {
  return [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
    .map((m) => m[1].split('?')[0])
    .filter((src) => /^combat-.*\.js$/.test(src));
}

test('Phase 4A locks the three active combat owners and their load order', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  expect(combatScripts(index)).toEqual([
    'combat-consolidated-v156.js',
    'combat-polish-v157.js',
    'combat-animation-v169.js',
  ]);

  const consolidated = source('combat-consolidated-v156.js');
  const polish = source('combat-polish-v157.js');
  const animation = source('combat-animation-v169.js');

  expect(consolidated).toContain('window.setInterval');
  expect(consolidated).toContain('addBurst');
  expect(consolidated).toContain('addShake');
  expect(consolidated).toContain('combat-consolidated-v156-style');

  expect(polish).toContain('const baseSkillVfxHTML = skillVfxHTML');
  expect(polish).toContain('skillVfxHTML = function');
  expect(polish).toContain('combat-polish-v157-style');

  expect(animation).toContain('const baseDraw169=drawArena');
  expect(animation).toContain('weaponHTML=function');
  expect(animation).toContain('drawArena=function');
  expect(animation).toContain('combat-animation-v169-style');
});

test('campaign combat renders repeatedly with all active combat layers on Chromium and iPhone/WebKit', async ({ page }) => {
  await page.route('**/npm/**', (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');

  await page.waitForFunction(() => window.__smoke && typeof spawnCampaign === 'function' && typeof drawArena === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const setup = await page.evaluate(() => {
    const H = window.__smoke;
    update((st) => {
      st.level = 40;
      st.floor = 20;
      st.step = 1;
      st.stats = { sante: 100, degats: 100, crit: 0, critred: 0 };
      st.skills = {};
      st.skillSlots = [null, null, null, null, null];
      st.autoSkills = false;
      st.pets = [];
      st.activePetId = null;
    });
    H.D = computeDerived(H.S);
    nav('accueil');
    render();
    H.combat = spawnCampaign(H.S);
    drawArena();
    return {
      status: H.combat && H.combat.status,
      consolidatedStyle: !!document.getElementById('combat-consolidated-v156-style'),
      polishStyle: !!document.getElementById('combat-polish-v157-style'),
      animationStyle: !!document.getElementById('combat-animation-v169-style'),
    };
  });

  expect(setup.status).toBe('fight');
  expect(setup.consolidatedStyle).toBe(true);
  expect(setup.polishStyle).toBe(true);
  expect(setup.animationStyle).toBe(true);

  await expect(page.locator('#arena')).toBeVisible();
  await expect.poll(async () => page.locator('#arena .unit').count(), { timeout: 7000 }).toBeGreaterThan(0);

  const stable = await page.evaluate(() => {
    const H = window.__smoke;
    for (let i = 0; i < 30; i++) drawArena();
    const arena = document.getElementById('arena');
    const units = document.querySelectorAll('#arena .unit');
    return {
      alive: !!H.combat,
      arenaHeight: arena ? arena.clientHeight : 0,
      unitCount: units.length,
      animationError: window.__srWalkV169Error || '',
    };
  });

  expect(stable.alive).toBe(true);
  expect(stable.arenaHeight).toBeGreaterThan(80);
  expect(stable.unitCount).toBeGreaterThan(0);
  expect(stable.animationError).toBe('');
});
