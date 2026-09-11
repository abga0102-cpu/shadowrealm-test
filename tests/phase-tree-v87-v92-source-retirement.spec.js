const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree V87/V92 historical source retirement', () => {
  test('legacy bridge and Forge-style renderer stay retired behind V116', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'source ownership is engine-independent');

    expect(fs.existsSync(path.join(root, 'tree-mobile-pan-v87.js'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'tree-forgemaster-v92.js'))).toBe(false);

    const index = src('index.html');
    const inventory = src('RUNTIME_INVENTORY.md');
    const owner = src('tree-dedicated-v116.js');

    expect(index).not.toContain('tree-mobile-pan-v87.js');
    expect(index).not.toContain('tree-forgemaster-v92.js');
    expect(inventory).not.toContain('tree-mobile-pan-v87.js');
    expect(inventory).not.toContain('tree-forgemaster-v92.js');
    expect(index.match(/tree-dedicated-v116\.js/g) || []).toHaveLength(1);

    expect(owner).toContain('__srTreeDedicatedV116');
    expect(owner).toContain('treeGraph=dedicatedGraph');
  });
});
