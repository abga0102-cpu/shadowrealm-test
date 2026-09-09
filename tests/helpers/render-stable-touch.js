const { expect } = require('@playwright/test');

async function touchCurrentLocator(page, locator, options = {}) {
  const {
    label = 'target',
    scroll = false,
    timeout = 7000
  } = options;

  // Use Playwright's locator-driven tap instead of sampling a DOM point and
  // tapping that absolute coordinate later. On WebKit/iPhone, render churn can
  // replace or move a target between those two operations, and elementFromPoint
  // can also disagree with the visual viewport after scrolling. Locator.tap()
  // re-resolves the current node and performs its own actionability / hit-target
  // checks immediately before dispatching the touch sequence.
  if (scroll) {
    // scrollIntoViewIfNeeded() is itself an actionability operation and waits for
    // the element to become stable. Some live game cards can keep moving by a few
    // pixels while nearby content rerenders even though they are already visible
    // and touchable. Scroll through the current DOM node directly, then let the
    // final locator.tap() perform the real visibility/hit-target validation.
    await locator.evaluate((el) => {
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
    await page.evaluate(() => new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }));
  }

  await expect(locator, `${label} must be visible before touch`).toBeVisible({ timeout });
  await locator.tap({ timeout });
}

module.exports = { touchCurrentLocator };
