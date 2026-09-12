const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const exists = (name) => fs.existsSync(path.join(root, name));
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

  // This test exercises repeated BottomNav routing and Home geometry, not the
  // first-run tutorial. On WebKit/iPhone the tutorial can mount after the tabs
  // become ready and intercept those route clicks, so settle that independent
  // startup surface before exercising navigation. Assertions below are unchanged.
  const tutorialConfirm = page.getByRole('button', { name: 'Compris' });
  try {
    await tutorialConfirm.waitFor({ state: 'visible', timeout: 2000 });
    await tutorialConfirm.click();
    await expect(tutorialConfirm).toHaveCount(0);
  } catch (_) {
    // No tutorial is expected for already-settled fixtures/projects.
  }
}

test('Phase 4E leaves V219 as the sole Home frame lifecycle owner and V209 as BottomNav geometry owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const homeAuthority = source('home-layout-authority-v219.js');
  const navAuthority = source('bottom-nav-layout-v183.js');
  const homeExecutable = executable(homeAuthority);

  expect(exists('social-forge-layout-v1.js')).toBe(false);
  expect(exists('home-layout-fix-v119.js')).toBe(false);

  expect(homeAuthority).toContain('__srHomeLayoutAuthorityV219');
  expect(homeAuthority).toContain('__srHomeFramePhase2B');
  expect(homeAuthority).toContain('__srHomeLayoutCompatV119');
  expect(homeAuthority).toContain('__srSyncHomeFramePhase2B');
  expect(homeExecutable).not.toContain('window.renderTabs=function');
  expect(homeExecutable).toContain("addEventListener('sr:bottomnavrendered',schedule)");
  expect(homeAuthority).toContain('__srApplyHomeCompatV119');
  expect(homeAuthority).toContain('#app.srHomeFullArena>#hud>.pbox');
  expect(homeAuthority).toContain('top:0!important');

  expect(navAuthority).toContain('__srBottomNavGeometryV209');
  expect(navAuthority).toContain('normalizeIconSlot');
  expect(navAuthority).toContain('window.renderTabs=function');
  expect(navAuthority).toContain("new Event('sr:bottomnavrendered')");
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

  // srHomeFullArena may still be present from the preceding Home frame while
  // V219's canonical BottomNav RAF is decorating the newly rendered controls.
  // Wait for that owned lifecycle result before taking the synchronous snapshot.
  await expect(page.locator('.homeForge .iBtn')).toHaveAttribute(
    'aria-label',
    'Informations sur les raretés'
  );

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
