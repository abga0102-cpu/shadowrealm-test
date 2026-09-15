const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test.describe('Progression Pass compact Arena launcher V332', () => {
  test('loads after the Pass owners and keeps the launcher compact', async ({ page }) => {
    const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const source = fs.readFileSync(path.join(root, 'accomplishments-launcher-compact-v332.js'), 'utf8');
    expect(index.indexOf('accomplishments-launcher-compact-v332.js')).toBeGreaterThan(index.indexOf('accomplishments-claim-v140.js'));
    expect(source).toContain('width:44px!important');
    expect(source).toContain('min-height:86px!important');
    expect(source).toContain('.srAchLaunchLabel,');
    expect(source).toContain('.srAchLaunchStage{display:none!important;}');
    expect(source).toContain(':has(.srAchLaunchBadge)');
    expect(source).not.toContain('ACT.accomplishments=');

    await page.goto('/index.html?smoke=1');
    await page.waitForFunction(() => window.__srAccomplishmentsLauncherCompactV332 === true);
  });
});
