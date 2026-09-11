const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exists = file => fs.existsSync(path.join(root, file));
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Combat presentation source retirement', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('retired presentation layers stay absent behind V156 and V169', () => {
    for (const retired of [
      'combat-fluidity-v152.js',
      'combat-impact-v153.js',
      'combat-motion-v158.js',
      'combat-footlock-v162.js',
      'combat-walk-stability-v165.js',
    ]) expect(exists(retired)).toBe(false);

    const index = src('index.html');
    expect(index).toContain('combat-consolidated-v156.js');
    expect(index).toContain('combat-polish-v157.js');
    expect(index).toContain('combat-animation-v169.js');
    expect(index).toContain('combat-progression-authority-v285.js');
    for (const retired of [
      'combat-fluidity-v152.js',
      'combat-impact-v153.js',
      'combat-motion-v158.js',
      'combat-footlock-v162.js',
      'combat-walk-stability-v165.js',
    ]) expect(index).not.toContain(retired);
  });
});
