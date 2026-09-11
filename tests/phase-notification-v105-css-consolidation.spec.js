const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

test('V105 compact notification CSS is canonically owned by style.css', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(fs.existsSync(path.join(root, 'notification-compact-v105.js'))).toBe(true);
  expect(index).not.toContain('notification-compact-v105.js');
  expect(index).toContain('style.css?v=2026.09.11.311');
  expect(style).toContain('Canonical compact reward-notification presentation (formerly V105).');
  expect(style).toContain('#rewardFeed{position:absolute;right:8px;top:94px;z-index:68;width:min(210px,62%);display:flex;flex-direction:column;gap:4px;pointer-events:none}');
  expect(style).toContain('.rewardPop{padding:6px 8px;border:1px solid #43587D99;border-radius:9px;background:linear-gradient(180deg,#1827415c,#0b13234d);box-shadow:0 2px 6px #0003;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);animation:slideIn .18s ease-out;pointer-events:auto}');
  expect(style).toContain('.rewardPop.clickable::after{content:"Appuyer pour voir";display:block;margin-top:3px;font-size:8px');
  expect(style).toContain('.rewardPop.boss{border-color:#E8B44ACC;background:linear-gradient(180deg,#332a166e,#17120a5c);box-shadow:0 2px 7px #0003,0 0 9px #E8B44A18}');
  expect(style).toContain('.rewardPop .rpT{font-weight:900;font-size:10.5px;color:var(--text)}');
  expect(style).toContain('.rewardPop .rpS{font-size:9.5px;color:var(--textDim);margin-top:2px;line-height:1.25}');
});

test('compact reward notifications keep the V105 computed presentation without its runtime style node', async ({ page }) => {
  await page.goto('/index.html?smoke=1');
  await expect(page.locator('#notificationCompactV105')).toHaveCount(0);

  const computed = await page.evaluate(() => {
    const feed = document.createElement('div');
    feed.id = 'rewardFeed';
    feed.innerHTML = '<div class="rewardPop boss clickable"><div class="rpT">Titre</div><div class="rpS">Sous-titre</div></div>';
    document.body.appendChild(feed);
    const pop = feed.firstElementChild;
    const title = pop.querySelector('.rpT');
    const subtitle = pop.querySelector('.rpS');
    const feedStyle = getComputedStyle(feed);
    const popStyle = getComputedStyle(pop);
    const titleStyle = getComputedStyle(title);
    const subtitleStyle = getComputedStyle(subtitle);
    const afterStyle = getComputedStyle(pop, '::after');
    return {
      feed: {
        right: feedStyle.right,
        top: feedStyle.top,
        width: feedStyle.width,
        gap: feedStyle.gap,
      },
      pop: {
        padding: popStyle.padding,
        borderRadius: popStyle.borderRadius,
        backdropFilter: popStyle.backdropFilter,
      },
      titleSize: titleStyle.fontSize,
      subtitleSize: subtitleStyle.fontSize,
      subtitleLineHeight: parseFloat(subtitleStyle.lineHeight),
      afterSize: afterStyle.fontSize,
      afterMarginTop: afterStyle.marginTop,
    };
  });

  expect(computed.feed).toEqual({ right: '8px', top: '94px', width: '210px', gap: '4px' });
  expect(computed.pop).toEqual({ padding: '6px 8px', borderRadius: '9px', backdropFilter: 'blur(2px)' });
  expect(computed.titleSize).toBe('10.5px');
  expect(computed.subtitleSize).toBe('9.5px');
  expect(computed.subtitleLineHeight).toBeCloseTo(11.875, 3);
  expect(computed.afterSize).toBe('8px');
  expect(computed.afterMarginTop).toBe('3px');
});
