const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Accomplishments V127 bounded startup lifecycle', () => {
  test('keeps deterministic migration ownership without redundant near-startup timers', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'source lifecycle contract is engine-independent');

    const code = src('accomplishments-reward-fix-v127.js');

    expect(code).toContain('window.migrate=function()');
    expect(code).toContain('compensateRaid100(migrated)');
    expect(code).toContain('compensateLegacyFloors(migrated)');
    expect(code).toContain('compensateCurrentState();');
    expect(code).toContain('setTimeout(compensateCurrentState,700);');
    expect(code).toContain('setTimeout(compensateCurrentState,1800);');
    expect(code).not.toContain('setTimeout(compensateCurrentState,50);');
    expect(code).not.toContain('setTimeout(compensateCurrentState,80);');
  });
});
