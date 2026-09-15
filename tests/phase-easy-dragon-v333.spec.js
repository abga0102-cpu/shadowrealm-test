const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('V333 only softens the Facile 4-15 Dragon spike', async ({ page }) => {
  const source = fs.readFileSync(path.join(root, 'easy-dragon-balance-v333.js'), 'utf8');
  expect(source).toContain('var TARGET_FLOOR=75;');
  expect(source).toContain('var HP_MUL=0.76;');
  expect(source).toContain('var BASE_DMG_MUL=0.88;');
  expect(source).toContain("c.ctx==='campaign'&&Number(c.floor)===TARGET_FLOOR");
  expect(source).toContain("mode==='campaign'&&opts&&opts.boss&&Number(opts.floor)===TARGET_FLOOR");
  expect(source).toContain('breathMaxHpPct:33');
  expect(source).toContain('flightSeconds:3');
  expect(source).toContain('meleeDamageDuringFlightPct:40');

  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srEasyDragonBalanceConfigV333);
  const cfg = await page.evaluate(() => window.__srEasyDragonBalanceConfigV333);
  expect(cfg).toMatchObject({
    floor: 75,
    stage: 'Facile 4-15',
    hpMul: 0.76,
    baseDamageMul: 0.88,
    breathMaxHpPct: 33,
    breathCooldown: 18,
    flightSeconds: 3,
    flightCooldown: 22,
    meleeDamageDuringFlightPct: 40,
    intimidationPct: 20,
    intimidationSeconds: 6,
    intimidationCooldown: 20
  });
});
