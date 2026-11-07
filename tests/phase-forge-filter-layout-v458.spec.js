const { test, expect } = require('@playwright/test');

async function openForge(page, viewport = { width: 390, height: 844 }) {
  await page.setViewportSize(viewport);
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => { try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {} });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    window.__srForgePanelAuthorityV266 &&
    window.__srForgePanelAuthorityV266.revision === 458 &&
    window.__srHomeLayoutAuthorityV219 &&
    typeof showForgeFilterPicker === 'function'
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForSelector('#homeForge .srForgeFilter266');
}

test('V458 Home Forge keeps the filter visible inside its fixed lane', async ({ page }) => {
  await openForge(page, { width: 390, height: 844 });

  const normal = await page.evaluate(() => {
    const filter = document.querySelector('#homeForge .srForgeFilter266');
    const lane = document.querySelector('#screen.fixed > .pad.mt4');
    const panel = document.querySelector('#homeForge');
    const f = filter.getBoundingClientRect();
    const l = lane.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    return {
      filter: { top:f.top, bottom:f.bottom, height:f.height },
      lane: { top:l.top, bottom:l.bottom, height:l.height },
      panel: { top:p.top, bottom:p.bottom, height:p.height },
      display:getComputedStyle(filter).display,
      visibility:getComputedStyle(filter).visibility,
      opacity:Number(getComputedStyle(filter).opacity)
    };
  });

  expect(normal.display).not.toBe('none');
  expect(normal.visibility).toBe('visible');
  expect(normal.opacity).toBeGreaterThan(0);
  expect(normal.filter.height).toBeGreaterThanOrEqual(28);
  expect(normal.filter.top).toBeGreaterThanOrEqual(normal.lane.top - 1);
  expect(normal.filter.bottom).toBeLessThanOrEqual(normal.lane.bottom + 1);
  expect(normal.panel.bottom).toBeLessThanOrEqual(normal.lane.bottom + 1);
});

test('V458 short mobile Home still shows the Forge filter', async ({ page }) => {
  await openForge(page, { width: 375, height: 667 });

  const rects = await page.evaluate(() => {
    const filter = document.querySelector('#homeForge .srForgeFilter266').getBoundingClientRect();
    const lane = document.querySelector('#screen.fixed > .pad.mt4').getBoundingClientRect();
    return { filterBottom:filter.bottom, laneBottom:lane.bottom, filterHeight:filter.height };
  });

  expect(rects.filterHeight).toBeGreaterThanOrEqual(28);
  expect(rects.filterBottom).toBeLessThanOrEqual(rects.laneBottom + 1);
});

test('V458 filter modal owns Auto-Forge batch controls and rarity filters in one organized window', async ({ page }) => {
  await openForge(page, { width: 390, height: 844 });

  await page.evaluate(() => {
    S.level = 20;
    S.forge.level = Math.max(25, S.forge.level || 1);
    if (!S.forge.autoBatch) S.forge.autoBatch = 1;
    render();
    showForgeFilterPicker();
  });

  const overlay = page.locator('#overlay');
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText('AUTO-FORGE');
  await expect(overlay).toContainText('FILTRE AUTO-RECYCLAGE');
  await expect(page.locator('#srAutoBatch266')).toBeVisible();
  await expect(page.locator('#srAutoBatch266 .srBatch266')).toHaveCount(4);
  await expect(page.locator('.srForgeRarityGrid458 .srForgeRarity458')).toHaveCount(11);
  await expect(page.locator('.srForgeFilterFooter458 [data-act="closeModal"]')).toBeVisible();

  const layout = await page.evaluate(() => {
    const card = document.querySelector('#overlay > .card').getBoundingClientRect();
    const auto = document.querySelector('.srForgeFilterSection458.auto').getBoundingClientRect();
    const filter = document.querySelector('.srForgeFilterSection458.filter').getBoundingClientRect();
    const footer = document.querySelector('.srForgeFilterFooter458').getBoundingClientRect();
    const modal = document.querySelector('.srForgeFilterModal458');
    return {
      card:{top:card.top,bottom:card.bottom},
      auto:{top:auto.top,bottom:auto.bottom},
      filter:{top:filter.top,bottom:filter.bottom},
      footer:{top:footer.top,bottom:footer.bottom},
      overflowY:getComputedStyle(modal).overflowY
    };
  });

  expect(layout.auto.top).toBeGreaterThanOrEqual(layout.card.top);
  expect(layout.filter.top).toBeGreaterThan(layout.auto.top);
  expect(layout.footer.bottom).toBeLessThanOrEqual(layout.card.bottom + 1);
  expect(['auto','scroll']).toContain(layout.overflowY);
});

test('V458 short mobile modal keeps Auto-Forge controls and close action accessible', async ({ page }) => {
  await openForge(page, { width: 375, height: 667 });
  await page.evaluate(() => {
    S.level = 20;
    S.forge.level = Math.max(25, S.forge.level || 1);
    render();
    showForgeFilterPicker();
  });

  await expect(page.locator('#srAutoBatch266')).toBeVisible();
  await expect(page.locator('.srForgeFilterFooter458 [data-act="closeModal"]')).toBeVisible();

  const bounds = await page.evaluate(() => {
    const card = document.querySelector('#overlay > .card').getBoundingClientRect();
    const batch = document.querySelector('#srAutoBatch266').getBoundingClientRect();
    const footer = document.querySelector('.srForgeFilterFooter458').getBoundingClientRect();
    return { cardBottom:card.bottom, batchTop:batch.top, footerBottom:footer.bottom };
  });
  expect(bounds.batchTop).toBeLessThan(bounds.cardBottom);
  expect(bounds.footerBottom).toBeLessThanOrEqual(bounds.cardBottom + 1);
});

test('V458 no longer relies on late DOM injection for Auto-Forge batch controls', async () => {
  const fs = require('fs');
  const ux = fs.readFileSync('forge-ux-v273.js', 'utf8');
  const core = fs.readFileSync('game-2.js', 'utf8');
  expect(core).toContain('id="srAutoBatch266" class="srAutoBatch458"');
  expect(core).toContain('FILTRE AUTO-RECYCLAGE');
  expect(ux).not.toContain('function injectBatch()');
  expect(ux).toContain('#srAutoBatch266 is rendered directly by showForgeFilterPicker()');
});
