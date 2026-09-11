const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

function scriptSources(html) {
  return [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
    .map((match) => match[1].split('?')[0]);
}

test('retired Hero Equipment V1 bridge source stays absent while canonical hero presentation remains', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const index = source('index.html');
  const inventory = source('RUNTIME_INVENTORY.md');

  expect(fs.existsSync(path.join(root, 'hero-equipment-v1.js'))).toBe(false);
  expect(scriptSources(index)).not.toContain('hero-equipment-v1.js');
  expect(scriptSources(index)).toContain('combat-animation-v169.js');
  const staticCount = scriptSources(index).length;
  const core = index.match(/var core=\[([^\]]+)\]/)[1].match(/'[^']+'/g);
  expect(inventory).toContain(`- ${staticCount} scripts are loaded synchronously through static \`<script src>\` entries.`);
  expect(inventory).toContain(`Index-managed subtotal: **${staticCount + core.length} JavaScript files**.`);
  expect(inventory).toContain('`hero-equipment-v1.js` (retired visual safety bridge; source retired after staged proof)');
});

test('campaign hero remains visible and free of retired Hero Equipment artifacts without V1 on Chromium and iPhone/WebKit', async ({ page }) => {
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
    return { status: H.combat && H.combat.status };
  });

  expect(setup.status).toBe('fight');
  await expect(page.locator('#arena')).toBeVisible();
  await expect.poll(async () => page.locator('#aLayer > .unit').count(), { timeout: 7000 }).toBeGreaterThan(0);

  const result = await page.evaluate(() => {
    for (let i = 0; i < 30; i++) drawArena();
    const layer = document.getElementById('aLayer');
    const hero = layer && layer.querySelector(':scope > .unit');
    const sprite = hero && hero.querySelector(':scope > img');
    return {
      hero: !!hero,
      sprite: !!sprite,
      spriteDisplay: sprite ? getComputedStyle(sprite).display : '',
      retiredClass: !!(sprite && sprite.classList.contains('heroOriginalSprite')),
      retiredVisuals: hero ? hero.querySelectorAll(':scope > .heroEqVisual').length : -1,
      animationError: window.__srWalkV169Error || '',
    };
  });

  expect(result.hero).toBe(true);
  expect(result.sprite).toBe(true);
  expect(result.spriteDisplay).not.toBe('none');
  expect(result.retiredClass).toBe(false);
  expect(result.retiredVisuals).toBe(0);
  expect(result.animationError).toBe('');
});
