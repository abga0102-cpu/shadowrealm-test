const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const retired = path.join(root, 'forge-power-feedback-v148.js');

test('retired Forge V148 power-feedback kill-switch stays absent from source and runtime', async ({ page }) => {
  expect(fs.existsSync(retired)).toBe(false);
  expect(index).not.toContain('forge-power-feedback-v148.js');
  expect((index.match(/forge-ux-v273\.js/g) || []).length).toBe(1);
  expect((index.match(/forge-panel-authority-v266\.js/g) || []).length).toBe(1);

  await page.goto('/index.html');
  await page.waitForFunction(() => document.readyState === 'complete');

  const legacy = await page.evaluate(() => ({
    popup: !!document.getElementById('srForgePowerFeedback148'),
    hook: typeof window.__srShowForgePowerFeedbackV148,
    guard: typeof window.__srForgePowerFeedbackV251,
    style: !!document.getElementById('srForgePowerFeedbackV251Style')
  }));

  expect(legacy).toEqual({ popup: false, hook: 'undefined', guard: 'undefined', style: false });
});
