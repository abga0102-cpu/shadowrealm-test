const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree clearer-label ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V116 owns clearer gold labels while retired V117 stays absent', () => {
    const owner = src('tree-dedicated-v116.js');
    const index = src('index.html');

    for (const pair of [
      ['n1_07', 'Gain d’Or I'],
      ['n2_07', 'Gain d’Or II'],
      ['n3_07', 'Gain d’Or III'],
      ['n4_07', 'Gain d’Or IV'],
    ]) {
      expect(owner).toContain(`${pair[0]}:'${pair[1]}'`);
    }

    expect(fs.existsSync(path.join(root, 'tree-labels-v117.js'))).toBe(false);
    expect(index).not.toContain('tree-labels-v117.js');
  });
});
