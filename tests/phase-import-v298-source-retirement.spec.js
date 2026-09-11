const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('retired import V298 stays absent while corrected V299 remains the loaded late-import authority', async ({ page }) => {
  const index = source('index.html');
  const v299 = source('import-progression-authority-v299.js');

  expect(fs.existsSync(path.join(root, 'import-progression-authority-v298.js'))).toBe(false);
  expect(index).not.toContain('import-progression-authority-v298.js');
  expect(index.match(/import-progression-authority-v299\.js/g) || []).toHaveLength(1);
  expect(v299).toContain('uses the IMPORTED');
  expect(v299).toContain('forgeStarMul(s)');
  expect(v299).toContain('migrate.__srV299=true');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srImportProgressionV299 === true && typeof window.__srNormalizeImportedProgressionV299 === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const result = await page.evaluate(() => {
    S.stars = S.stars || {};
    const hadForge = Object.prototype.hasOwnProperty.call(S.stars, 'forge');
    const oldForge = S.stars.forge;
    S.stars.forge = 0;

    try {
      const imported = structuredClone(S);
      imported.stars = imported.stars || {};
      imported.stars.forge = 1;
      imported.inventory = [{
        id: 'lean-v298-retirement-item',
        slot: 'arme',
        rarity: 'COMMUN',
        level: 0,
        baseDamage: 250,
        damage: 250,
        baseHp: 0,
        hp: 0,
        statQuality: 0.5,
      }];
      imported.equipped = {};
      imported.pets = [];

      window.__srNormalizeImportedProgressionV299(imported);
      const item = imported.inventory[0];
      return {
        v298Guard: typeof window.__srImportProgressionV298,
        v299Guard: window.__srImportProgressionV299 === true,
        migrateV299: !!(migrate && migrate.__srV299),
        liveForgeStars: S.stars.forge,
        importedForgeStars: imported.stars.forge,
        baseDamage: item.baseDamage,
        damage: item.damage,
        statQuality: item.statQuality,
        itemVersion: item.importProgressionVersion,
        stateVersion: imported.importProgressionVersion,
      };
    } finally {
      if (hadForge) S.stars.forge = oldForge;
      else delete S.stars.forge;
    }
  });

  expect(result.v298Guard).toBe('undefined');
  expect(result.v299Guard).toBe(true);
  expect(result.migrateV299).toBe(true);
  expect(result.liveForgeStars).toBe(0);
  expect(result.importedForgeStars).toBe(1);
  expect(result.baseDamage).toBe(500);
  expect(result.damage).toBe(500);
  expect(result.statQuality).toBe(0.5);
  expect(result.itemVersion).toBe(299);
  expect(result.stateVersion).toBe(299);
});
