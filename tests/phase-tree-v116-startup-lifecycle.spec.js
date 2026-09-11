const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree V116 startup lifecycle', () => {
  test('initial mode sync runs directly after the initial render without a bootstrap timer', () => {
    const tree = src('tree-dedicated-v116.js');
    expect(tree).toContain("window.addEventListener('sr:bottomnavrendered',scheduleModeSync)");
    expect(tree).not.toContain('setTimeout(syncMode,0)');

    const renderIndex = tree.lastIndexOf("try{if(typeof render==='function')render();}catch(_){}");
    const syncIndex = tree.lastIndexOf('syncMode();');
    expect(renderIndex).toBeGreaterThan(-1);
    expect(syncIndex).toBeGreaterThan(renderIndex);
  });
});
