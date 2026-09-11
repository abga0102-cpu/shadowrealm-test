const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Equipment stats V175 source retirement', () => {
  test('V175 stays retired while V176 remains the loaded collapse owner', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'source ownership is engine-independent');

    // Source-ownership contract: V175 stays gone; V176 remains the sole loaded implementation.
    expect(fs.existsSync(path.join(root, 'equipment-stats-collapse-v175.js'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'equipment-stats-collapse-v176.js'))).toBe(true);

    const index = src('index.html');
    const inventory = src('RUNTIME_INVENTORY.md');
    const owner = src('equipment-stats-collapse-v176.js');

    expect(index).not.toContain('equipment-stats-collapse-v175.js');
    expect(inventory).not.toContain('equipment-stats-collapse-v175.js');
    expect(index.match(/equipment-stats-collapse-v176\.js/g) || []).toHaveLength(1);
    expect(inventory).toContain('equipment-stats-collapse-v176.js');

    expect(owner).toContain('__srEquipmentStatsCollapseV176');
    expect(owner).toContain("statistiques de combat");
    expect(owner).toContain("Masquer ▲");
    expect(owner).toContain("Afficher ▼");
  });
});
