const {test,expect}=require('@playwright/test');
test('bot clans join, persist, leave and never modify main game save',async({page})=>{
 await page.goto('/clan-bots-preview.html');
 await expect(page.locator('[data-clan]')).toHaveCount(6);
 await expect(page.locator('.member em')).toHaveCount(12);
 await page.evaluate(()=>localStorage.setItem('shadowreach.save.local','ORIGINAL'));
 await page.locator('#joinClan').click();
 await expect(page.locator('#leaveClan')).toBeVisible();
 await page.reload();await expect(page.locator('#leaveClan')).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('shadowreach.save.local'))).toBe('ORIGINAL');
 page.once('dialog',d=>d.accept());await page.locator('#leaveClan').click();
 await expect(page.locator('#joinClan')).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('shadowreach.save.local'))).toBe('ORIGINAL');
});
test('new clan is led by player with eight bots and war is preview-only',async({page})=>{
 await page.goto('/clan-bots-preview.html');
 await page.locator('#clanName').fill('Les Exilés');
 await page.locator('[data-crest="🐉"]').click();
 await page.getByRole('button',{name:'Créer mon clan'}).click();
 await expect(page.locator('[data-clan]')).toHaveCount(7);
 await expect(page.locator('.member em')).toHaveCount(9);
 await expect(page.locator('.detail')).toContainText('Les Exilés');
 await page.reload();await expect(page.locator('.detail')).toContainText('Les Exilés');
 await page.locator('[data-tab="war"]').click();
 await expect(page.locator('.day')).toHaveCount(7);
 await expect(page.locator('.detail')).toContainText('Aucun combat');
});