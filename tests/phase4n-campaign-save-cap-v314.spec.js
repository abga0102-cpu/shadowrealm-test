const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const legacySave = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'fixtures', 'saves', 'minimal-old-save.json'),
  'utf8'
));

test('V314 preserves a former endless-campaign record before normalizing the playable save to floor 400', async ({ page }) => {
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
  await page.waitForFunction(() => window.__srCampaign400V314 === true && typeof S !== 'undefined');

  const state = await page.evaluate(() => ({
    floor: S.floor,
    recordFloor: S.recordFloor,
    checkpoint: S.checkpoint,
    pendingBossFloor: S.pendingBossFloor,
    legacyCampaignRecord: S.legacyCampaignRecord,
  }));

  expect(state).toEqual({
    floor: 400,
    recordFloor: 400,
    checkpoint: 400,
    pendingBossFloor: 0,
    legacyCampaignRecord: 512,
  });
});
