const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree label ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V116 owns clearer gold labels and V117 stays unloaded', () => {
    const v116 = src('tree-dedicated-v116.js');
    const html = src('index.html');

    expect(v116).toContain("n1_07:'Gain d’Or I'");
    expect(v116).toContain("n2_07:'Gain d’Or II'");
    expect(v116).toContain("n3_07:'Gain d’Or III'");
    expect(v116).toContain("n4_07:'Gain d’Or IV'");
    expect(v116).toContain('n.label=name;n.short=name');
    expect(html).not.toContain('tree-labels-v117.js');
  });
});
