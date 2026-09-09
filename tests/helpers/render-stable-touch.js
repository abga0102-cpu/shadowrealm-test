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
    await locator.scrollIntoViewIfNeeded({ timeout });
    await page.evaluate(() => new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }));
  }

  await expect(locator, `${label} must be visible before touch`).toBeVisible({ timeout });
  await locator.tap({ timeout });
}

module.exports = { touchCurrentLocator };
