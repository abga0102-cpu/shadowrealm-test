const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
function src(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }

test.describe('Tree / Raid Evolution PE ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V290 is the sole Evolution raid PE reward owner', () => {
    const treeSafety = src('tree-safety-v83.js');
    const raidPE = src('raid-pe-authority-v290.js');

    expect(treeSafety).not.toContain('oldRaidReward');
    expect(treeSafety).not.toMatch(/raidReward\s*=\s*function/);
    expect(treeSafety).toContain("raidReward('evolution',1)");
    expect(treeSafety).toContain("raidReward('evolution',2)");

    expect(raidPE).toContain("if(raid==='evolution') return peReward(level)");
    expect(raidPE).toContain('return 100+3*(level-1)');
    expect(raidPE).toContain('wrapped.__srV290=true');
  });
});
