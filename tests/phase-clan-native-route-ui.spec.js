const {test,expect}=require('@playwright/test');
async function enterClan(page){
  await page.goto('/index.html');
  await expect(page.locator('#screen')).toBeVisible();
  await page.evaluate(()=>{window.eval('route = "clan"; render();');});
  await expect(page.locator('.srClanNative')).toBeVisible({timeout:20000});
}
test('native clan route loads fictional bots and follows commands with no main save effect',async({page})=>{
  await enterClan(page);
  await expect(page.locator('.srClanListItem')).toHaveCount(6);
  await expect(page.locator('.srClanHeader')).toContainText('SIMULATION LOCALE');
  await page.evaluate(()=>localStorage.setItem('shadowreach.save.local','NE_PAS_MODIFIER'));
  await page.locator('[data-clan-cmd="join"]').click();
  await expect(page.locator('.srClanNotice')).toContainText('Clan rejoint');
  await page.locator('[data-clan-cmd="tab"][data-arg="orders"]').click();
  await expect(page.locator('[data-clan-cmd="global"]')).toHaveCount(9);
  await page.locator('[data-clan-cmd="global"][data-arg="rest"]').click();
  await page.locator('[data-clan-cmd="tab"][data-arg="war"]').click();
  await page.locator('[data-clan-cmd="warRound"]').click();
  await expect(page.locator('.srClanNotice')).toContainText('0 bots');
  expect(await page.evaluate(()=>localStorage.getItem('shadowreach.save.local'))).toBe('NE_PAS_MODIFIER');
});
test('native Clan founded by player has 8 bots, persistence and war board',async({page})=>{
  await enterClan(page);
  await page.locator('#srClanName').fill('Les Astrals');
  await page.locator('#srClanCreate button[type="submit"]').click();
  await expect(page.locator('.srClanNotice')).toContainText('Ton clan est créé');
  await expect(page.locator('.srClanMember')).toHaveCount(9);
  await page.locator('[data-clan-cmd="tab"][data-arg="war"]').click();
  await expect(page.locator('.srClanWarDay')).toHaveCount(7);
  await page.locator('[data-clan-cmd="warRound"]').click();
  await expect(page.locator('.srClanNotice')).toContainText('8 bots');
  await page.reload();
  await page.evaluate(()=>{window.eval('route = "clan"; render();');});
  await expect(page.locator('.srClanNative')).toBeVisible({timeout:20000});
  await page.locator('[data-clan-cmd="tab"][data-arg="war"]').click();
  await expect(page.locator('.srClanNative')).toContainText('Les Astrals');
});