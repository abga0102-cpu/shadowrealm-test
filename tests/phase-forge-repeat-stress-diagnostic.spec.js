const { test, expect } = require('@playwright/test');

async function openInstrumentedGame(page) {
  await page.addInitScript(() => {
    window.__forgeDiag = { observers: [], errors: [] };
    const NativeMO = window.MutationObserver;
    window.MutationObserver = class extends NativeMO {
      constructor(cb) {
        const stack = String(new Error().stack || '');
        const rec = { stack, calls: 0, records: 0 };
        window.__forgeDiag.observers.push(rec);
        super((records, obs) => {
          rec.calls += 1;
          rec.records += records.length;
          return cb(records, obs);
        });
      }
    };
    window.addEventListener('error', e => window.__forgeDiag.errors.push(String(e.message || e.error || 'error')));
    window.addEventListener('unhandledrejection', e => window.__forgeDiag.errors.push(String(e.reason || 'rejection')));
  });
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
    return { attempts, liveButtons, enabledButtons };
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
    observers: (window.__forgeDiag?.observers || []).map(x => ({ calls:x.calls, records:x.records, stack:x.stack })),
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

test('diagnostic: repeated Forge clicks with no Minerai stay interactive', async ({ page }) => {
  await openInstrumentedGame(page);
  const clicks = await spamRealForge(page, 0, 4000);
  const state = await snapshot(page);
  console.log('FORGE_DIAG_EMPTY', JSON.stringify({ clicks, state }));
  expect(state.homeForge).toBe(1);
  expect(state.toast).toBeLessThanOrEqual(1);
  expect(state.errors).toEqual([]);
  expect(state.bootErrors).toEqual([]);
  await assertStillInteractive(page);
});

test('diagnostic: repeated Forge clicks with abundant Minerai stay bounded and interactive', async ({ page }) => {
  test.setTimeout(30000);
  await openInstrumentedGame(page);
  const before = await snapshot(page);
  const clicks = await spamRealForge(page, 1e12, 9000);
  await page.waitForTimeout(2300);
  const after = await snapshot(page);
  console.log('FORGE_DIAG_RICH', JSON.stringify({ clicks, before, after }));
  expect(after.homeForge).toBe(1);
  expect(after.errors).toEqual([]);
  expect(after.bootErrors).toEqual([]);
  expect(after.ux.pending).toBeLessThanOrEqual(12);
  expect(after.ux.kept).toBeLessThanOrEqual(30);
  await assertStillInteractive(page);
});
