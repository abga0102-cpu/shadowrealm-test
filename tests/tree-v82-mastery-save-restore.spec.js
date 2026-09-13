const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const v82 = fs.readFileSync(path.join(root, 'personal-tree-radial-v82.js'), 'utf8');
const v83 = fs.readFileSync(path.join(root, 'tree-safety-v83.js'), 'utf8');

function restorationSource() {
  const start = v82.indexOf('function restoreMasteryProgress(){');
  const endMarker = '  restoreMasteryProgress();';
  const end = v82.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error('V82 mastery restoration owner missing');
  return v82.slice(start, end + endMarker.length);
}

function runRestoration(state, rawSave, knownIds) {
  const treeById = {};
  knownIds.forEach((id) => { treeById[id] = { id }; });
  const sandbox = {
    S: state,
    TREE_BY_ID: treeById,
    localStorage: {
      getItem(key) {
        if (key !== 'shadowreach.save.local') throw new Error(`unexpected storage key ${key}`);
        return JSON.stringify(rawSave);
      },
    },
    console: { warn() {} },
  };
  vm.runInNewContext(restorationSource(), sandbox, { filename: 'tree-v82-mastery-restore.js' });
  return state;
}

const masteryIds = ['mk_familier','mk_or','mk_minerai','mk_pe','mk_competence'];

test('V82 restores completed mastery keys from the raw legacy save without rewriting unrelated state', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Save restoration contract is engine-independent.');

  const state = {
    tree: { levels: { n1_01: 2 }, active: null, activeLevel: 0, activeEnd: 0 },
    gold: 777,
    raidKeyAlloc: { minerai: 4 },
  };
  const raw = {
    tree: {
      levels: { mk_familier: 1, mk_or: 8, mk_unknown: 1 },
      active: null,
      activeEnd: 0,
    },
    gold: 999999,
  };

  runRestoration(state, raw, masteryIds);
  expect(state.tree.levels.n1_01).toBe(2);
  expect(state.tree.levels.mk_familier).toBe(1);
  expect(state.tree.levels.mk_or).toBe(1);
  expect(state.tree.levels.mk_unknown).toBeUndefined();
  expect(state.gold).toBe(777);
  expect(state.raidKeyAlloc).toEqual({ minerai: 4 });
});

test('V82 restores an in-progress mastery-key research only when the migrated state has no active research', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Save restoration contract is engine-independent.');

  const state = { tree: { levels: {}, active: null, activeLevel: 0, activeEnd: 0 } };
  const raw = { tree: { levels: {}, active: 'mk_pe', activeEnd: 123456789 } };
  runRestoration(state, raw, masteryIds);
  expect(state.tree.active).toBe('mk_pe');
  expect(state.tree.activeLevel).toBe(1);
  expect(state.tree.activeEnd).toBe(123456789);

  const occupied = { tree: { levels: {}, active: 'n1_01', activeLevel: 3, activeEnd: 987 } };
  runRestoration(occupied, raw, masteryIds);
  expect(occupied.tree.active).toBe('n1_01');
  expect(occupied.tree.activeLevel).toBe(3);
  expect(occupied.tree.activeEnd).toBe(987);
});

test('V82 owns legacy mastery restoration while V83 remains audit-only', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Ownership contract is engine-independent.');

  expect(v82).toContain("localStorage.getItem('shadowreach.save.local')");
  expect(v82).toContain('function restoreMasteryProgress(){');
  expect(v83).not.toContain('restoreMasteryProgress');
  expect(v83).not.toContain('localStorage.getItem');
  expect(v83).toContain('window.__srTreeAudit = function(){');
});
