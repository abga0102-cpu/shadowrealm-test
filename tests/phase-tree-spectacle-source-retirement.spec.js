const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree spectacle historical source retirement', () => {
  test('V212/V246 stay retired and staged V247 is unloaded behind canonical V116 presentation', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'source ownership is engine-independent');

    expect(fs.existsSync(path.join(root, 'personal-tree-spectacle-v212.js'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'personal-tree-spectacle-v246.js'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'personal-tree-spectacle-v247.js'))).toBe(true);

    const index = src('index.html');
    const visual = src('personal-tree-spectacle-v247.js');
    const dedicated = src('tree-dedicated-v116.js');

    expect(index).not.toContain('personal-tree-spectacle-v212.js');
    expect(index).not.toContain('personal-tree-spectacle-v246.js');
    expect(index).not.toContain('personal-tree-spectacle-v247.js');
    expect(index.match(/tree-dedicated-v116\.js/g) || []).toHaveLength(1);
    expect(index.match(/runtime-tree-stability-v216\.js/g) || []).toHaveLength(1);

    expect(visual).toContain('__srPersonalTreeSpectacleV250');
    expect(visual).toContain('.srDedicatedTree');
    expect(visual).not.toContain('treeReqOk=');
    expect(dedicated).toContain('__srPersonalTreeSpectacleV250');
    expect(dedicated).toContain('.srDedicatedTree');
  });
});
