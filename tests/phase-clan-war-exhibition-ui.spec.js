const {test,expect}=require('@playwright/test');
test('exhibition war follows the week, seals day results and starts a new season',async({page})=>{
 await page.goto('/clan-bots-preview.html');
 await page.locator('#joinClan').click();
 await page.locator('[data-tab="war"]').click();
 await expect(page.locator('.day')).toHaveCount(7);
 await expect(page.locator('.versus')).toContainText('VS');
 await page.locator('#warRun').click();
 await expect(page.locator('#status')).toContainText('12 bots');
 await expect(page.locator('.scoreGrid')).not.toContainText('NaN');
 page.once('dialog',d=>d.accept());await page.locator('#warClose').click();
 await expect(page.locator('.warBanner')).toContainText('JOUR 2');
 await page.reload();await page.locator('[data-tab="war"]').click();
 await expect(page.locator('.warBanner')).toContainText('JOUR 2');
 for(let day=2;day<=6;day++){
  page.once('dialog',d=>d.accept());await page.locator('#warClose').click();
 }
 await expect(page.locator('#warRestart')).toBeVisible();
 await expect(page.locator('.warBanner')).toContainText(/Défaite|Victoire|Match nul/);
 page.once('dialog',d=>d.accept());await page.locator('#warRestart').click();
 await expect(page.locator('.warBanner')).toContainText('JOUR 1');
});
test('opt-in offline catch-up is capped and never changes the actual game save',async({page})=>{
 await page.goto('/clan-bots-preview.html');
 await page.evaluate(()=>localStorage.setItem('shadowreach.save.local','KEEP'));
 await page.locator('#clanName').fill('Veille Éternelle');
 await page.getByRole('button',{name:'Créer mon clan'}).click();
 await page.locator('[data-tab="war"]').click();
 await page.locator('#autoWar').click();
 await expect(page.locator('#autoWar')).toContainText('ON');
 await page.evaluate(()=>{
  const k='shadowreach.clan.bot-exhibition.v1',s=JSON.parse(localStorage.getItem(k));
  s.lastAt=Date.now()-11*3600000;localStorage.setItem(k,JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-tab="war"]').click();
 await expect(page.locator('#status')).toContainText('8 rondes fictives');
 await expect(page.locator('.warBanner')).toContainText('JOUR 1');
 await expect(page.locator('.scoreGrid')).not.toContainText('NaN');
 expect(await page.evaluate(()=>localStorage.getItem('shadowreach.save.local'))).toBe('KEEP');
});
test('commands are honored by exhibition and locked when day has ended',async({page})=>{
 await page.goto('/clan-bots-preview.html');
 await page.locator('#joinClan').click();
 await page.locator('[data-tab="orders"]').click();
 await page.locator('[data-command="rest"]').click();
 await page.locator('[data-tab="war"]').click();
 await page.locator('#warRun').click();
 await expect(page.locator('#status')).toContainText('0 bots');
 await page.locator('#warRival').selectOption('nord');
 await page.locator('[data-tab="orders"]').click();
 await page.locator('[data-command="auto"]').click();
 await page.locator('[data-tab="war"]').click();
 await page.locator('#warRun').click();
 await expect(page.locator('#status')).toContainText('12 bots');
 await expect(page.locator('#warRival')).toBeDisabled();
});
