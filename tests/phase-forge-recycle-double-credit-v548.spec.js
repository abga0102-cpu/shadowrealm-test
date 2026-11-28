/* Non-destructive Forge recycle diagnostic for issue #476.
   Executes the real shipped native functions and V490 wrapper against a
   synthetic in-memory inventory. No game startup, storage, or player data.
   Intentionally fails while the +50% recycle-only contract is violated.
*/
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const game2 = fs.readFileSync(path.join(root, 'game-2.js'), 'utf8');
const game4 = fs.readFileSync(path.join(root, 'game-4.js'), 'utf8');
const wrapper = fs.readFileSync(path.join(root, 'forge-compare-v95.js'), 'utf8');

function extractFunction(source, name) {
  const re = new RegExp('^function ' + name + '\\([^\\n]*\\) \\{[\\s\\S]*?^\\}', 'm');
  const match = source.match(re);
  assert.ok(match, 'Production function not found: ' + name);
  return match[0];
}

const nativeFunctions = [
  extractFunction(game2, 'recycleItem'),
  extractFunction(game4, 'recycleBatch'),
  extractFunction(game4, 'recycleItemsByIds')
].join('\n');

const bootstrap = [
  'const window = {};',
  'const ACT = {};',
  'const S = { gold: 100, poussiere: 0, inventory: [] };',
  'function update(fn) { fn(S); }',
  'function dustValue() { return 5; }',
  'function recycleValue() { return 5; }',
  'function forgeGoldRewardV470() { return 10; }',
  'function forgeSummon() { return []; }',
  'function showForgeResult() {}',
  'function equipItem() {}'
].join('\n');

function simulate(mode, item) {
  const call = mode === 'batch' ? 'recycleBatch("COMMUN")' :
    mode === 'ids' ? 'recycleItemsByIds(["item"])' : 'recycleItem("item")';
  const code = bootstrap + '\n' + nativeFunctions + '\n' + wrapper + '\n' +
    'S.inventory = [' + JSON.stringify(item) + '];\n' +
    'const returned = ' + call + ';\n' +
    'globalThis.__result = { goldDelta: S.gold - 100, dust: S.poussiere, ' +
    'remaining: S.inventory.length, returned };';
  const sandbox = {};
  vm.runInNewContext(code, sandbox, { timeout: 3000 });
  return JSON.parse(JSON.stringify(sandbox.__result));
}

const regular = { id: 'item', slot: 'WEAPON', rarity: 'COMMUN', srForgeRecycleGoldV547: 10 };
const free = { ...regular, freeForgeBonus: true, srForgeRecycleGoldV547: 0 };
const legacy = { id: 'item', slot: 'WEAPON', rarity: 'COMMUN' };
const observations = [
  { name: 'single', result: simulate('single', regular) },
  { name: 'batch', result: simulate('batch', regular) },
  { name: 'ids', result: simulate('ids', regular) },
  { name: 'free', result: simulate('single', free) },
  { name: 'legacy', result: simulate('single', legacy) }
];
console.log('Synthetic Forge recycle observations:', JSON.stringify(observations));
for (const { name, result } of observations) {
  assert.equal(result.remaining, 0, name + ': inventory should be consumed');
  assert.equal(result.dust, 5, name + ': dust should be credited once');
}
assert.equal(observations[3].result.goldDelta, 0, 'Free bonus must never pay Forge Gold');
// Legacy payout is recorded but not asserted: the historical contract requires
// owner review before changing any legacy-save economic behavior.
for (const { name, result } of observations.slice(0, 3)) {
  assert.equal(result.goldDelta, 15,
    name + ': expected 150% of 10 Gold once, not native V547 + wrapper V490');
}
