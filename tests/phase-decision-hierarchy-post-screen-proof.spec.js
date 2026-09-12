const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gamePath = path.join(root, 'game-5.js');

function sourceWithPostScreenLifecycleProof() {
  const source = fs.readFileSync(gamePath, 'utf8');

  const commitMarker = `  sc.scrollTop = keep;
  requestAnimationFrame(syncEquipPreviewSpacer);`;
  const committedLifecycle = `  sc.scrollTop = keep;
  window.dispatchEvent(new Event("sr:screenrendered"));
  requestAnimationFrame(syncEquipPreviewSpacer);`;
  let transformed = source.replace(commitMarker, committedLifecycle);
  if (transformed === source) throw new Error('Expected post-screen render commit marker was not found');

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
  window.addEventListener("sr:screenrendered",queueDecisionHierarchyV30);
  window.addEventListener("sr:modal-state",queueDecisionHierarchyV30);
  const screen=document.getElementById("screen");
  if(screen)screen.addEventListener("scroll",queueDecisionHierarchyV30,{passive:true});
}`;
  const beforeDecisionSwap = transformed;
  transformed = transformed.replace(observerBlock, eventDrivenBlock);
  if (transformed === beforeDecisionSwap) throw new Error('Expected Decision Hierarchy V30 observer block was not found');
  if (transformed.includes('const observer=new MutationObserver(queueDecisionHierarchyV30);')) {
    throw new Error('Decision Hierarchy V30 observer unexpectedly remains in transformed source');
  }
  return transformed;
}

async function openGameWithPostScreenLifecycleProof(page) {
  const transformed = sourceWithPostScreenLifecycleProof();
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

test('post-screen lifecycle closes the Decision Hierarchy route ordering gap', async ({ page }) => {
  await openGameWithPostScreenLifecycleProof(page);

  const lifecycleState = await page.evaluate(async () => {
    const seen = [];
    let confirm = null;
    let back = null;
    const onRendered = () => {
      const screen = document.getElementById('screen');
      if (!screen) return;

      confirm = document.createElement('button');
      confirm.setAttribute('data-act', 'proofConfirm');
      confirm.textContent = 'Confirmer';
      confirm.style.cssText = 'position:fixed;top:80px;left:8px;width:120px;height:40px;z-index:9999';
      back = document.createElement('button');
      back.setAttribute('data-act', 'proofBack');
      back.textContent = 'Retour';
      back.style.cssText = 'position:fixed;top:126px;left:8px;width:120px;height:40px;z-index:9999';
      screen.append(confirm, back);

      seen.push({
        route,
        hasScreenContent: !!screen.children.length,
        onSecondaryRoute: !screen.querySelector('.campaignWorld'),
      });
    };
    window.addEventListener('sr:screenrendered', onRendered);

    nav('equipement');

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.removeEventListener('sr:screenrendered', onRendered);

    return {
      event: seen[seen.length - 1] || null,
      probesStillConnected: !!(confirm && back && confirm.isConnected && back.isConnected),
      primary: confirm && confirm.getAttribute('data-primary-action'),
      secondary: back && back.getAttribute('data-secondary-action'),
      renderEvents: seen.length,
      routeAfterFrames: route,
    };
  });

  expect(lifecycleState).toEqual({
    event: { route: 'equipement', hasScreenContent: true, onSecondaryRoute: true },
    probesStillConnected: true,
    primary: 'true',
    secondary: 'true',
    renderEvents: expect.any(Number),
    routeAfterFrames: 'equipement',
  });

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
