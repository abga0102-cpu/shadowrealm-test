const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('V391 equipped skill level-up shows centered green Power feedback', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof computePower === 'function' &&
    typeof queuePowerDelta === 'function' &&
    typeof showSkillResult === 'function'
  );

  const result = await page.evaluate(() => {
    const s = defaultState('V391');
    s.skills.taillade = { level: 1, count: 0 };
    s.skillSlots[0] = 'taillade';

    const before = computePower(s);
    s.skills.taillade.level = 2;
    const after = computePower(s);
    const delta = after - before;

    const res = [{
      id:'taillade', rarity:'COMMUN', dup:true,
      beforeLevel:1, afterLevel:2, leveled:true,
      count:0, need:4, levelPowerPct:10, globalPowerGain:delta
    }];
    res.levelUpPowerDelta = delta;

    showSkillResult(res);
    queuePowerDelta(delta);
    return { before, after, delta };
  });

  expect(result.after).toBeGreaterThan(result.before);
  expect(result.delta).toBeGreaterThan(0);

  await expect(page.locator('#powerDelta')).toBeVisible();
  await expect(page.locator('#powerDelta')).toHaveClass(/up/);
  await expect(page.locator('#powerDelta')).toContainText('Puissance');
  await expect(page.locator('#powerDelta')).toContainText('+');
  await expect(page.locator('#overlay')).toContainText('Niv. 1 → 2');
  await expect(page.locator('#overlay')).toContainText('+10 % puissance');

  const game2 = fs.readFileSync(path.join(__dirname, '..', 'game-2.js'), 'utf8');
  const game5 = fs.readFileSync(path.join(__dirname, '..', 'game-5.js'), 'utf8');
  expect(game2).toContain('results.levelUpPowerDelta');
  expect(game2).toContain('{ suppressPowerDelta: true }');
  expect(game5).toContain('queuePowerDelta(Number(r.levelUpPowerDelta))');
});

test('V391 non-equipped skill level does not invent global Power feedback', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => typeof computePower === 'function');

  const result = await page.evaluate(() => {
    const s = defaultState('V391');
    s.skills.taillade = { level: 1, count: 0 };
    s.skillSlots = [null, null, null, null, null];
    const before = computePower(s);
    s.skills.taillade.level = 2;
    const after = computePower(s);
    return { before, after };
  });

  expect(result.after).toBe(result.before);
});
