const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function src(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

test.describe('Accomplishments legacy reward migration ownership', () => {
  test('V127 owns Raid 100 and legacy floor migration while V141 stays source-retired', () => {
    const owner = src('accomplishments-reward-fix-v127.js');
    const loader = src('index.html');

    expect(owner).toContain("var LEGACY_FLOOR_IDS=['floor25','floor50','floor75']");
    expect(owner).toContain('floorLegacyCompensationV141Processed=true');
    expect(owner).toContain('floorLegacyCompensationV141Paid=paid.slice()');
    expect(owner).toContain('floorLegacyCompensationV141At=Date.now()');
    expect(owner).toContain('compensateRaid100(migrated)');
    expect(owner).toContain('compensateLegacyFloors(migrated)');
    expect(owner).not.toMatch(/setInterval\s*\(/);

    expect(exists('accomplishments-floor-comp-v141.js')).toBe(false);
    expect(loader).not.toContain('accomplishments-floor-comp-v141.js');
  });
});
