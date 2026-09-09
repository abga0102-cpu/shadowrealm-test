const { expect } = require('@playwright/test');

async function touchCurrentLocator(page, locator, options = {}) {
  const {
    label = 'target',
    scroll = false,
    timeout = 7000
  } = options;

  const deadline = Date.now() + timeout;
  let lastReason = 'no hittable point found';

  // The game can replace interactive nodes while the screen is rendering. A
  // Playwright locator remains logically valid across those replacements, but
  // locator.tap() waits for one specific DOM node to remain geometrically
  // stable and can therefore time out on WebKit even while the control is
  // continuously visible to a user. Drive a real touchscreen tap at a point
  // owned by the current logical control instead, and verify that the generated
  // click landed on that same logical control. If render churn swaps the node
  // between sampling and input, the miss is detected and the locator is sampled
  // again rather than accepting a stale coordinate.
  await expect(locator, `${label} must be visible before touch`).toBeVisible({ timeout });

  while (Date.now() < deadline) {
    try {
      const hit = await locator.evaluate((el, shouldScroll) => {
        if (shouldScroll) {
          el.scrollIntoView({ block: 'center', inline: 'nearest' });
        }

        const signature = (() => {
          const attrs = {};
          const keep = new Set(['id', 'data-act', 'data-arg', 'data-testid', 'aria-label']);
          for (const attr of el.attributes) {
            if (keep.has(attr.name) || attr.name.startsWith('data-sr-') || attr.name.startsWith('data-ach-')) {
              attrs[attr.name] = attr.value;
            }
          }
          const text = String(el.textContent || '').replace(/\s+/g, ' ').trim();
          const hasStableIdentity = Object.keys(attrs).length > 0;
          return {
            tag: el.tagName,
            attrs,
            // Text is useful for otherwise anonymous controls, but it is not a
            // stable identity when the control updates its own label on click
            // (for example Équiper -> Équipé).
            text: !hasStableIdentity && text.length > 0 && text.length <= 80 ? text : ''
          };
        })();

        const matches = (node) => {
          for (let cur = node; cur && cur.nodeType === 1; cur = cur.parentElement) {
            if (cur.tagName !== signature.tag) continue;
            let ok = true;
            for (const [name, value] of Object.entries(signature.attrs)) {
              if (cur.getAttribute(name) !== value) {
                ok = false;
                break;
              }
            }
            if (ok && signature.text) {
              const text = String(cur.textContent || '').replace(/\s+/g, ' ').trim();
              ok = text === signature.text;
            }
            if (ok) return true;
          }
          return false;
        };

        const rect = el.getBoundingClientRect();
        const left = Math.max(0, rect.left);
        const right = Math.min(window.innerWidth, rect.right);
        const top = Math.max(0, rect.top);
        const bottom = Math.min(window.innerHeight, rect.bottom);
        if (!(right > left && bottom > top)) {
          return { ok: false, reason: 'outside viewport' };
        }

        // Try the centre of the actually visible portion first, then nearby
        // inset points. This keeps a sticky header/footer from making an
        // otherwise touchable large card look unavailable.
        const xs = [(left + right) / 2, left + (right - left) * 0.3, left + (right - left) * 0.7];
        const ys = [(top + bottom) / 2, top + (bottom - top) * 0.3, top + (bottom - top) * 0.7];
        for (const y of ys) {
          for (const x of xs) {
            if (matches(document.elementFromPoint(x, y))) {
              return { ok: true, x, y, signature };
            }
          }
        }
        return { ok: false, reason: 'logical control does not own a visible hit point' };
      }, scroll);

      if (!hit.ok) {
        lastReason = hit.reason || lastReason;
        await page.waitForTimeout(25);
        continue;
      }

      // Arm a capture-phase probe and recheck the sampled point after the probe
      // is installed. The probe matches durable logical identity (data-act /
      // data-arg, data-sr-*, data-ach-*, id, etc.), so an equivalent replacement
      // node or an in-place label/class update is fine; a different control is not.
      const armed = await page.evaluate(({ x, y, signature }) => {
        const matches = (node) => {
          for (let cur = node; cur && cur.nodeType === 1; cur = cur.parentElement) {
            if (cur.tagName !== signature.tag) continue;
            let ok = true;
            for (const [name, value] of Object.entries(signature.attrs)) {
              if (cur.getAttribute(name) !== value) {
                ok = false;
                break;
              }
            }
            if (ok && signature.text) {
              const text = String(cur.textContent || '').replace(/\s+/g, ' ').trim();
              ok = text === signature.text;
            }
            if (ok) return true;
          }
          return false;
        };

        if (!matches(document.elementFromPoint(x, y))) return false;

        if (window.__srPhaseTouchProbe && window.__srPhaseTouchProbe.cleanup) {
          window.__srPhaseTouchProbe.cleanup();
        }
        const probe = { touchHit: false, clickHit: false, cleanup: null };
        const onTouch = (event) => { if (matches(event.target)) probe.touchHit = true; };
        const onClick = (event) => { if (matches(event.target)) probe.clickHit = true; };
        probe.cleanup = () => {
          document.removeEventListener('touchstart', onTouch, true);
          document.removeEventListener('click', onClick, true);
        };
        window.__srPhaseTouchProbe = probe;
        document.addEventListener('touchstart', onTouch, true);
        document.addEventListener('click', onClick, true);
        return true;
      }, hit);

      if (!armed) {
        lastReason = 'render replaced the hit target before input';
        await page.waitForTimeout(25);
        continue;
      }

      await page.touchscreen.tap(hit.x, hit.y);
      const delivery = await page.evaluate(() => {
        const probe = window.__srPhaseTouchProbe;
        if (!probe) return { touchHit: false, clickHit: false };
        const result = { touchHit: !!probe.touchHit, clickHit: !!probe.clickHit };
        if (probe.cleanup) probe.cleanup();
        delete window.__srPhaseTouchProbe;
        return result;
      });

      if (delivery.clickHit) return;
      lastReason = delivery.touchHit
        ? 'touch reached the control but its click was lost during render replacement'
        : 'touch landed after the logical target moved';
    } catch (error) {
      lastReason = error && error.message ? error.message : String(error);
      try {
        await page.evaluate(() => {
          const probe = window.__srPhaseTouchProbe;
          if (probe && probe.cleanup) probe.cleanup();
          delete window.__srPhaseTouchProbe;
        });
      } catch (_) {}
    }

    await page.waitForTimeout(25);
  }

  throw new Error(`${label} did not receive a verified touchscreen tap: ${lastReason}`);
}

module.exports = { touchCurrentLocator };
