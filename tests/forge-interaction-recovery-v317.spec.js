const { test, expect } = require('@playwright/test');

test('Forge comparison surface does not block the game behind it', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() => !!document.getElementById('srForgeInteractionRecoveryV317Style'));

  await page.evaluate(() => {
    window.__forgeBehindClicks = 0;
    window.__forgeOwnClicks = 0;

    const behind = document.createElement('button');
    behind.id = 'forgeBehindTarget';
    behind.textContent = 'behind';
    behind.style.cssText = 'position:fixed;left:20px;top:20px;width:120px;height:44px;z-index:8700';
    behind.addEventListener('click', () => { window.__forgeBehindClicks += 1; });
    document.body.appendChild(behind);

    const root = document.createElement('div');
    root.id = 'srForgeArenaPreview146';
    root.style.cssText = 'position:fixed;left:20px;top:20px;width:120px;height:44px;z-index:8800;background:transparent';
    root.innerHTML = '<div style="width:100%;height:100%"></div>';
    document.body.appendChild(root);
  });

  await page.mouse.click(80, 42);
  await expect.poll(() => page.evaluate(() => window.__forgeBehindClicks)).toBe(1);

  await page.evaluate(() => {
    const root = document.getElementById('srForgeArenaPreview146');
    root.innerHTML = '<button data-sr-fp146="keep" style="position:absolute;left:0;top:0;width:120px;height:44px">keep</button>';
    root.querySelector('button').addEventListener('click', () => { window.__forgeOwnClicks += 1; });
  });

  await page.mouse.click(80, 42);
  await expect.poll(() => page.evaluate(() => window.__forgeOwnClicks)).toBe(1);
});
