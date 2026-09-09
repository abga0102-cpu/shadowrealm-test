const { expect } = require('@playwright/test');

async function touchCurrentLocator(page, locator, options = {}) {
  const {
    label = 'target',
    scroll = false,
    timeout = 7000
  } = options;

  let hit = null;
  await expect.poll(async () => {
    try {
      const candidate = await locator.evaluate(async (el, shouldScroll) => {
        if (shouldScroll) {
          el.scrollIntoView({ block: 'center', inline: 'nearest' });
          await new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
          });
        }

        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const inViewport = rect.width > 0 && rect.height > 0 &&
          x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight;
        const top = inViewport ? document.elementFromPoint(x, y) : null;
        return {
          x,
          y,
          width: rect.width,
          height: rect.height,
          ok: !!top && (top === el || el.contains(top))
        };
      }, scroll);

      if (candidate.width > 0 && candidate.height > 0 && candidate.ok) {
        hit = candidate;
        return true;
      }
    } catch (_) {
      // A render may replace the node between locator resolution and geometry
      // sampling. Polling deliberately re-resolves the locator on the next pass.
    }
    hit = null;
    return false;
  }, {
    timeout,
    intervals: [25, 50, 100, 200, 400]
  }).toBe(true);

  expect(hit, `${label} must resolve to a current touch point`).toBeTruthy();
  await page.touchscreen.tap(hit.x, hit.y);
}

module.exports = { touchCurrentLocator };
