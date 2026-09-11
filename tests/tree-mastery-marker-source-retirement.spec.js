const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree mastery marker source retirement', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('retired V120/V128 markers stay absent behind V216 mastery ownership', () => {
    expect(fs.existsSync(path.join(root, 'tree-mastery-v120.js'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'tree-mastery-ui-v128.js'))).toBe(false);

    const index = src('index.html');
    expect(index).toContain('runtime-tree-stability-v216.js');
    expect(index).not.toContain('tree-mastery-v120.js');
    expect(index).not.toContain('tree-mastery-ui-v128.js');
  });
});
