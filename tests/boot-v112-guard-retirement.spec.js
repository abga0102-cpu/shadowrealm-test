const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Boot V112 compatibility guard retirement', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'source ownership is engine-independent');

  test('V115 owns wave display without a retired V112 guard', () => {
    expect(fs.existsSync(path.join(root, 'wave-display-v112.js'))).toBe(false);
    const boot = src('boot-stability-v115.js');
    const index = src('index.html');

    expect(boot).toContain('function syncWaveDisplay()');
    expect(boot).toContain("new MutationObserver(function(){");
    expect(boot).not.toContain('__srWaveDisplayV112');
    expect(index).toContain('boot-stability-v115.js');
    expect(index).not.toContain('wave-display-v112.js');
  });
});
