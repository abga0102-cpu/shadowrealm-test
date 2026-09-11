const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('retired progression-coherence V304 stays absent while V304 stability + V305 integration own its behavior', async ({ page }) => {
  const index = source('index.html');
  const stability = source('progression-stability-authority-v304.js');
  const integration = source('progression-integration-pack-v305.js');

  expect(fs.existsSync(path.join(root, 'progression-coherence-pack-v304.js'))).toBe(false);
  expect(index).not.toContain('progression-coherence-pack-v304.js');
  expect(index.match(/progression-stability-authority-v304\.js/g) || []).toHaveLength(1);
  expect(index.match(/progression-integration-pack-v305\.js/g) || []).toHaveLength(1);
  expect(stability).toContain("if(sys==='pet')return pick(PET_STAR,stars)");
  expect(stability).toContain("if(sys==='skill')return pick(SKILL_STAR,stars)");
  expect(stability).toContain("if(sys==='forge'||sys==null)return pick(FORGE_STAR,stars)");
  expect(integration).toContain('window.__srV305PetStats=petStats');
  expect(integration).toContain('window.__srV286PetStats=petStats');

  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srProgressionStabilityV304 === true && window.__srProgressionIntegrationV305 === true && typeof window.__srV286PetStats === 'function');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);

  const result = await page.evaluate(() => {
    const pet = { rarity: 'COMMUN', species: 'dragonnet', element: 'feu' };
    const zero = structuredClone(S);
    const three = structuredClone(S);
    zero.stars = zero.stars || {};
    three.stars = three.stars || {};
    zero.stars.pet = 0;
    three.stars.pet = 3;
    const a = window.__srV286PetStats(pet, zero);
    const b = window.__srV286PetStats(pet, three);
    return {
      retiredGuard: typeof window.__srProgressionCoherenceV304,
      retiredHelper: typeof window.__srV304PetStats,
      stabilityGuard: window.__srProgressionStabilityV304 === true,
      integrationGuard: window.__srProgressionIntegrationV305 === true,
      helperOwnedByV305: window.__srV286PetStats === window.__srV305PetStats,
      forge1: ascendPowerMul(1, 'forge'),
      skill1: ascendPowerMul(1, 'skill'),
      pet1: ascendPowerMul(1, 'pet'),
      pet2: ascendPowerMul(2, 'pet'),
      pet3: ascendPowerMul(3, 'pet'),
      legacyNoSystem: ascendPowerMul(1),
      unknown: ascendPowerMul(1, 'future-system'),
      damageRatio: b.damage / a.damage,
      hpRatio: b.hp / a.hp,
    };
  });

  expect(result.retiredGuard).toBe('undefined');
  expect(result.retiredHelper).toBe('undefined');
  expect(result.stabilityGuard).toBe(true);
  expect(result.integrationGuard).toBe(true);
  expect(result.helperOwnedByV305).toBe(true);
  expect(result.forge1).toBe(2);
  expect(result.skill1).toBe(1.5);
  expect(result.pet1).toBe(1.5);
  expect(result.pet2).toBe(2.1);
  expect(result.pet3).toBe(3);
  expect(result.legacyNoSystem).toBe(2);
  expect(result.unknown).toBe(1);
  expect(result.damageRatio).toBeCloseTo(3, 8);
  expect(result.hpRatio).toBeCloseTo(3, 8);
});
