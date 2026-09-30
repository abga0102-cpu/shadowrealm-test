const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
function src(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }

test.describe('Tree / Raid Evolution PE ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V396 is final Evolution PE owner and V290 mirrors the V486 curve for compatibility', () => {
    const treeSafety = src('tree-safety-v83.js');
    const raidPE = src('raid-pe-authority-v290.js');
    const finalRewards = src('raid-reward-authority-v396.js');

    expect(treeSafety).not.toContain('oldRaidReward');
    expect(treeSafety).not.toMatch(/raidReward\s*=\s*function/);
    expect(treeSafety).toContain("raidReward('evolution',1)");
    expect(treeSafety).toContain("raidReward('evolution',2)");

    expect(raidPE).toContain("if(raid==='evolution') return peReward(level)");
    expect(raidPE).toContain('if(level<=14)return 150+10*(level-1)');
    expect(raidPE).toContain('return 280+5*(level-14)');
    expect(raidPE).toContain('wrapped.__srV290=true');

    expect(finalRewards).toContain("if(type==='evolution')return evolutionReward(level)");
    expect(finalRewards).toContain('if(lv<=14)return 150+10*(lv-1)');
    expect(finalRewards).toContain('return 280+5*(lv-14)');
    expect(finalRewards).toContain('raidReward.__srFinalAuthorityV396=true');
  });
});
