const { test, expect } = require('@playwright/test');

function ancestralSave() {
  return {
    version: 4,
    playerName: 'Héros',
    level: 49,
    exp: 329000,
    statPoints: 2,
    stats: { sante: 153, degats: 85, crit: 0, critred: 0 },
    gold: 9840,
    minerai: 158,
    pets: [{
      id: 'recovered-felin-electrique-ancestral',
      rarity: 'ANCESTRAL',
      level: 0,
      legacyLevel: 46,
      applesInvested: 0,
      species: 'felin',
      element: 'electrique',
      name: 'Félin électrique',
      petCurveVersion: 286,
    }],
    activePetId: 'recovered-felin-electrique-ancestral',
    lastSeen: Date.now(),
    tutorial: { version: 3, seen: { combat: true } },
  };
}

test('V434 boots and reloads a save containing an active Ancestral Familiar', async ({ page }) => {
  const save = ancestralSave();
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('v434-seeded')) {
      localStorage.clear();
      localStorage.setItem('shadowreach.save.local', JSON.stringify(value));
      sessionStorage.setItem('v434-seeded', '1');
    }
  }, save);

  await page.goto('/index.html?v=v434-ancestral-save-boot');
  await page.waitForFunction(() => window.__srFamiliarLadderConfigV295 && window.__srSaveLoadGuardV430);

  const firstBoot = await page.evaluate(() => {
    const state = eval('S');
    const pet = state.pets.find((item) => item.id === state.activePetId);
    return {
      guard: window.__srSaveLoadGuardV430,
      level: state.level,
      pet,
      errors: window.__srBootErrors.slice(),
    };
  });
  expect(firstBoot.guard.status).toBe('loaded');
  expect(firstBoot.guard.blocked).toBe(false);
  expect(firstBoot.level).toBe(49);
  expect(firstBoot.pet).toMatchObject({
    rarity: 'ANCESTRAL',
    species: 'felin',
    element: 'electrique',
  });
  expect(firstBoot.errors).toEqual([]);

  await page.reload();
  await page.waitForFunction(() => window.__srFamiliarLadderConfigV295 && window.__srSaveLoadGuardV430);

  const secondBoot = await page.evaluate(() => {
    const state = eval('S');
    const pet = state.pets.find((item) => item.id === state.activePetId);
    return {
      guard: window.__srSaveLoadGuardV430,
      level: state.level,
      activePetId: state.activePetId,
      pet,
      persisted: JSON.parse(localStorage.getItem('shadowreach.save.local')),
      errors: window.__srBootErrors.slice(),
    };
  });
  expect(secondBoot.guard.status).toBe('loaded');
  expect(secondBoot.level).toBe(49);
  expect(secondBoot.activePetId).toBe('recovered-felin-electrique-ancestral');
  expect(secondBoot.pet).toMatchObject({
    rarity: 'ANCESTRAL',
    species: 'felin',
    element: 'electrique',
  });
  expect(secondBoot.persisted.pets).toContainEqual(expect.objectContaining({
    id: 'recovered-felin-electrique-ancestral',
    rarity: 'ANCESTRAL',
  }));
  expect(secondBoot.errors).toEqual([]);
});
