const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree clearer-label ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V116 owns existing Or obtenu labels while retired V117 stays absent', () => {
    const owner = src('tree-dedicated-v116.js');
    const index = src('index.html');

    for (const pair of [
      ['n1_06', 'Or obtenu I'],
      ['n2_06', 'Or obtenu II'],
      ['n3_06', 'Or obtenu III'],
      ['n4_06', 'Or obtenu IV'],
    ]) {
      expect(owner).toContain(`${pair[0]}:'${pair[1]}'`);
    }

    expect(fs.existsSync(path.join(root, 'tree-labels-v117.js'))).toBe(false);
    expect(index).not.toContain('tree-labels-v117.js');
  });
});
