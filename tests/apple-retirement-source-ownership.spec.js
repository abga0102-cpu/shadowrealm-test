const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exists = file => fs.existsSync(path.join(root, file));
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Apple retirement source ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('only the production V306 Apple retirement authority remains', () => {
    for (const retired of [
      'apple-removal-authority-v305.js',
      'apple-retirement-authority-v305.js',
      'apple-retirement-authority-v306.js',
    ]) expect(exists(retired)).toBe(false);

    expect(exists('apple-system-retirement-v306.js')).toBe(true);
    const index = src('index.html');
    expect(index).toContain('apple-system-retirement-v306.js');
    expect(index).not.toContain('apple-removal-authority-v305.js');
    expect(index).not.toContain('apple-retirement-authority-v305.js');
    expect(index).not.toContain('apple-retirement-authority-v306.js');
  });
});
