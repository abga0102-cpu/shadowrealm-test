// Diagnostic only: copied temporarily into both baseline and PR checkouts by CI.
// No production code, economy, save or claim state is changed by this file.
const { test, expect } = require('@playwright/test');

test('V514 diagnose accomplishment status after reopening Defis tab', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => { if (pageErrors.length < 12) pageErrors.push(String(error)); });
  await page.route('**/npm/**', route => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srAccomplishmentsCanonicalV139 === true &&
    window.__srAccomplishmentsStabilityV138 === true &&
    typeof ACT !== 'undefined' &&
    typeof ACT.accomplishments === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  await page.evaluate(() => {
    const events = [], mutations = [], samples = [];
    const started = performance.now();
    const ids = new WeakMap();
    let nextId = 0;
    function rootId(root) {
      if (!root) return null;
      if (!ids.has(root)) ids.set(root, ++nextId);
      return ids.get(root);
    }
    function sample(tag) {
      const ov = document.getElementById('overlay');
      const root = ov && ov.querySelector('.srAch139');
      const row = root && root.querySelector('[data-ach-id="forge15"]');
      const status = row && row.querySelector('.srAchStatus481');
      const data = {
        tag, ms: Math.round(performance.now() - started),
        overlay: !!ov, rootId: rootId(root),
        tab: root && root.querySelector('[data-ach-tab].on')?.getAttribute('data-ach-tab'),
        visual: root && root.getAttribute('data-ach-visual-v481'),
        state: row && row.getAttribute('data-ach-state'),
        status: status && status.textContent.trim(),
        rewardLanes: row && row.querySelectorAll('.srRewardLane481').length,
        rowPresent: !!row
      };
      samples.push(data);
      return data;
    }
    window.addEventListener('sr:modal-state', e => {
      if (events.length < 50) events.push({
        name: 'sr:modal-state', open: e.detail && e.detail.open,
        ms: Math.round(performance.now() - started)
      });
    });
    window.addEventListener('sr:accomplishments-ready', () => {
      if (events.length < 50) events.push({
        name: 'sr:accomplishments-ready', ms: Math.round(performance.now() - started)
      });
    });
    S.forge = S.forge || {};
    S.forge.level = 15;
    S.accomplishments = S.accomplishments || {};
    S.accomplishments.claimed = { forge10: true };
    S.accomplishments.premiumClaimed = {};
    ACT.accomplishments();
    const ov = document.getElementById('overlay');
    let lastSignature = '';
    const observer = new MutationObserver(() => {
      const root = document.querySelector('#overlay .srAch139');
      const row = root && root.querySelector('[data-ach-id="forge15"]');
      const status = row && row.querySelector('.srAchStatus481');
      const signature = [rootId(root), row && row.getAttribute('data-ach-state'), !!status].join(':');
      if (signature !== lastSignature && mutations.length < 50) {
        lastSignature = signature;
        mutations.push({ ms: Math.round(performance.now() - started), signature });
      }
    });
    if (ov) observer.observe(ov, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['data-ach-state', 'data-ach-visual-v481']
    });
    window.__srAchDiagnosticV514 = { events, mutations, samples, sample, observer };
    sample('initial');
  });

  await page.locator('#overlay [data-ach-tab="defis"]').click();
  await page.evaluate(() => window.__srAchDiagnosticV514.sample('after-click'));
  for (const delay of [150, 150, 450]) {
    await page.waitForTimeout(delay);
    await page.evaluate(ms => window.__srAchDiagnosticV514.sample('after-' + ms + 'ms'), delay);
  }

  let failure = null;
  try {
    await expect(page.locator('#overlay [data-ach-id="forge15"]')).toHaveAttribute('data-ach-state', 'claimable');
    await expect(page.locator('#overlay [data-ach-id="forge15"] .srAchStatus481')).toContainText('À réclamer');
  } catch (error) {
    failure = error;
  }
  const diagnostic = await page.evaluate(() => {
    const probe = window.__srAchDiagnosticV514;
    probe.sample('after-assertion');
    probe.observer.disconnect();
    return { events: probe.events, mutations: probe.mutations, samples: probe.samples };
  });
  console.log('ACH_WEBKIT_V514_DIAGNOSTIC ' + JSON.stringify({ diagnostic, pageErrors, passed: !failure }));
  if (failure) throw failure;
});
