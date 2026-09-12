const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const game3 = fs.readFileSync(path.join(root, 'game-3.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const retiredWaveSource = path.join(root, 'wave-display-v112.js');

test('campaign wave total is rendered by the canonical arena owner', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(game3).toContain('"Vague " + c.step + "/" + campaignWaveCount(c.floor) + "</span>"');
  expect(game3).not.toContain('"Vague " + c.step + "/" + RULES.STEPS_PER_FLOOR + "</span>"');
  expect(index).not.toContain('boot-stability-v115.js');
});

test('canonical campaign wave totals cover standard, elite and boss floors without Boot V115', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() =>
    typeof campaignWaveCount === 'function' &&
    typeof spawnCampaign === 'function' &&
    typeof mountArena === 'function' &&
    typeof drawArena === 'function'
  );

  const result = await page.evaluate(() => {
    const floors = Array.from({ length: 30 }, (_, i) => i + 1);
    const standard = floors.find((f) => !isElite(f) && !isBoss(f));
    const elite = floors.find((f) => isElite(f) && !isBoss(f));
    const boss = floors.find((f) => isBoss(f));
    const shell = document.createElement('div');
    shell.className = 'arenaShell';
    shell.style.width = '360px';
    shell.style.height = '286px';
    document.body.appendChild(shell);

    const renderFloor = (floor) => {
      combat = spawnCampaign(Object.assign({}, S, { floor, step: 1 }));
      mountArena(shell);
      drawArena();
      return {
        floor,
        expected: campaignWaveCount(floor),
        text: document.getElementById('aSub').textContent,
      };
    };

    const values = {
      standard: renderFloor(standard),
      elite: renderFloor(elite),
      boss: renderFloor(boss),
      stepsPerFloor: RULES.STEPS_PER_FLOOR,
      bootLoaded: !!document.querySelector('script[src*="boot-stability-v115.js"]'),
    };
    shell.remove();
    return values;
  });

  expect(result.standard.expected).toBe(result.stepsPerFloor);
  expect(result.standard.text).toContain(`Vague 1/${result.stepsPerFloor}`);
  expect(result.elite.expected).toBe(2);
  expect(result.elite.text).toContain('Vague 1/2');
  expect(result.boss.expected).toBe(1);
  expect(result.boss.text).toContain('Vague 1/1');
  expect(result.bootLoaded).toBe(false);
});

test('retired V112 wave-display source stays absent from source and loader ownership', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(fs.existsSync(retiredWaveSource)).toBe(false);
  expect(index).not.toContain('wave-display-v112.js');
});
