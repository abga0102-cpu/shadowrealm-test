const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function src(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test.describe('Accomplishments claim ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V140 is the sole claim/payout implementation and V121 keeps compatibility only', () => {
    const legacy = src('accomplishments-v121.js');
    const canonical = src('accomplishments-claim-v140.js');

    expect(legacy).not.toMatch(/function\s+grant\s*\(/);
    expect(legacy).not.toMatch(/function\s+claim\s*\(/);
    expect(legacy).toContain('Canonical claim clicks and payout logic are owned by accomplishments-claim-v140.js');

    expect(canonical).toMatch(/function\s+grant\s*\(/);
    expect(canonical).toMatch(/function\s+claim\s*\(/);
    expect(canonical).toContain("closest('.srAch139 [data-ach]')");
  });
});
