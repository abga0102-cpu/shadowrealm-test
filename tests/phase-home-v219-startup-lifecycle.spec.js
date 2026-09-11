const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test.describe('Home V219 startup lifecycle', () => {
  test('starts synchronously while preserving RAF batching for lifecycle events', async ({ page }) => {
    const source = fs.readFileSync(path.join(root, 'home-layout-authority-v219.js'), 'utf8');

    expect(source).toContain("addEventListener('sr:bottomnavrendered',schedule)");
    expect(source).toContain("addEventListener('resize',schedule,{passive:true})");
    expect(source).toContain("addEventListener('orientationchange',schedule,{passive:true})");
    expect(source).toContain('requestAnimationFrame(function(){queued=false;sync();})');
    expect(source).toContain("addEventListener('orientationchange',schedule,{passive:true});sync();");
    expect(source).not.toContain("addEventListener('orientationchange',schedule,{passive:true});schedule();");

    await page.goto('/index.html?smoke=1');
    await page.waitForFunction(() => window.__srHomeLayoutAuthorityV219 === true);

    const state = await page.evaluate(() => ({
      home: document.getElementById('app').classList.contains('srHomeFullArena'),
      hasCampaign: !!document.querySelector('#screen.fixed .campaignWorld'),
      sync: typeof window.__srSyncHomeLayoutV219 === 'function'
    }));

    expect(state.sync).toBe(true);
    expect(state.home).toBe(state.hasCampaign);
    await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
  });
});
