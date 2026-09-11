const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree renderer historical source retirement', () => {
  test('legacy radial camera and v111 renderer stay retired behind V116', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'source ownership is engine-independent');

    expect(fs.existsSync(path.join(root, 'tree-camera-v88.js'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'tree-clear-v102.js'))).toBe(false);

    const index = src('index.html');
    const inventory = src('RUNTIME_INVENTORY.md');
    const owner = src('tree-dedicated-v116.js');

    expect(index).not.toContain('tree-camera-v88.js');
    expect(index).not.toContain('tree-clear-v102.js');
    expect(inventory).not.toContain('tree-camera-v88.js');
    expect(inventory).not.toContain('tree-clear-v102.js');
    expect(index.match(/tree-dedicated-v116\.js/g) || []).toHaveLength(1);

    expect(owner).toContain('__srTreeDedicatedV116');
    expect(owner).toContain('treeGraph=dedicatedGraph');
    expect(owner).toContain('.srRadialTree,.srTreeClear{display:none!important}');
  });
});
