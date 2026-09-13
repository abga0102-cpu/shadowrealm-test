const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function src(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

test.describe('Accomplishments legacy migration ownership', () => {
  test('V127 owns historical progress and reward migration while V121 keeps event compatibility only', () => {
    const owner = src('accomplishments-reward-fix-v127.js');
    const legacy = src('accomplishments-v121.js');
    const loader = src('index.html');

    expect(owner).toContain('function normalizeLegacyProgress(s){');
    expect(owner).toContain('Object.values(s.raids||{})');
    expect(owner).toContain("a.fusedPetRank=-1");
    expect(owner).toContain('a.v121Migrated=true');
    expect(owner).toContain('normalizeLegacyProgress(S);');
    expect(owner).toContain('normalizeLegacyProgress(migrated)');

    expect(owner).toContain("var LEGACY_FLOOR_IDS=['floor25','floor50','floor75']");
    expect(owner).toContain('floorLegacyCompensationV141Processed=true');
    expect(owner).toContain('floorLegacyCompensationV141Paid=paid.slice()');
    expect(owner).toContain('floorLegacyCompensationV141At=Date.now()');
    expect(owner).toContain('compensateRaid100(migrated)');
    expect(owner).toContain('compensateLegacyFloors(migrated)');
    expect(owner).not.toMatch(/setInterval\s*\(/);

    expect(legacy).not.toContain('Object.values(s.raids||{})');
    expect(legacy).not.toContain('v121Migrated');
    expect(legacy).toContain('showRaidResult=function');
    expect(legacy).toContain('ACT.fuse=');

    expect(exists('accomplishments-floor-comp-v141.js')).toBe(false);
    expect(loader).not.toContain('accomplishments-floor-comp-v141.js');
  });

  test('V127 normalizes both boot state and imported legacy saves with the historical conservative defaults', () => {
    const sandbox = {
      window: { migrate: save => save },
      ACCEL_DEFS: [],
      S: {
        raids: {
          alpha: { record: 3 },
          beta: { record: '2' },
          ignored: { record: -5 }
        },
        accomplishments: {}
      },
      setTimeout: () => 0,
      Date,
      Object,
      Number,
      Math,
      Array
    };
    vm.createContext(sandbox);
    vm.runInContext(src('accomplishments-reward-fix-v127.js'), sandbox);

    expect(sandbox.S.accomplishments.raidWins).toBe(5);
    expect(sandbox.S.accomplishments.fusedPetRank).toBe(-1);
    expect(sandbox.S.accomplishments.v121Migrated).toBe(true);

    const imported = {
      raids: { gamma: { record: 4 } },
      accomplishments: {}
    };
    const migrated = sandbox.window.migrate(imported);

    expect(migrated).toBe(imported);
    expect(imported.accomplishments.raidWins).toBe(4);
    expect(imported.accomplishments.fusedPetRank).toBe(-1);
    expect(imported.accomplishments.v121Migrated).toBe(true);
  });
});
