const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exists = file => fs.existsSync(path.join(root, file));
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Combat animation source ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('only canonical V169 animation source remains from the retired animation generations', () => {
    for (const retired of [
      'combat-animation-v159.js',
      'combat-animation-v161.js',
      'combat-animation-v163.js',
      'combat-animation-v164.js',
      'combat-animation-v166.js',
      'combat-animation-v167.js',
      'combat-animation-v168.js',
    ]) expect(exists(retired)).toBe(false);

    expect(exists('combat-animation-v169.js')).toBe(true);
    const index = src('index.html');
    expect(index).toContain('combat-consolidated-v156.js');
    expect(index).toContain('combat-polish-v157.js');
    expect(index).toContain('combat-animation-v169.js');
    expect(index).toContain('combat-progression-authority-v285.js');
    for (const retired of ['v159','v161','v163','v164','v166','v167','v168']) {
      expect(index).not.toContain(`combat-animation-${retired}.js`);
    }
  });
});
