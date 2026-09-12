const { test, expect } = require('@playwright/test');

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

for (const mode of ['idle', 'render']) {
  test(`DIAG V83 harvest queue source after ${mode}`, async ({ page }) => {
    await openCleanGame(page);

    await page.evaluate(() => {
      window.__v83HarvestDiag = [];
      const priorOpen = window.openModal;
      window.openModal = function diagOpenModal(html, title) {
        const existing = document.getElementById('overlay');
        if (existing) {
          window.__v83HarvestDiag.push({
            title: String(title || ''),
            existingModal: String(existing.getAttribute('data-modal') || ''),
            existingText: String(existing.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
            stack: String((new Error('openModal while overlay already exists')).stack || '')
          });
        }
        return priorOpen.apply(this, arguments);
      };
      showHarvestModal();
    });

    await expect(page.locator('#overlay[data-modal="harvest"]')).toHaveCount(1);

    if (mode === 'render') {
      await page.evaluate(() => render());
    }

    await page.waitForTimeout(2200);

    const beforeClose = await page.evaluate(() => ({
      attempts: window.__v83HarvestDiag || [],
      overlay: !!document.getElementById('overlay'),
      modal: document.getElementById('overlay')?.getAttribute('data-modal') || '',
      text: String(document.getElementById('overlay')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200)
    }));

    await page.evaluate(() => closeModal());
    await page.waitForTimeout(150);

    const afterClose = await page.evaluate(() => ({
      attempts: window.__v83HarvestDiag || [],
      overlay: !!document.getElementById('overlay'),
      modal: document.getElementById('overlay')?.getAttribute('data-modal') || '',
      text: String(document.getElementById('overlay')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200)
    }));

    if (beforeClose.attempts.length || afterClose.overlay) {
      throw new Error('V83_HARVEST_DIAG=' + JSON.stringify({ mode, beforeClose, afterClose }));
    }

    expect(afterClose.overlay).toBe(false);
  });
}
