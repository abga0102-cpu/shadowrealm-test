const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gamePath = path.join(root, 'game-5.js');

function sourceWithEventDrivenDecisionHierarchy() {
  const source = fs.readFileSync(gamePath, 'utf8');
  const observerBlock = `function startDecisionHierarchyV30(){
  refreshDecisionHierarchyV30();
  const observer=new MutationObserver(queueDecisionHierarchyV30);
  const screen=document.getElementById("screen"),app=document.getElementById("app");
  if(screen)observer.observe(screen,{childList:true});
  if(app)observer.observe(app,{childList:true});
  if(screen)screen.addEventListener("scroll",queueDecisionHierarchyV30,{passive:true});
}`;
  const eventDrivenBlock = `function startDecisionHierarchyV30(){
  refreshDecisionHierarchyV30();
  window.addEventListener("sr:bottomnavrendered",queueDecisionHierarchyV30);
  window.addEventListener("sr:modal-state",queueDecisionHierarchyV30);
  const screen=document.getElementById("screen");
  if(screen)screen.addEventListener("scroll",queueDecisionHierarchyV30,{passive:true});
}`;
  const transformed = source.replace(observerBlock, eventDrivenBlock);
  if (transformed === source) throw new Error('Expected Decision Hierarchy V30 observer block was not found');
  if (transformed.includes('const observer=new MutationObserver(queueDecisionHierarchyV30);')) {
    throw new Error('Decision Hierarchy V30 observer unexpectedly remains in transformed source');
  }
  return transformed;
}

async function openGameWithEventDrivenDecisionHierarchy(page) {
  const transformed = sourceWithEventDrivenDecisionHierarchy();
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
}

test('Decision Hierarchy keeps route and modal semantics without MutationObserver', async ({ page }) => {
  await openGameWithEventDrivenDecisionHierarchy(page);

  // Use a real route transition. BottomNav publishes before core render commits
  // the new #screen, so the existing rAF queue must classify controls appended
  // immediately after nav() returns without relying on DOM observation.
  const routeState = await page.evaluate(async () => {
    nav('equipement');
    const screen = document.getElementById('screen');
    const confirm = document.createElement('button');
    confirm.setAttribute('data-act', 'proofConfirm');
    confirm.textContent = 'Confirmer';
    confirm.style.cssText = 'position:fixed;top:80px;left:8px;width:120px;height:40px;z-index:9999';
    const back = document.createElement('button');
    back.setAttribute('data-act', 'proofBack');
    back.textContent = 'Retour';
    back.style.cssText = 'position:fixed;top:126px;left:8px;width:120px;height:40px;z-index:9999';
    screen.append(confirm, back);

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {
      primary: confirm.getAttribute('data-primary-action'),
      secondary: back.getAttribute('data-secondary-action'),
      onSecondaryRoute: !screen.querySelector('.campaignWorld'),
    };
  });
  expect(routeState).toEqual({ primary: 'true', secondary: 'true', onSecondaryRoute: true });

  // Modal ownership already publishes sr:modal-state after the native overlay
  // is committed. Capture the attributes after the queued frame so a later game
  // render cannot turn this into a synthetic-DOM timing race.
  const modalState = await page.evaluate(async () => {
    openModal(
      '<button class="btn" data-act="closeModal">Fermer</button>' +
      '<button class="btn" data-act="proofConfirmModal">Confirmer</button>',
      'Decision hierarchy proof'
    );
    const overlay = document.getElementById('overlay');
    const confirm = overlay.querySelector('[data-act="proofConfirmModal"]');
    const close = overlay.querySelector('button[data-act="closeModal"]');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {
      primary: confirm && confirm.getAttribute('data-primary-action'),
      secondary: close && close.getAttribute('data-secondary-action'),
    };
  });
  expect(modalState).toEqual({ primary: 'true', secondary: 'true' });

  await page.evaluate(() => closeModal());
  await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
