const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const legacySave = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'fixtures', 'saves', 'minimal-old-save.json'),
  'utf8'
));

test('V322 keeps a former endless-campaign record playable inside the new 800-stage campaign', async ({ page }) => {
  const save = JSON.parse(JSON.stringify(legacySave));
  save.floor = 512;
  save.recordFloor = 512;
  save.checkpoint = 510;
  save.pendingBossFloor = 510;

  await page.addInitScript((payload) => {
    localStorage.setItem('shadowreach.save.local', JSON.stringify(payload));
    localStorage.removeItem('shadowreach.social.v1.messages');
  }, save);

  await page.goto('/index.html');
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  await page.waitForFunction(() => window.__srCampaign800V322 === true && typeof S !== 'undefined');

  const state = await page.evaluate(() => ({
    floor: S.floor,
    recordFloor: S.recordFloor,
    checkpoint: S.checkpoint,
    pendingBossFloor: S.pendingBossFloor,
    legacyCampaignRecord: S.legacyCampaignRecord,
    migrated: !!(S.migrations && S.migrations.campaign800V322),
    maxFloor: window.__srCampaignMaxFloor,
  }));

  expect(state.maxFloor).toBe(800);
  expect(state.recordFloor).toBe(512);
  expect(state.floor).toBeGreaterThanOrEqual(500);
  expect(state.floor).toBeLessThanOrEqual(512);
  expect(state.checkpoint).toBeGreaterThanOrEqual(500);
  expect(state.checkpoint).toBeLessThanOrEqual(512);
  expect(state.pendingBossFloor).toBeGreaterThanOrEqual(0);
  expect(state.pendingBossFloor).toBeLessThanOrEqual(512);
  expect(state.legacyCampaignRecord).toBeUndefined();
  expect(state.migrated).toBe(true);
});
