const { test, expect } = require('@playwright/test');

test('V504 exposes 9 h and 1 day simulation and keeps Jour tied to exact simulated time', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__smoke && window.__smoke.S && typeof simulateTimeHours === 'function');

  const out = await page.evaluate(() => {
    const s = window.__smoke.S;
    const now = Date.now();
    s.firstSeen = now;
    s.simulatedMs = 0;
    s.forge.upgradeEnd = now + 12 * 3600 * 1000;
    s.harvest = { secs: 0, minerai: 0, essence: 0, eclat: 0, gold: 0 };

    const day0 = simulatedDayCount(s, now);
    const forge0 = s.forge.upgradeEnd;

    const nine = simulateTimeHours(9);
    const forgeAfter9 = s.forge.upgradeEnd;
    const dayAfter9 = simulatedDayCount(s, now);

    const oneDay = simulateTimeHours(24);
    const dayAfterDay = simulatedDayCount(s, now);

    return {
      day0,
      dayAfter9,
      dayAfterDay,
      nine,
      oneDay,
      simulatedMs: s.simulatedMs,
      forgeReducedMs: forge0 - forgeAfter9
    };
  });

  expect(out.day0).toBe(1);
  expect(out.nine).toMatchObject({ ok: true, hours: 9, day: 1 });
  expect(out.dayAfter9).toBe(1);
  expect(out.oneDay.ok).toBe(true);
  expect(out.oneDay.hours).toBe(24);
  expect(out.dayAfterDay).toBe(2);
  expect(out.simulatedMs).toBe(33 * 3600 * 1000);
  expect(out.forgeReducedMs).toBeGreaterThanOrEqual(9 * 3600 * 1000 - 1000);

  await page.evaluate(() => nav('parametres'));
  await expect(page.getByRole('button', { name: /Simuler 9 h/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Simuler 1 jour/ })).toBeVisible();
  await expect(page.getByText('Temps simulé', { exact: true })).toBeVisible();
});

test('V504 converts legacy testDays into exact simulated milliseconds once', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof migrate === 'function');
  const out = await page.evaluate(() => {
    const raw = JSON.parse(JSON.stringify(window.__smoke.S));
    delete raw.simulatedMs;
    raw.testDays = 3;
    const m = migrate(raw, 'Héros');
    return { simulatedMs: m.simulatedMs, hasTestDays: Object.prototype.hasOwnProperty.call(m, 'testDays') };
  });
  expect(out.simulatedMs).toBe(3 * 24 * 3600 * 1000);
  expect(out.hasTestDays).toBe(false);
});
