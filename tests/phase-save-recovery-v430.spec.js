const { test, expect } = require('@playwright/test');

function state(overrides = {}) {
  return Object.assign({
    version: 4,
    playerName: 'Héros',
    level: 1,
    exp: 0,
    stats: { sante: 0, degats: 0, crit: 0, critred: 0 },
    inventory: [],
    equipped: {},
    raids: {},
    gold: 100,
    floor: 1,
    recordFloor: 1,
    checkpoint: 1,
    power: 50,
    lastSeen: Date.now(),
    tutorial: { version: 3, seen: { combat: true } },
  }, overrides);
}

test('V430 pins a stronger rotating backup and exposes recovery', async ({ page }) => {
  const active = state({ gold: 104, exp: 8, power: 2940 });
  const progressed = state({
    level: 45,
    floor: 104,
    recordFloor: 120,
    checkpoint: 100,
    power: 17000000,
    inventory: [{ id: 'kept-item', slot: 'arme', rarity: 'MYTHIQUE' }],
    lastSeen: Date.now() - 60000,
  });
  await page.addInitScript(({ active, progressed }) => {
    localStorage.setItem('shadowreach.save.local', JSON.stringify(active));
    localStorage.setItem('shadowreach.save.backup.v340.4', JSON.stringify(progressed));
  }, { active, progressed });

  await page.goto('/index.html?v=v430-recovery-test');
  await page.waitForFunction(() => window.__srSaveRecoveryV341);

  const result = await page.evaluate(() => ({
    pinned: JSON.parse(localStorage.getItem('shadowreach.save.rescue.v430')),
    button: document.getElementById('srSaveRecoveryButtonV341')?.textContent || '',
    candidates: window.__srSaveRecoveryV341.scan().map((x) => ({ source: x.source, record: x.recordFloor })),
  }));
  expect(result.pinned.recordFloor).toBe(120);
  expect(result.pinned.level).toBe(45);
  expect(result.button).toContain('Récupérer mon ancienne partie');
  expect(result.candidates).toContainEqual({ source: 'rescue-v430', record: 120 });
});

test('V430 blocks automatic writes when the main save is missing but a backup exists', async ({ page }) => {
  const progressed = state({ level: 45, floor: 104, recordFloor: 120, checkpoint: 100, power: 17000000 });
  await page.addInitScript((save) => {
    localStorage.removeItem('shadowreach.save.local');
    localStorage.setItem('shadowreach.save.backup.v340.1', JSON.stringify(save));
  }, progressed);

  await page.goto('/index.html?v=v430-missing-main-test');
  await page.waitForFunction(() => window.__srSaveRecoveryV341 && window.__srSaveLoadGuardV430);

  const result = await page.evaluate(() => ({
    guard: window.__srSaveLoadGuardV430,
    main: localStorage.getItem('shadowreach.save.local'),
    rescue: JSON.parse(localStorage.getItem('shadowreach.save.rescue.v430')),
  }));
  expect(result.guard.status).toBe('missing');
  expect(result.guard.blocked).toBe(true);
  expect(result.main).toBeNull();
  expect(result.rescue.recordFloor).toBe(120);
});

test('V430 still permits a genuine first save when no recovery data exists', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/index.html?v=v430-new-player-test');
  await page.waitForFunction(() => window.__srSaveLoadGuardV430 && window.__srDustEconomyConfigV293);

  const result = await page.evaluate(() => ({
    guard: window.__srSaveLoadGuardV430,
    main: localStorage.getItem('shadowreach.save.local'),
  }));
  expect(result.guard.status).toBe('missing');
  expect(result.guard.blocked).toBe(false);
  expect(result.main).not.toBeNull();
});

test('V431 forced recovery link opens the local save inventory even without a stronger backup', async ({ page }) => {
  const active = state({ gold: 124, exp: 48, power: 2940 });
  await page.addInitScript((save) => {
    localStorage.clear();
    localStorage.setItem('shadowreach.save.local', JSON.stringify(save));
  }, active);

  await page.goto('/index.html?recovery=1&v=v431-forced-recovery-test');
  await page.waitForSelector('#srSaveRecoveryPanelV341');

  const result = await page.evaluate(() => ({
    panel: document.getElementById('srSaveRecoveryPanelV341')?.innerText || '',
    button: document.getElementById('srSaveRecoveryButtonV341')?.textContent || '',
  }));
  expect(result.panel).toContain('Récupération de sauvegarde');
  expect(result.panel).toContain('V433');
  expect(result.panel).toContain('Actuelle');
  expect(result.button).toBe('Sauvegardes locales');
});

test('V432 opens recovery automatically for a suspicious low-level reset with preserved power', async ({ page }) => {
  const active = state({ level: 2, floor: 1, recordFloor: 1, gold: 148, exp: 33, power: 50 });
  await page.addInitScript((save) => {
    localStorage.clear();
    localStorage.setItem('shadowreach.save.local', JSON.stringify(save));
    localStorage.setItem('shadowreach.power.sources.v256', JSON.stringify({ at: Date.now(), power: 3000, sources: {} }));
  }, active);

  await page.goto('/index.html?v=v432-suspicious-reset-test');
  await page.waitForSelector('#srSaveRecoveryPanelV341');

  const result = await page.evaluate(() => ({
    panel: document.getElementById('srSaveRecoveryPanelV341')?.innerText || '',
    button: document.getElementById('srSaveRecoveryButtonV341')?.textContent || '',
  }));
  expect(result.panel).toContain('V433');
  expect(result.button).toContain('Vérifier l’ancienne partie');
});

test('V432 keeps manual save access visible for a normal active save', async ({ page }) => {
  const active = state({ level: 20, floor: 35, recordFloor: 40, power: 500000 });
  await page.addInitScript((save) => {
    localStorage.clear();
    localStorage.setItem('shadowreach.save.local', JSON.stringify(save));
  }, active);

  await page.goto('/index.html?v=v432-manual-save-access-test');
  await page.waitForSelector('#srSaveRecoveryButtonV341');
  await expect(page.locator('#srSaveRecoveryButtonV341')).toHaveText('Sauvegardes locales');
});


test('V433 exposes a complete local diagnostic export', async ({ page }) => {
  const active = state({ level: 2, floor: 1, recordFloor: 2, power: 2998 });
  await page.addInitScript((save) => {
    localStorage.clear();
    localStorage.setItem('shadowreach.save.local', JSON.stringify(save));
  }, active);

  await page.goto('/index.html?recovery=1&v=v433-complete-export-test');
  await page.waitForSelector('#srSaveRecoveryPanelV341');

  const result = await page.evaluate(() => ({
    api: typeof window.__srSaveRecoveryV341?.exportAllLocalData,
    panel: document.getElementById('srSaveRecoveryPanelV341')?.innerText || '',
  }));
  expect(result.api).toBe('function');
  expect(result.panel).toContain('Exporter toutes les données locales');
});

test('V433 rate-limits rotating backups while pinning the strongest state', async ({ page }) => {
  const active = state({ level: 20, floor: 35, recordFloor: 40, power: 500000 });
  await page.addInitScript((save) => {
    localStorage.clear();
    localStorage.setItem('shadowreach.save.local', JSON.stringify(save));
  }, active);

  await page.goto('/index.html?v=v433-durable-backup-test');
  await page.waitForFunction(() => window.__srSaveSafetyV340 && !window.__srSaveSafetyV340.smokeIsolated);

  const result = await page.evaluate(() => {
    for (let i = 1; i <= 20; i++) {
      const next = JSON.parse(localStorage.getItem('shadowreach.save.local'));
      next.level = 20 + i;
      next.floor = 35 + i;
      next.recordFloor = 40 + i;
      next.power = 500000 + i * 10000;
      next.lastSeen = Date.now() + i;
      window.__srSaveSafetyV340.snapshot(JSON.stringify(next));
    }
    const backupKeys = Object.keys(localStorage).filter((key) => key.indexOf('shadowreach.save.backup.v340.') === 0);
    return {
      slots: backupKeys.length,
      configuredSlots: window.__srSaveSafetyV340.backupSlots,
      interval: window.__srSaveSafetyV340.minInterval,
      best: JSON.parse(localStorage.getItem('shadowreach.save.best.v433')),
    };
  });
  expect(result.slots).toBe(1);
  expect(result.configuredSlots).toBe(12);
  expect(result.interval).toBe(5 * 60 * 1000);
  expect(result.best.recordFloor).toBe(60);
});

test('V433 pins ancestral familiars outside rotating saves', async ({ page }) => {
  const ancestral = { id: 'ancestral-dragon', species: 'dragon', rarity: 'ANCESTRAL', level: 37 };
  const active = state({
    level: 45,
    floor: 104,
    recordFloor: 120,
    power: 17000000,
    pets: [ancestral],
    activePetId: ancestral.id,
  });
  await page.addInitScript((save) => {
    localStorage.clear();
    localStorage.setItem('shadowreach.save.local', JSON.stringify(save));
  }, active);

  await page.goto('/index.html?v=v433-ancestral-pin-test');
  await page.waitForFunction(() => window.__srSaveSafetyV340 && !window.__srSaveSafetyV340.smokeIsolated);

  const pinned = await page.evaluate(() => JSON.parse(localStorage.getItem('shadowreach.familiar.ancestral.v433')));
  expect(pinned.pets).toHaveLength(1);
  expect(pinned.pets[0]).toMatchObject({ id: 'ancestral-dragon', rarity: 'ANCESTRAL', level: 37 });
});