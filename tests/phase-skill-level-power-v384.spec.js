const { test, expect } = require('@playwright/test');

test('V384 gives +10% skill power per level and global Power reflects active skill levels', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => window.__srSkillOverhaulConfigV284 && typeof computePower === 'function');

  const data = await page.evaluate(() => {
    const def = SKILL_BY_ID.taillade;
    const intrinsic1 = window.__srV284SkillDamage(def, 1);
    const intrinsic2 = window.__srV284SkillDamage(def, 2);
    const combat1 = skillDamageMult(1000, 1);
    const combat2 = skillDamageMult(1000, 2);

    const s = defaultState('V384');
    s.skills.taillade = { level: 1, count: 0 };
    s.skillSlots[0] = 'taillade';
    const power1 = computePower(s);
    s.skills.taillade.level = 2;
    const power2 = computePower(s);

    showSkillResult([{
      id:'taillade', rarity:'COMMUN', dup:true,
      beforeLevel:1, afterLevel:2, leveled:true,
      count:0, need:4, levelPowerPct:10, globalPowerGain:power2-power1
    }]);

    return {
      intrinsic1, intrinsic2, combat1, combat2, power1, power2,
      text: document.querySelector('#overlay')?.innerText || '',
      config: window.__srSkillOverhaulConfigV284
    };
  });

  expect(data.config.levelGrowthPct).toBe(10);
  expect(data.intrinsic2 / data.intrinsic1).toBeCloseTo(1.10, 2);
  expect(data.combat2 / data.combat1).toBeCloseTo(1.10, 8);
  expect(data.power2).toBeGreaterThan(data.power1);
  expect(data.text).toContain('Niv. 1 → 2');
  expect(data.text).toContain('+10 % puissance');
});

test('V384 shows duplicate progress when the level does not increase', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof showSkillResult === 'function');
  const text = await page.evaluate(() => {
    showSkillResult([{
      id:'taillade', rarity:'COMMUN', dup:true,
      beforeLevel:1, afterLevel:1, leveled:false,
      count:1, need:2, levelPowerPct:0, globalPowerGain:0
    }]);
    return document.querySelector('#overlay')?.innerText || '';
  });
  expect(text).toContain('1 / 2 vers Niv. 2');
});
