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
  await expect(page.locator('#aLabel')).toHaveCount(1, { timeout: 15000 });
}

test('campaign arena renders the canonical rank title with the floor', async ({ page }) => {
  await openCleanGame(page);

  const labels = await page.evaluate(() => [
    __srCampaignFloorLabel(1),
    __srCampaignFloorLabel(26),
    __srCampaignFloorLabel(50),
    __srCampaignFloorLabel(100),
    __srCampaignFloorLabel(250),
    __srCampaignFloorLabel(500),
    __srCampaignFloorLabel(700),
  ]);
  expect(labels).toEqual([
    'Looser · Étage 1',
    'Débutant · Étage 26',
    'Aventurier · Étage 50',
    'Prodige · Étage 100',
    'Héros · Étage 250',
    'Légende · Étage 500',
    'Divin · Étage 700',
  ]);

  await page.evaluate(() => {
    if (!combat || combat.ctx !== 'campaign') startCampaign();
    combat.floor = 50;
    drawArena();
  });
  await expect(page.locator('#aLabel')).toHaveText('Aventurier · Étage 50');
});
