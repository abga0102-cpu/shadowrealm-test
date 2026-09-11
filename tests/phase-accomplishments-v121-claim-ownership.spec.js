const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function src(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test.describe('Accomplishments V121 ownership', () => {
  test('V139/V140 own UI and claims while V121 keeps state/event compatibility only', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'source ownership is engine-independent');

    const legacy = src('accomplishments-v121.js');
    const ui = src('accomplishments-canonical-v139.js');
    const claims = src('accomplishments-claim-v140.js');

    expect(legacy).not.toMatch(/function\s+grant\s*\(/);
    expect(legacy).not.toMatch(/function\s+claim\s*\(/);
    expect(legacy).not.toMatch(/function\s+open\s*\(/);
    expect(legacy).not.toMatch(/function\s+row\s*\(/);
    expect(legacy).not.toMatch(/function\s+rewardText\s*\(/);
    expect(legacy).not.toMatch(/ACT\.accomplishments\s*=/);
    expect(legacy).toContain('V121 intentionally owns no Accomplishments renderer or payout path');
    expect(legacy).toContain('showRaidResult=function');
    expect(legacy).toContain('ACT.fuse=');

    expect(ui).toContain('ACT.accomplishments=function()');
    expect(ui).toContain('installSettingsEntry');
    expect(claims).toMatch(/function\s+grant\s*\(/);
    expect(claims).toMatch(/function\s+claim\s*\(/);
    expect(claims).toContain("closest('.srAch139 [data-ach]')");
  });
});
