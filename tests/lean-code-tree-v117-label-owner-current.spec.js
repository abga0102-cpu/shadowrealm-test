const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree clearer-label staged ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V116 owns clearer gold labels while V117 remains an inert loaded marker', () => {
    const owner = src('tree-dedicated-v116.js');
    const retired = src('tree-labels-v117.js');
    const index = src('index.html');

    for (const pair of [
      ['n1_07', 'Gain d’Or I'],
      ['n2_07', 'Gain d’Or II'],
      ['n3_07', 'Gain d’Or III'],
      ['n4_07', 'Gain d’Or IV'],
    ]) {
      expect(owner).toContain(`${pair[0]}:'${pair[1]}'`);
    }

    expect(retired).toContain('__srTreeLabelsV117Retired=true');
    expect(retired).not.toMatch(/TREE_BY_ID|\.label\s*=|\.short\s*=|\brender\s*\(/);
    expect(index).toContain('tree-labels-v117.js');
  });
});
