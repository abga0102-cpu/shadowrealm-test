const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function src(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test.describe('Accomplishments legacy reward migration ownership', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V127 owns Raid 100 and legacy floor migration while V141 stays retired and unloaded', () => {
    const owner = src('accomplishments-reward-fix-v127.js');
    const retired = src('accomplishments-floor-comp-v141.js');
    const loader = src('index.html');

    expect(owner).toContain("var LEGACY_FLOOR_IDS=['floor25','floor50','floor75']");
    expect(owner).toContain('floorLegacyCompensationV141Processed=true');
    expect(owner).toContain('floorLegacyCompensationV141Paid=paid.slice()');
    expect(owner).toContain('floorLegacyCompensationV141At=Date.now()');
    expect(owner).toContain('compensateRaid100(migrated)');
    expect(owner).toContain('compensateLegacyFloors(migrated)');
    expect(owner).not.toMatch(/setInterval\s*\(/);

    expect(retired).toContain('__srFloorCompV141Retired=true');
    expect(retired).not.toMatch(/grantLegacy|floor25'\]|setTimeout\s*\(|setInterval\s*\(|window\.migrate\s*=|\bupdate\s*\(/);
    expect(loader).not.toContain('accomplishments-floor-comp-v141.js');
  });
});
