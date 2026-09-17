const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

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
  await page.waitForFunction(() =>
    window.__srBossRetryProgressionV342 === true &&
    window.__srEasyDragonBalanceV334 === true &&
    window.__srAccomplishmentsCanonicalV139 === true &&
    window.__srForgeDustIntegrityV344 === true
  );
}

test('V356 current authorities boot together and expose the current progression contract', async ({ page }) => {
  await openCleanGame(page);

  const state = await page.evaluate(() => ({
    bootErrors: Array.isArray(window.__srBootErrors) ? window.__srBootErrors.slice() : [],
    screenChildren: document.querySelector('#screen')?.children?.length || 0,
    dragon: window.__srEasyDragonBalanceConfigV334,
    accomplishments: typeof window.__srAccomplishmentsLauncherStateV139 === 'function'
      ? window.__srAccomplishmentsLauncherStateV139()
      : null,
  }));

  expect(state.bootErrors).toEqual([]);
  expect(state.screenChildren).toBeGreaterThan(0);
  expect(state.dragon).toMatchObject({
    dragonFloor: 75,
    dragonStage: 'Facile 4-15',
    dragonHpMul: 0.76,
    dragonBaseDamageMul: 0.88,
    lateEasy: { startFloor: 76, endFloor: 100 },
  });
  expect(state.accomplishments).toMatchObject({ total: 10 });
});

test('V356 keeps the V342 boss retry progression invariant', async ({ page }) => {
  await openCleanGame(page);

  const result = await page.evaluate(() => new Promise((resolve) => {
    S.floor = 74;
    S.step = 2;
    S.recordFloor = Math.max(Number(S.recordFloor) || 1, 74);
    S.checkpoint = Math.max(Number(S.checkpoint) || 1, 74);
    S.pendingBossFloor = 75;
    S.bossClears = S.bossClears || {};
    delete S.bossClears['75'];

    const c = spawnCampaign(S);
    c.status = 'won';
    handleCombatEnd(c);

    setTimeout(() => resolve({
      floor: S.floor,
      step: S.step,
      pendingBossFloor: Number(S.pendingBossFloor || 0),
      label: __srCampaignLabel(S.floor),
      combatFloor: combat && combat.floor,
      combatBoss: !!(combat && combat.boss),
    }), 120);
  }));

  expect(result).toEqual({
    floor: 75,
    step: 1,
    pendingBossFloor: 0,
    label: 'Facile · 4-15',
    combatFloor: 75,
    combatBoss: true,
  });
});

test('V356 static authorities protect the current economy and 800-floor accomplishment model', async () => {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const achievements = fs.readFileSync(path.join(root, 'accomplishments-canonical-v139.js'), 'utf8');
  const dragon = fs.readFileSync(path.join(root, 'easy-dragon-balance-v333.js'), 'utf8');
  const dust = fs.readFileSync(path.join(root, 'forge-dust-integrity-v344.js'), 'utf8');

  expect(index).toContain('boss-retry-progression-v342.js');
  expect(index).toContain('forge-dust-integrity-v344.js');
  expect(index).toContain('save-safety-v340.js');
  expect(index).toContain('save-recovery-v341.js');

  expect(achievements).toContain("['floor400',800,'Terminer Divin · 5-20'");
  expect(achievements).toContain("['forge50',50,'Forge niveau 50','500 000 Or']");
  expect(achievements).toContain("['raid100',100,'100 Raids accomplis'");

  expect(dragon).toContain('var TARGET_FLOOR=75;');
  expect(dragon).toContain('var LATE_EASY_START=76;');
  expect(dragon).toContain('var LATE_EASY_END=100;');
  expect(dragon).toContain('if(opts.boss&&floor===TARGET_FLOOR)');

  expect(dust).toContain('MYTHIQUE:10');
  expect(dust).toContain('ARTEFACT:25');
  expect(dust).toContain('LEGENDAIRE:60');
  expect(dust).toContain('INFERNAL:150');
  expect(dust).toContain('IMMORTEL:400');
  expect(dust).toContain('DIVIN:1000');
});
