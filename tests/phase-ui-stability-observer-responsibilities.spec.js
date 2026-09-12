const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { touchCurrentLocator } = require('./helpers/render-stable-touch');

const root = path.join(__dirname, '..');

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
  await expect.poll(() => page.evaluate(() => !!window.__srModalLifecyclePhase2C), { timeout: 10000 }).toBe(true);
}

async function activate(page, locator, testInfo) {
  if (testInfo.project.name === 'webkit-iphone') {
    await touchCurrentLocator(page, locator, { label: 'UI stability modal action' });
  } else {
    await locator.click();
  }
}

function activeRuntimeScripts() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  return [...new Set([...html.matchAll(/["']([A-Za-z0-9._-]+\.js)(?:\?[^"']*)?["']/g)].map((m) => m[1]))];
}

test('V83 uses deterministic modal and campaign lifecycles without a broad app observer', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const source = fs.readFileSync(path.join(root, 'ui-stability-v83.js'), 'utf8');

  expect(source).toContain("setAttribute('data-sr-persistent','1')");
  expect(source).toContain("CustomEvent('sr:modal-state'");
  expect(source).toContain("classList.toggle('srHomeCompact'");
  expect(source).toContain("window.addEventListener('sr:bottomnavrendered',scheduleCampaignCompact)");
  expect(source).toContain('function nativeOpenSafe(ctx,args)');
  expect(source).toContain('function nativeCloseSafe(ctx,args)');
  expect(source).toContain('markOverlay();\n  publishModalState(true);');
  expect(source).not.toContain('new MutationObserver(schedule).observe(app,{childList:true,subtree:false})');
  expect(source).not.toContain("const app=document.getElementById('app');");
});

test('active runtime keeps direct overlay creation and removal in the native modal owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  const scripts = activeRuntimeScripts();
  expect(scripts).toContain('game-3.js');
  const core = fs.readFileSync(path.join(root, 'game-3.js'), 'utf8');
  expect(core).toContain('ov.id = "overlay";');
  expect(core).toContain('document.getElementById("app").appendChild(ov);');
  expect(core).toContain('if (ov) ov.remove();');

  const offenders = [];
  for (const file of scripts) {
    if (file === 'game-3.js') continue;
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) continue;
    const source = fs.readFileSync(filePath, 'utf8');
    const directPatterns = [
      [/\.id\s*=\s*["']overlay["']/, 'assigns #overlay id'],
      [/setAttribute\(\s*["']id["']\s*,\s*["']overlay["']/, 'sets #overlay id'],
      [/id\s*=\s*\\?["']overlay\\?["']/, 'embeds a new #overlay element'],
      [/getElementById\(\s*["']overlay["']\s*\)\s*\??\.\s*(?:remove|replaceWith)\s*\(/, 'removes/replaces #overlay directly'],
      [/querySelector\(\s*["']#overlay["']\s*\)\s*\??\.\s*(?:remove|replaceWith)\s*\(/, 'removes/replaces #overlay directly'],
    ];
    for (const [pattern, label] of directPatterns) {
      if (pattern.test(source)) offenders.push(`${file}: ${label}`);
    }

    const binding = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*document\.getElementById\(\s*["']overlay["']\s*\)/g;
    let match;
    while ((match = binding.exec(source))) {
      const name = match[1].replace(/[$]/g, '\\$&');
      const nearby = source.slice(match.index, match.index + 700);
      const mutation = new RegExp(`\\b${name}\\s*\\.\\s*(?:remove|replaceWith)\\s*\\(`);
      const parentRemoval = new RegExp(`removeChild\\s*\\(\\s*${name}\\s*\\)`);
      if (mutation.test(nearby) || parentRemoval.test(nearby)) {
        offenders.push(`${file}: mutates #overlay through local binding ${match[1]}`);
      }
    }
  }
  expect(offenders).toEqual([]);
});

test('V83 preserves overlay tagging, modal-state publication and queued-modal draining', async ({ page }, testInfo) => {
  await openCleanGame(page);

  await page.evaluate(() => {
    window.__leanV83ModalStates = [];
    window.addEventListener('sr:modal-state', (event) => {
      window.__leanV83ModalStates.push(!!(event && event.detail && event.detail.open));
    });
    openModal('<button class="btn" data-act="closeModal">Fermer A</button>', 'Lean V83 A');
  });

  const first = page.locator('#overlay');
  await expect(first).toHaveCount(1);
  await expect(first).toHaveAttribute('data-sr-persistent', '1');
  await expect(first).toContainText('Lean V83 A');

  await page.evaluate(() => {
    openModal('<button class="btn" data-act="closeModal">Fermer B</button>', 'Lean V83 B');
  });
  await expect(page.locator('#overlay')).toContainText('Lean V83 A');
  await expect(page.locator('#overlay')).not.toContainText('Lean V83 B');

  await activate(page, page.locator('#overlay [data-act="closeModal"]').first(), testInfo);
  await expect(page.locator('#overlay')).toContainText('Lean V83 B', { timeout: 5000 });
  await expect(page.locator('#overlay')).toHaveAttribute('data-sr-persistent', '1');

  await activate(page, page.locator('#overlay [data-act="closeModal"]').first(), testInfo);
  await expect(page.locator('#overlay')).toHaveCount(0, { timeout: 3000 });

  const states = await page.evaluate(() => window.__leanV83ModalStates || []);
  expect(states).toContain(true);
  expect(states[states.length - 1]).toBe(false);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});

test('V83 campaign compact tagging follows real bottom-nav navigation', async ({ page }, testInfo) => {
  await openCleanGame(page);

  const homeTab = page.locator('#tabs .tab').first();
  const equipmentTab = page.locator('#tabs .tab').nth(1);

  await activate(page, homeTab, testInfo);
  await expect(page.locator('#screen .campaignWorld')).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('#screen')).toHaveClass(/srHomeCompact/);

  await activate(page, equipmentTab, testInfo);
  await expect(page.locator('#screen .campaignWorld')).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator('#screen')).not.toHaveClass(/srHomeCompact/);

  await activate(page, homeTab, testInfo);
  await expect(page.locator('#screen .campaignWorld')).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('#screen')).toHaveClass(/srHomeCompact/);
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
});
