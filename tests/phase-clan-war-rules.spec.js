// Source contract for the isolated clan-war rules foundation.
// Node-only, discovered by tests/source-contract-ratchet.js.
const assert = require('node:assert/strict');
const rules = require('../clan-war-rules.js');

assert.equal(rules.WAR_DAYS.length, 7);
assert.equal(rules.WAR_DAYS.slice(0, 6).reduce((sum, day) => sum + day.victoryPoints, 0), 13);
assert.equal(rules.VICTORY_TARGET, 7);
assert.equal(rules.ATTACK_TICKETS, 5);
assert.equal(rules.utcPreviewDay('2026-11-10T00:00:00Z'), 1); // Tuesday
assert.equal(rules.utcPreviewDay('2026-11-15T23:59:59Z'), 6); // Sunday
assert.equal(rules.utcPreviewDay('2026-11-16T00:00:00Z'), 7); // Monday
assert.equal(rules.utcPreviewDay('not-a-date'), null);

assert.equal(rules.canContribute(1, 'forge_item'), true);
assert.equal(rules.canContribute(2, 'forge_item'), false);
assert.equal(rules.canContribute(6, 'clan_attack'), true);
assert.equal(rules.canContribute(7, 'clan_attack'), false);
assert.equal(rules.canContribute(0, 'forge_item'), false);
assert.equal(rules.preWarMember('2026-11-09T23:59:59Z', '2026-11-10T00:00:00Z'), true);
assert.equal(rules.preWarMember('2026-11-10T00:00:00Z', '2026-11-10T00:00:00Z'), false);
assert.equal(rules.preWarMember('bad', '2026-11-10T00:00:00Z'), false);
assert.equal(rules.remainingTickets(0), 5);
assert.equal(rules.remainingTickets(5), 0);
assert.throws(() => rules.remainingTickets(6), RangeError);
assert.throws(() => rules.remainingTickets(-1), RangeError);

const homeWins = rules.summarizeDays([
  {day: 1, closed: true, homePoints: 3, awayPoints: 2},
  {day: 2, closed: true, homePoints: 5, awayPoints: 1},
  {day: 3, closed: true, homePoints: 5, awayPoints: 1},
  {day: 4, closed: true, homePoints: 5, awayPoints: 1}
]);
assert.equal(homeWins.homeVictoryPoints, 7);
assert.equal(homeWins.status, 'home');
const attackComeback = rules.summarizeDays([
  {day: 1, closed: true, homePoints: 0, awayPoints: 1},
  {day: 2, closed: true, homePoints: 0, awayPoints: 1},
  {day: 3, closed: true, homePoints: 0, awayPoints: 1},
  {day: 4, closed: true, homePoints: 1, awayPoints: 0},
  {day: 5, closed: true, homePoints: 1, awayPoints: 0},
  {day: 6, closed: true, homePoints: 9, awayPoints: 2}
]);
assert.equal(attackComeback.status, 'home');
assert.equal(attackComeback.homeVictoryPoints, 8);
assert.equal(attackComeback.awayVictoryPoints, 5);

const pending = rules.summarizeDays([{day: 1, closed: false}]);
assert.equal(pending.status, 'pending');
const tied = rules.summarizeDays(Array.from({length:6}, (_, i) => ({
  day: i + 1, closed: true, homePoints: 5, awayPoints: 5
})));
assert.equal(tied.status, 'tie');
assert.equal(tied.homeVictoryPoints, 0);
assert.throws(() => rules.summarizeDays([
  {day: 1, closed: true, homePoints: 3, awayPoints: 0},
  {day: 1, closed: true, homePoints: 1, awayPoints: 0}
]), RangeError);
assert.throws(() => rules.summarizeDays([{day: 1, closed: true, homePoints: -1, awayPoints: 0}]), RangeError);
assert.throws(() => rules.summarizeDays([{day: 1, closed: true, homePoints: 1.1, awayPoints: 0}]), RangeError);
assert.equal(Object.isFrozen(rules.WAR_DAYS), true);
assert.equal(Object.isFrozen(homeWins.details), true);
console.log('Clan-war pure rules: PASS');
