const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const audio = fs.readFileSync(path.join(root, 'audio-v26.js'), 'utf8');

function audioRuntimeSource() {
  const migrationMarker = '/* PE economy rebase v6 migration only.';
  const end = audio.indexOf(migrationMarker);
  if (end < 0) throw new Error('audio-v26 legacy migration marker missing');

  return audio.slice(0, end)
    .replace(
      "function sfx(kind,p=1){ if(!ready)return;",
      "function sfx(kind,p=1){ __events.push(['sfx',kind]); return;"
    )
    .replace(
      "function skill(k){ if(!ready)return;",
      "function skill(k){ __events.push(['skill',k||'impact']); return;"
    )
    .replace('setInterval(poll,50);', 'window.__audioPollV26 = poll;');
}

function makeHarness() {
  const events = [];
  const sandbox = {
    __events: events,
    combat: {
      status: 'fight',
      heroAttacking: 0,
      skillFxs: [],
      enemies: [{ id: 'enemy-1', attacking: 0, ranged: false }],
    },
    D: { weapon: 'epee' },
    WEAPON_TYPES: { epee: { attackType: 'MELEE' } },
    document: {
      addEventListener() {},
    },
    setInterval() { throw new Error('unexpected interval registration in observation harness'); },
    setTimeout() { return 0; },
    clearInterval() {},
    console,
  };
  sandbox.window = sandbox;

  vm.runInNewContext(audioRuntimeSource(), sandbox, { filename: 'audio-v26-observation.js' });
  if (typeof sandbox.__audioPollV26 !== 'function') throw new Error('audio-v26 poll capture failed');

  return {
    sandbox,
    events,
    poll: () => sandbox.__audioPollV26(),
    clearEvents: () => { events.length = 0; },
  };
}

test('audio v26 observation is edge-triggered for hero and enemy attacks', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Observation contract is engine-independent.');

  const h = makeHarness();
  h.poll();
  expect(h.events).toEqual([]);

  h.sandbox.combat.heroAttacking = 0.2;
  h.poll();
  expect(h.events).toEqual([['sfx', 'swing']]);

  h.clearEvents();
  h.poll();
  expect(h.events).toEqual([]);

  h.sandbox.combat.heroAttacking = 0;
  h.poll();
  h.sandbox.combat.heroAttacking = 0.2;
  h.poll();
  expect(h.events).toEqual([['sfx', 'swing']]);

  h.clearEvents();
  h.sandbox.combat.enemies[0].attacking = 0.2;
  h.poll();
  expect(h.events).toEqual([['sfx', 'enemySwing']]);

  h.clearEvents();
  h.poll();
  expect(h.events).toEqual([]);
});

test('audio v26 observation emits each skill effect once per active skill id', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Observation contract is engine-independent.');

  const h = makeHarness();
  h.poll();

  h.sandbox.combat.skillFxs = [{ id: 'meteor-1', max: 1, life: 1, fx: 'meteor' }];
  h.poll();
  expect(h.events).toEqual([['skill', 'meteor']]);

  h.clearEvents();
  h.sandbox.combat.skillFxs = [{ id: 'meteor-1', max: 1, life: 0.7, fx: 'meteor' }];
  h.poll();
  expect(h.events).toEqual([]);

  h.sandbox.combat.skillFxs = [];
  h.poll();
  h.sandbox.combat.skillFxs = [{ id: 'meteor-1', max: 1, life: 1, fx: 'meteor' }];
  h.poll();
  expect(h.events).toEqual([['skill', 'meteor']]);
});

test('audio v26 observation emits combat result transitions and resets edge state when combat disappears', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Observation contract is engine-independent.');

  const h = makeHarness();
  h.poll();

  h.sandbox.combat.status = 'won';
  h.poll();
  expect(h.events).toEqual([['sfx', 'victory']]);

  h.clearEvents();
  h.sandbox.combat = null;
  h.poll();
  expect(h.events).toEqual([]);

  h.sandbox.combat = {
    status: 'fight',
    heroAttacking: 0.2,
    skillFxs: [],
    enemies: [{ id: 'enemy-1', attacking: 0.2, ranged: true }],
  };
  h.poll();
  expect(h.events).toEqual([
    ['sfx', 'swing'],
    ['sfx', 'enemyShot'],
  ]);
});
