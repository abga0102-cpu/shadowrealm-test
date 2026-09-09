const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const executable = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');

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
}

test('Phase 4E leaves V219 as the sole Home frame lifecycle owner and V209 as BottomNav geometry owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const compatibility = source('home-layout-fix-v119.js');
  const homeAuthority = source('home-layout-authority-v219.js');
  const navAuthority = source('bottom-nav-layout-v183.js');
  const legacyExecutable = executable(compatibility);

  expect(compatibility).toContain('__srHomeLayoutCompatV119');
  expect(compatibility).toContain('__srApplyHomeCompatV119');
  expect(legacyExecutable).not.toContain('window.renderTabs=function');
  expect(legacyExecutable).not.toContain('normalizeHomeFrame');
  expect(legacyExecutable).not.toContain('#app.srHomeFullArena>#tabs');
  expect(legacyExecutable).not.toContain('grid-template-columns:repeat(4');
  expect(legacyExecutable).not.toContain('#screen.fixed>.pad.mt4');

  expect(homeAuthority).toContain('__srHomeLayoutAuthorityV219');
  expect(homeAuthority).toContain('__srSyncHomeFramePhase2B');
  expect(homeAuthority).toContain('window.renderTabs=function');
  expect(homeAuthority).toContain('__srApplyHomeCompatV119');
  expect(homeAuthority).toContain('#app.srHomeFullArena>#hud>.pbox');
  expect(homeAuthority).toContain('top:0!important');

  expect(navAuthority).toContain('__srBottomNavGeometryV209');
  expect(navAuthority).toContain('normalizeIconSlot');
});

test('Phase 4E preserves Home header alignment and unique V119 compatibility after repeated routes', async ({ page }) => {
  await openCleanGame(page);

  await expect.poll(() => page.evaluate(() => ({
    home: !!window.__srHomeLayoutAuthorityV219,
    compat: !!window.__srHomeLayoutCompatV119,
    nav: !!window.__srBottomNavGeometryV209
  })), { timeout: 10000 }).toEqual({ home: true, compat: true, nav: true });

  const homeTab = page.locator('#tabs .tab[data-arg="accueil"]');
  const equipmentTab = page.locator('#tabs .tab[data-arg="equipement"]');
  const settingsTab = page.locator('#tabs .tab[data-arg="reglages"]');

  for (let round = 0; round < 2; round++) {
    if (await equipmentTab.count()) await equipmentTab.click();
    if (await settingsTab.count()) await settingsTab.click();
    await homeTab.click();
    await expect(page.locator('#app')).toHaveClass(/srHomeFullArena/);
  }

  const result = await page.evaluate(() => {
    const hud = document.getElementById('hud');
    const hero = hud && hud.querySelector(':scope > .pbox');
    const info = document.querySelector('.homeForge .iBtn');
    const infoRect = info && info.getBoundingClientRect();
    const infoStyle = info && getComputedStyle(info);
    return {
      hudTop: hud && getComputedStyle(hud).top,
      hudAlign: hud && getComputedStyle(hud).alignItems,
      heroAlign: hero && getComputedStyle(hero).alignSelf,
      infoWidth: infoRect && infoRect.width,
      infoHeight: infoRect && infoRect.height,
      infoRadius: infoStyle && infoStyle.borderRadius,
      infoLabel: info && info.getAttribute('aria-label')
    };
  });

  expect(result.hudTop).toBe('0px');
  expect(result.hudAlign).toBe('flex-start');
  expect(result.heroAlign).toBe('flex-start');
  expect(Math.abs(result.infoWidth - result.infoHeight)).toBeLessThan(0.5);
  expect(result.infoWidth).toBeGreaterThanOrEqual(27);
  expect(result.infoRadius).toBe('50%');
  expect(result.infoLabel).toBe('Informations sur les raretés');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
