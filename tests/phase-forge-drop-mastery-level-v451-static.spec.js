const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('V451 build wires forge drop mastery authority after game-2', async () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const game2 = html.indexOf('game-2.js');
  const v451 = html.indexOf('forge-drop-mastery-level-v451.js');
  expect(game2).toBeGreaterThan(-1);
  expect(v451).toBeGreaterThan(game2);
  expect(html).toContain('shadowreach-build" content="2026.09.25.451');
});

test('V451 preserves old equipment and anchors inherited level', async () => {
  const src = fs.readFileSync('forge-drop-mastery-level-v451.js', 'utf8');
  expect(src).toContain('item.level = rank');
  expect(src).toContain('item.upgradeBaseLevel = rank');
  expect(src).not.toContain('inventory.forEach');
  expect(src).not.toContain('equipped');
});