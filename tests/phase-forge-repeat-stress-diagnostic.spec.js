const { test, expect } = require('@playwright/test');

async function openInstrumentedGame(page, disabledSources = []) {
  await page.addInitScript((disabledSources) => {
    window.__forgeDiag = { observers: [], errors: [], disabledSources };
    const NativeMO = window.MutationObserver;
    window.MutationObserver = class extends NativeMO {
      constructor(cb) {
        const stack = String(new Error().stack || '');
        const source = /forge-worn-details-v145/.test(stack) ? 'forge-worn-details-v145' :
          /forge-equipment-safety-v151/.test(stack) ? 'forge-equipment-safety-v151' :
          /forge-ux-v273/.test(stack) ? 'forge-ux-v273' :
          /boot-stability-v115/.test(stack) ? 'boot-stability-v115' : 'other';
        const rec = { source, stack, calls: 0, records: 0, disabled: disabledSources.includes(source) };
        window.__forgeDiag.observers.push(rec);
        super((records, obs) => {
          rec.calls += 1;
          rec.records += records.length;
          return cb(records, obs);
        });
        this.__srDiagRec = rec;
      }
      observe(target, options) {
        if (this.__srDiagRec && this.__srDiagRec.disabled) return;
        return super.observe(target, options);
      }
    };
    window.addEventListener('error', e => window.__forgeDiag.errors.push(String(e.message || e.error || 'error')));
    window.addEventListener('unhandledrejection', e => window.__forgeDiag.errors.push(String(e.reason || 'rejection')));
  }, disabledSources);
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await expect(page.locator('#homeForge')).toHaveCount(1, { timeout: 15000 });
}

async function spamRealForge(page, mineral, ms) {
  await page.evaluate((mineral) => { S.minerai = mineral; render(); }, mineral);
  await page.waitForTimeout(50);
  return page.evaluate(async (ms) => {
    let attempts = 0, liveButtons = 0, enabledButtons = 0;
    const started = performance.now();
    while (performance.now() - started < ms) {
      const b = document.querySelector('#homeForge [data-act="forge"][data-arg="1"]');
      attempts++;
      if (b) {
        liveButtons++;
        if (!b.disabled) enabledButtons++;
        b.click();
      }
      await new Promise(r => setTimeout(r, 8));
    }
    return { attempts, liveButtons, enabledButtons, elapsed: performance.now() - started };
  }, ms);
}

async function snapshot(page) {
  return page.evaluate(() => ({
    route: typeof route === 'undefined' ? null : route,
    bodyNodes: document.querySelectorAll('*').length,
    homeForge: document.querySelectorAll('#homeForge').length,
    toast: document.querySelectorAll('#toast').length,
    forgeAnim: typeof forgeAnimActive === 'function' ? forgeAnimActive() : null,
    ux: window.__srForgeUXV273 ? {
      kept: window.__srForgeUXV273.kept().length,
      pending: window.__srForgeUXV273.pending(),
      suspended: window.__srForgeUXV273.suspended(),
      watching: window.__srForgeUXV273.watching()
    } : null,
    observers: (window.__forgeDiag?.observers || []).map(x => ({ source:x.source, calls:x.calls, records:x.records, disabled:x.disabled })),
    errors: (window.__forgeDiag?.errors || []).slice(),
    bootErrors: (window.__srBootErrors || []).slice()
  }));
}

async function assertStillInteractive(page) {
  const target = page.locator('[data-act="go"][data-arg="equipement"]').first();
  await expect(target).toBeVisible();
  await target.click({ timeout: 5000 });
  await expect.poll(() => page.evaluate(() => route)).toBe('equipement');
}

test.only('diagnostic: rich Forge stress with stale V145 observer disabled', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Chromium root-cause bisection');
  test.setTimeout(25000);
  await openInstrumentedGame(page, ['forge-worn-details-v145']);
  const before = await snapshot(page);
  const clicks = await spamRealForge(page, 1e12, 9000);
  await page.waitForTimeout(2300);
  const after = await snapshot(page);
  await assertStillInteractive(page);
  const result = { project:testInfo.project.name, clicks, before, after };
  console.log('FORGE_DIAG_NO_V145', JSON.stringify(result));
  expect(after.errors).toEqual([]);
  expect(after.bootErrors).toEqual([]);
  expect(after.ux.pending).toBeLessThanOrEqual(12);
  expect(after.ux.kept).toBeLessThanOrEqual(30);
  // Diagnostic PR intentionally surfaces the measurements in CI output.
  throw new Error('FORGE_DIAG_NO_V145 ' + JSON.stringify(result));
});
