const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

test('Tree V216 popup sync is interaction-scoped without a startup timer', async ({ page }) => {
  const canonical = fs.readFileSync(path.join(root, 'runtime-tree-stability-v216.js'), 'utf8');

  expect(canonical).toContain('function syncPopup()');
  expect(canonical).toContain("document.addEventListener('click'");
  expect(canonical).toContain('setTimeout(queuePopupSync,40)');
  expect(canonical).toContain("document.addEventListener('pointerup'");
  expect(canonical).not.toContain('setTimeout(syncPopup,0)');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof S !== 'undefined' && !!window.__srRuntimeTreeStabilityV216);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const probeReady = await page.evaluate(() => {
    const key = TREE_NODES.find((node) => node && node.masteryKey && !node.deprecatedKey);
    if (!key) return false;

    const dialog = document.createElement('div');
    dialog.id = 'srV216ProbeDialog';
    dialog.setAttribute('role', 'dialog');

    const title = document.createElement('span');
    title.textContent = key.label || key.id;
    const requirement = document.createElement('span');
    requirement.id = 'srV216ProbeText';
    requirement.textContent = "Requiert d'abord";
    dialog.append(title, requirement);

    const trigger = document.createElement('button');
    trigger.id = 'srV216ProbeTrigger';
    trigger.type = 'button';
    trigger.setAttribute('data-act', 'treeNode');
    trigger.textContent = 'Tree lifecycle probe';

    document.body.append(dialog, trigger);
    return true;
  });

  expect(probeReady).toBe(true);
  await page.locator('#srV216ProbeTrigger').click();
  await expect(page.locator('#srV216ProbeText')).toContainText('Maîtrise ');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
