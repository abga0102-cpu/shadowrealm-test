const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exists = file => fs.existsSync(path.join(root, file));
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Power integrity V255 source retirement', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V256 remains the loaded authority and owns V255 cleanup', () => {
    expect(exists('power-integrity-v255.js')).toBe(false);
    expect(exists('power-source-integrity-v256.js')).toBe(true);

    const index = src('index.html');
    expect(index).toContain('power-source-integrity-v256.js');
    expect(index).not.toContain('power-integrity-v255.js');

    const v256 = src('power-source-integrity-v256.js');
    expect(v256).toContain('delete S.powerIntegrityCompensationV255');
    expect(v256).toContain('delete S.powerIntegrityCompensationV255At');
    expect(v256).toContain("localStorage.removeItem('shadowreach.power.integrity.v255')");
  });
});
