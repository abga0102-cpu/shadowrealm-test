const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const INDEX = read('index.html');

const loadedScripts = [...INDEX.matchAll(/<script\s+src=["']([^"']+)["']/g)]
  .map((m) => m[1].split('?')[0]);

const countLoaded = (name) => loadedScripts.filter((s) => s === name).length;

const retiredUnloaded = [
  'social-forge-layout-v1.js',
  'accomplishments-titles-v133.js',
  'accomplishments-overview-v135.js',
  'accomplishments-home-scope-v136.js',
  'accomplishments-floors-v137.js',
  'accomplishments-ui-v123.js',
  'tree-mastery-v120.js',
  'tree-mastery-ui-v128.js',
];

const canonicalLoaded = [
  'home-layout-authority-v219.js',
  'combat-consolidated-v156.js',
  'combat-polish-v157.js',
  'combat-animation-v169.js',
  'combat-progression-authority-v285.js',
  'import-save-guard-v207.js',
  'progression-overhaul-v283.js',
  'game-balance-v224.js',
  'tree-mastery-v149.js',
  'accomplishments-stability-v138.js',
  'accomplishments-canonical-v139.js',
  'accomplishments-claim-v140.js',
  'accomplishments-reward-fix-v127.js',
  'social-v1.js',
];

test('architecture source of truth exists and names concurrency workflow', () => {
  const architecture = read('ARCHITECTURE.md');
  expect(architecture).toContain('Canonical owners');
  expect(architecture).toContain('Concurrency-safe workflow');
  expect(architecture).toContain('Merge only the exact tested head SHA');
});

test('retired ownership layers stay unloaded', () => {
  for (const file of retiredUnloaded) {
    expect(countLoaded(file), `${file} must remain unloaded`).toBe(0);
  }
});

test('canonical ownership layers load exactly once', () => {
  for (const file of canonicalLoaded) {
    expect(countLoaded(file), `${file} must load exactly once`).toBe(1);
  }
});

test('known duplicate ownership mechanisms do not return', () => {
  const v138 = read('accomplishments-stability-v138.js');
  const v127 = read('accomplishments-reward-fix-v127.js');
  const v119 = read('home-layout-fix-v119.js');
  const v125 = read('sanctuary-pricing-v125.js');

  expect(v138).not.toMatch(/new\s+MutationObserver\s*\(/);
  expect(v127).not.toMatch(/setInterval\s*\([^,]+,\s*500\s*\)/s);
  expect(v119).not.toMatch(/renderTabs\s*=|function\s+renderTabs\b/);
  expect(v125).not.toContain('IMPORT_GUARD_V206');
});

test('ownership-sensitive files are represented in the architecture map', () => {
  const architecture = read('ARCHITECTURE.md');
  for (const file of [...canonicalLoaded, ...retiredUnloaded]) {
    expect(architecture, `${file} should be documented`).toContain(`\`${file}\``);
  }
});
