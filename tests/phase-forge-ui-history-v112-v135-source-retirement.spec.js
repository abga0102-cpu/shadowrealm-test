const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const retired = [
  path.join(root, 'forge-ux-v112.js'),
  path.join(root, 'forge-social-fix-v135.js')
];

test('retired Forge V112/V135 UI history stays absent while current Forge owners remain loaded', async ({ page }) => {
  for (const file of retired) expect(fs.existsSync(file)).toBe(false);
  expect(index).not.toContain('forge-ux-v112.js');
  expect(index).not.toContain('forge-social-fix-v135.js');
  expect((index.match(/forge-ux-v273\.js/g) || []).length).toBe(1);
  expect((index.match(/forge-panel-authority-v266\.js/g) || []).length).toBe(1);
  expect((index.match(/forge-worn-details-v145\.js/g) || []).length).toBe(1);

  await page.goto('/index.html');
  await page.waitForFunction(() => document.readyState === 'complete');

  const legacy = await page.evaluate(() => ({
    v112Guard: typeof window.__srForgeUxV112,
    v135Guard: typeof window.__srForgeSocialFixV135,
    v112Style: !!document.getElementById('srForgeUxV112Style'),
    v135Style: !!document.getElementById('srForgeSocialFixV135Style'),
    unequipHook: typeof (window.ACT && window.ACT.srUnequipGear),
    dustAskHook: typeof (window.ACT && window.ACT.srAskDustGear),
    dustHook: typeof (window.ACT && window.ACT.srDustGear),
    recycleHook: typeof (window.ACT && window.ACT.recycleEquippedV135),
    recycleAskHook: typeof (window.ACT && window.ACT.askRecycleEquippedV135)
  }));

  expect(legacy).toEqual({
    v112Guard: 'undefined',
    v135Guard: 'undefined',
    v112Style: false,
    v135Style: false,
    unequipHook: 'undefined',
    dustAskHook: 'undefined',
    dustHook: 'undefined',
    recycleHook: 'undefined',
    recycleAskHook: 'undefined'
  });
});
