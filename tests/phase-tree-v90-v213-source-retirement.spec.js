const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree V90/V213 historical source retirement', () => {
  test('legacy renderer and mastery observer stay retired behind V116/V216', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'source ownership is engine-independent');

    expect(fs.existsSync(path.join(root, 'tree-simple-v90.js'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'personal-tree-mastery-clarity-v213.js'))).toBe(false);

    const index = src('index.html');
    const inventory = src('RUNTIME_INVENTORY.md');
    const renderer = src('tree-dedicated-v116.js');
    const mastery = src('runtime-tree-stability-v216.js');

    expect(index).not.toContain('tree-simple-v90.js');
    expect(index).not.toContain('personal-tree-mastery-clarity-v213.js');
    const activeInventory = inventory.split('## Already retired/unloaded')[0];
    expect(activeInventory).not.toContain('tree-simple-v90.js');
    expect(activeInventory).not.toContain('personal-tree-mastery-clarity-v213.js');
    expect(inventory).toContain('Tree mastery V120/V128/V213');
    expect(inventory).toContain('historical V90 renderer');

    expect(index.match(/tree-dedicated-v116\.js/g) || []).toHaveLength(1);
    expect(index.match(/runtime-tree-stability-v216\.js/g) || []).toHaveLength(1);
    expect(renderer).toContain('__srTreeDedicatedV116');
    expect(renderer).toContain('treeGraph=dedicatedGraph');
    expect(mastery).toContain('__srRuntimeTreeStabilityV216');
    expect(mastery).toContain('__srPersonalTreeMasteryClarityV213=true');
    expect(mastery).toContain('treeReqOk=function');
    expect(mastery).toContain('function syncPopup()');
    expect(mastery).not.toContain('new MutationObserver');
  });
});
