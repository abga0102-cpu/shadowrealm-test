const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree label ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V116 owns clearer gold labels and V117 stays unloaded', () => {
    const owner = src('tree-dedicated-v116.js');
    const retired = src('tree-labels-v117.js');
    const loader = src('index.html');

    expect(owner).toContain("n1_07:'Gain d’Or I'");
    expect(owner).toContain("n2_07:'Gain d’Or II'");
    expect(owner).toContain("n3_07:'Gain d’Or III'");
    expect(owner).toContain("n4_07:'Gain d’Or IV'");
    expect(loader).toContain('tree-dedicated-v116.js');
    expect(loader).not.toContain('tree-labels-v117.js');

    expect(retired).toContain("n1_07:'Gain d’Or I'");
    expect(retired).not.toMatch(/setInterval\s*\(|MutationObserver|window\.renderTabs\s*=/);
  });
});
