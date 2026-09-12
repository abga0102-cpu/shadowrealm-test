const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gamePath = path.join(root, 'game-5.js');

function sourceWithScreenRenderedLifecycle() {
  const source = fs.readFileSync(gamePath, 'utf8');
  const commitBlock = `  sc.innerHTML = fn();
  attachArena();
  sc.scrollTop = keep;
  requestAnimationFrame(syncEquipPreviewSpacer);`;
  const lifecycleBlock = `  sc.innerHTML = fn();
  attachArena();
  sc.scrollTop = keep;
  window.dispatchEvent(new CustomEvent("sr:screenrendered",{detail:{route:route}}));
  requestAnimationFrame(syncEquipPreviewSpacer);`;
  const transformed = source.replace(commitBlock, lifecycleBlock);
  if (transformed === source) throw new Error('Expected core screen commit block was not found');
  return transformed;
}

async function openGameWithScreenRenderedLifecycle(page) {
  const transformed = sourceWithScreenRenderedLifecycle();
  await page.route('**/npm/**', (route) => route.abort());
  await page.route('**/game-5.js*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: transformed });
  });
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('shadowreach.save.local');
      localStorage.removeItem('shadowreach.social.v1.messages');
    } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#tabs .tab')).toHaveCount(4, { timeout: 15000 });

  // First-run onboarding is unrelated to this lifecycle contract. Neutralize it
  // deterministically so its scheduled checks cannot add noise to the proof.
  await page.evaluate(() => {
    if (!window.__smoke || !window.__smoke.S || !window.__smoke.S.tutorial) {
      throw new Error('Smoke state is unavailable while isolating tutorial lifecycle');
    }
    const tutorial = window.__smoke.S.tutorial;
    const seen = tutorial.seen || (tutorial.seen = {});
    ['combat', 'equipement', 'competence', 'familier', 'forge', 'raid', 'rebirth', 'megaBoss', 'tree']
      .forEach((key) => { seen[key] = true; });
    const card = document.getElementById('tutorialCard');
    if (card) card.remove();
    if (typeof clearTutorialGuide === 'function') clearTutorialGuide();
  });
}

test('screen-render lifecycle fires only after the core screen DOM commit', async ({ page }) => {
  await openGameWithScreenRenderedLifecycle(page);

  const result = await page.evaluate(() => {
    const events = [];
    const listener = (event) => {
      const screen = document.getElementById('screen');
      events.push({
        route: event && event.detail && event.detail.route,
        sentinelPresent: !!screen.querySelector('#preRenderSentinel'),
        childCount: screen.children.length,
      });
    };
    window.addEventListener('sr:screenrendered', listener);

    const screen = document.getElementById('screen');
    screen.innerHTML = '<div id="preRenderSentinel">stale</div>';
    nav('equipement');
    const afterNav = events[events.length - 1];
    const countAfterNav = events.length;

    screen.innerHTML = '<div id="preRenderSentinel">stale again</div>';
    render();
    const afterDirectRender = events[events.length - 1];
    const countAfterDirectRender = events.length;

    // BottomNav is an input to the core render, not the owner of #screen.
    // Calling it alone must not publish the post-screen-commit lifecycle.
    renderTabs();
    const countAfterTabsOnly = events.length;

    window.removeEventListener('sr:screenrendered', listener);
    return { afterNav, afterDirectRender, countAfterNav, countAfterDirectRender, countAfterTabsOnly };
  });

  expect(result.afterNav).toEqual({ route: 'equipement', sentinelPresent: false, childCount: expect.any(Number) });
  expect(result.afterNav.childCount).toBeGreaterThan(0);
  expect(result.countAfterNav).toBe(1);

  expect(result.afterDirectRender).toEqual({ route: 'equipement', sentinelPresent: false, childCount: expect.any(Number) });
  expect(result.afterDirectRender.childCount).toBeGreaterThan(0);
  expect(result.countAfterDirectRender).toBe(2);
  expect(result.countAfterTabsOnly).toBe(2);

  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
