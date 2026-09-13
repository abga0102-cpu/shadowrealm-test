const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function source(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

test.describe('duplicate-free permanent navigation', () => {
  test('keeps legacy route ids while one owner presents Home / Equipment / Progression / Menu', async ({ page }) => {
    const nav = source('bottom-nav-layout-v183.js');
    const accomplishments = source('accomplishments-canonical-v139.js');
    const premium = source('premium-ui-v209.js');

    expect(nav).toContain("const LABELS={developpement:'Progression',parametres:'Menu'}");
    expect(nav).toContain("SCREENS.developpement=function()");
    expect(nav).toContain("SCREENS.parametres=function()");
    expect(nav).toContain("if(item.route&&typeof SCREENS[item.route]!=='function')return false");
    expect(nav).toContain('#app.srHomeFullArena #screen .worldNavLayer>.worldDev,#app.srHomeFullArena #screen .worldNavLayer>.worldDefis,#app.srHomeFullArena #screen .worldNavLayer>.worldMenu,#app.srHomeFullArena #screen .worldNavLayer>.worldRebirth{display:none!important}');
    expect(nav).not.toContain("{label:'Rebirth',route:'rebirth'");

    expect(accomplishments).toContain("var oldProgress=SCREENS.developpement");
    expect(accomplishments).toContain("SCREENS.developpement=function()");
    expect(accomplishments).not.toContain('installSettingsEntry');

    expect(premium).toContain('/* Semantic action hierarchy: one primary language, one normal language, red only for danger. */');
    expect(premium).toContain('.btn.green,.btn.blue,.btn.purple,.btn.teal,.btn.orange');
    expect(premium).toContain('.btn.red{');

    await page.goto('/index.html?smoke=1');
    await page.waitForFunction(() => window.__srBottomNavGeometryV209 === true && window.__srNavigationHubsV209 === true);

    const tabs = page.locator('#tabs > .tab');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toContainText('Accueil');
    await expect(tabs.nth(1)).toContainText('Équipement');
    await expect(tabs.nth(2)).toContainText('Progression');
    await expect(tabs.nth(3)).toContainText('Menu');

    const homePermanent = await page.evaluate(() => {
      const visible = (selector) => Array.from(document.querySelectorAll(selector)).filter((el) => {
        const s = getComputedStyle(el);
        return s.display !== 'none' && s.visibility !== 'hidden';
      }).length;
      return {
        development: visible('#app.srHomeFullArena .worldDev'),
        challenges: visible('#app.srHomeFullArena .worldDefis'),
        menu: visible('#app.srHomeFullArena .worldMenu'),
        rebirth: visible('#app.srHomeFullArena .worldRebirth')
      };
    });
    expect(homePermanent).toEqual({ development: 0, challenges: 0, menu: 0, rebirth: 0 });

    await page.locator('#tabs > .tab[data-arg="developpement"]').click();
    await expect(page.locator('#topbar .title')).toHaveText('Progression');
    await expect(page.locator('[data-act="accomplishments"]')).toHaveCount(1);
    await expect(page.locator('[data-act="go"][data-arg="rebirth"]')).toHaveCount(0);

    for (const route of ['arbre', 'familiers', 'competences', 'defis', 'ascension']) {
      expect(await page.locator(`[data-act="go"][data-arg="${route}"]`).count()).toBeLessThanOrEqual(1);
    }

    await page.locator('#tabs > .tab[data-arg="parametres"]').click();
    await expect(page.locator('#topbar .title')).toHaveText('Menu');
    await expect(page.getByText('Réglages', { exact: true })).toHaveCount(1);
    await expect(page.locator('[data-act="accomplishments"]')).toHaveCount(0);

    for (const route of ['boutique', 'evenement', 'classement']) {
      expect(await page.locator(`[data-act="go"][data-arg="${route}"]`).count()).toBeLessThanOrEqual(1);
    }
    const clanLinks = await page.locator('[data-act="go"][data-arg="clan"], [data-act="locked"][data-arg="10"]').count();
    expect(clanLinks).toBeLessThanOrEqual(1);
    await expect(page.locator('[data-act="go"][data-arg="chat"]')).toHaveCount(0);

    await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  });
});
