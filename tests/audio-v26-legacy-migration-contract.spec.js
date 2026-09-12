const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const audio = fs.readFileSync(path.join(root, 'audio-v26.js'), 'utf8');

function migrationSource() {
  const marker = '/* PE economy rebase v6:';
  const start = audio.indexOf(marker);
  if (start < 0) throw new Error('audio-v26 legacy migration marker missing');
  return audio.slice(start);
}

function runMigration(state, { raidMaxLevel = 50 } = {}) {
  const sandbox = {
    S: state,
    RULES: { RAID_MAX_LEVEL: raidMaxLevel },
    raidReward: (raid, level) => (raid === 'evolution' ? 10 + level : 7),
    update: (mutator) => mutator(state),
  };
  vm.runInNewContext(migrationSource(), sandbox, { filename: 'audio-v26-migration.js' });
  return { state, raidReward: sandbox.raidReward };
}

test('audio v26 legacy migration credits +40 PE per provable pre-v5 Evolution win exactly once', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Migration contract is engine-independent.');

  const state = {
    pe: 25,
    raids: { evolution: { stars: 0, level: 4, record: 2 } },
  };

  const first = runMigration(state);
  expect(first.state.pe).toBe(145);
  expect(first.state.economyRebaseV6).toBe(true);
  expect(first.state.economyRebaseNoticeV6).toEqual({
    evolutionWins: 3,
    peDelta: 120,
    excessRemoved: 0,
    bonusPerWin: 40,
  });

  const snapshot = JSON.stringify(first.state);
  runMigration(first.state);
  expect(JSON.stringify(first.state)).toBe(snapshot);
});

test('audio v26 legacy migration corrects v5 excess without creating negative PE or undoing purchases', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Migration contract is engine-independent.');

  const state = {
    pe: 60,
    economyRebaseV5: true,
    economyRebaseNoticeV5: { peCredited: 270 },
    raids: { evolution: { stars: 0, level: 4, record: 3 } },
  };

  const { state: migrated } = runMigration(state);
  expect(migrated.pe).toBe(0);
  expect(migrated.economyRebaseNoticeV6).toEqual({
    evolutionWins: 3,
    peDelta: -60,
    excessRemoved: 60,
    bonusPerWin: 40,
  });
});

test('audio v26 legacy migration preserves historical win reconstruction across completed stars', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Migration contract is engine-independent.');

  const state = {
    pe: 10,
    raids: { evolution: { stars: 2, level: 3, record: 50 } },
  };

  const { state: migrated } = runMigration(state, { raidMaxLevel: 50 });
  expect(migrated.economyRebaseNoticeV6.evolutionWins).toBe(102);
  expect(migrated.economyRebaseNoticeV6.peDelta).toBe(4080);
  expect(migrated.pe).toBe(4090);
});

test('audio v26 still contains distinct audio cadence and legacy migration responsibilities pending separation', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Source ownership is engine-independent.');

  expect(audio).toContain('setInterval(poll,50)');
  expect(audio).toContain('setInterval(musicTick,520)');
  expect(audio).toContain('economyRebaseV6');
  expect(audio).toContain('economyRebaseNoticeV6');
  expect(audio).toContain('raidReward = function raidRewardRebalanced');
});
