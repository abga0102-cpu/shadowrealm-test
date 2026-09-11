const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const INDEX = read('index.html');

// Capture both literal <script src="..."> loads and deferred loader entries such as
// ['home-layout-authority-v219.js', ...]. This keeps the guard aligned with the
// actual runtime loader instead of assuming everything is a static script tag.
const referencedScripts = [...INDEX.matchAll(/["']([A-Za-z0-9._-]+\.js)(?:\?[^"']*)?["']/g)]
  .map((m) => m[1]);
const countReferenced = (name) => referencedScripts.filter((s) => s === name).length;

const retiredUnloaded = [
  'social-forge-layout-v1.js',
  'premium-recommendation-cleanup-v243.js',
  'bottom-nav-v53.js',
  'home-layout-fix-v119.js',
  'accomplishments-titles-v133.js',
  'accomplishments-overview-v135.js',
  'accomplishments-home-scope-v136.js',
  'accomplishments-floors-v137.js',
  'accomplishments-ui-v123.js',
  'accomplishments-floor-comp-v141.js',
  'tree-mastery-v120.js',
  'tree-mastery-ui-v128.js',
  'tree-mastery-v149.js',
];

const canonicalReferencedOnce = [
  'bottom-nav-layout-v183.js',
  'premium-ui-v209.js',
  'home-layout-authority-v219.js',
  'combat-consolidated-v156.js',
  'combat-polish-v157.js',
  'combat-animation-v169.js',
  'combat-progression-authority-v285.js',
  'import-save-guard-v207.js',
  'progression-overhaul-v283.js',
  'game-balance-v224.js',
  'runtime-tree-stability-v216.js',
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
  expect(architecture).toContain('LEAN_CODE_PLAN.md');
});

test('retired ownership layers stay absent from all runtime loader paths', () => {
  for (const file of retiredUnloaded) {
    expect(countReferenced(file), `${file} must remain absent from index.html loaders`).toBe(0);
  }
});

test('canonical ownership layers are referenced exactly once by the runtime loader', () => {
  for (const file of canonicalReferencedOnce) {
    expect(countReferenced(file), `${file} must be referenced exactly once`).toBe(1);
  }
});

test('BottomNav uses one canonical runtime owner while keeping premium polish separate', () => {
  const bottomNav = read('bottom-nav-layout-v183.js');
  const premium = read('premium-ui-v209.js');

  expect(bottomNav).toContain('__srBottomNavPhase2A');
  expect(bottomNav).toContain('__srDecorateBottomNavPhase2A');
  expect(bottomNav).toContain('fantasyNavStyleV65');
  expect(bottomNav).toContain('__srBottomNavGeometryV209');
  expect(bottomNav).toContain('__srApplyBottomNavGeometryV209');
  expect(bottomNav).toContain('window.renderTabs=function');
  expect(bottomNav).toContain("new Event('sr:bottomnavrendered')");
  expect(premium).toContain('__srPremiumUiV209');
  expect(premium).not.toContain('__srApplyBottomNavGeometryV209');
});

test('Home geometry, lifecycle and compatibility use one canonical runtime owner', () => {
  const home = read('home-layout-authority-v219.js');
  expect(home).toContain('__srHomeLayoutAuthorityV219');
  expect(home).toContain('__srHomeLayoutCompatV119');
  expect(home).toContain('__srApplyHomeCompatV119');
  expect(home).toContain('equipFiltersCompat');
  expect(home).toContain('settingsStatGridCompat');
  expect(home).toContain("aria-label','Informations sur les raretés");
  expect(home).toContain("addEventListener('sr:bottomnavrendered',schedule)");
  expect(home).not.toMatch(/renderTabs\s*=|function\s+renderTabs\b/);
});

test('known duplicate ownership mechanisms do not return', () => {
  const v138 = read('accomplishments-stability-v138.js');
  const v127 = read('accomplishments-reward-fix-v127.js');
  const home = read('home-layout-authority-v219.js');
  const v125 = read('sanctuary-pricing-v125.js');

  expect(v138).not.toMatch(/new\s+MutationObserver\s*\(/);
  expect(v138).not.toMatch(/renderTabs\s*=|function\s+renderTabs\b/);
  expect(v138).toContain("addEventListener('sr:bottomnavrendered',schedulePlace)");
  expect(v127).not.toMatch(/setInterval\s*\([^,]+,\s*500\s*\)/s);
  expect(home).not.toMatch(/renderTabs\s*=|function\s+renderTabs\b/);
  expect(v125).not.toContain('IMPORT_GUARD_V206');
});

test('ownership-sensitive files are represented in the architecture map', () => {
  const architecture = read('ARCHITECTURE.md');
  for (const file of [...canonicalReferencedOnce, ...retiredUnloaded]) {
    expect(architecture, `${file} should be documented`).toContain(`\`${file}\``);
  }
});
