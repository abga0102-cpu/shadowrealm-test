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

  // BottomNav publishes before core render commits #screen. The replacement
  // lifecycle must therefore defer through the existing rAF queue and still
  // classify the freshly committed controls without DOM observation.
  await page.evaluate(() => {
    const screen = document.getElementById('screen');
    window.dispatchEvent(new Event('sr:bottomnavrendered'));
    screen.innerHTML = '<button data-act="proofConfirm">Confirmer</button>' +
      '<button data-act="proofBack">Retour</button>';
  });
  await expect(page.locator('#screen [data-act="proofConfirm"]')).toHaveAttribute('data-primary-action', 'true');
  await expect(page.locator('#screen [data-act="proofBack"]')).toHaveAttribute('data-secondary-action', 'true');

  // Modal ownership already publishes sr:modal-state. Opening a real modal must
  // refresh the hierarchy through that canonical lifecycle, again with no observer.
  await page.evaluate(() => {
    openModal(
      '<button class="btn" data-act="closeModal">Fermer</button>' +
      '<button class="btn" data-act="proofConfirmModal">Confirmer</button>',
      'Decision hierarchy proof'
    );
  });
  await expect(page.locator('#overlay [data-act="proofConfirmModal"]')).toHaveAttribute('data-primary-action', 'true');
  await expect(page.locator('#overlay [data-act="closeModal"]')).toHaveAttribute('data-secondary-action', 'true');

  await page.evaluate(() => closeModal());
  await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
