/* Regression: Raid cap text must follow the actual 500-level rule, not legacy 70. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const core = read('game-1.js');
const cards = read('game-4.js');
const result = read('game-5.js');
const index = read('index.html');
const max = core.match(/RAID_MAX_LEVEL:\s*(\d+)/);
const chapter = core.match(/const RAID_LEVELS_PER_CHAPTER\s*=\s*(\d+)/);
const labelFn = core.match(/^function raidLevelLabel\(level\) \{[\s\S]*?^\}/m);
assert.ok(max && chapter && labelFn, 'canonical Raid cap and label function must exist');
const cap = Number(max[1]);
const label = vm.runInNewContext(
  'const RULES={RAID_MAX_LEVEL:' + cap + '};const RAID_LEVELS_PER_CHAPTER=' +
  Number(chapter[1]) + ';' + labelFn[0] + ';raidLevelLabel(RULES.RAID_MAX_LEVEL)'
);
assert.equal(cap, 500, 'expected current approved Raid cap');
assert.equal(label, '50-10', '500 levels must display as 50-10');
assert.equal((cards.match(/raidLevelLabel\(RULES\.RAID_MAX_LEVEL\)/g) || []).length, 3,
  'Raid card tooltip, max notice and screen heading must use canonical cap label');
assert.equal((result.match(/raidLevelLabel\(RULES\.RAID_MAX_LEVEL\)/g) || []).length, 1,
  'Raid result must use canonical cap label');
assert.doesNotMatch(cards, /7-10/, 'Raid cards must not display legacy 70-level cap');
assert.doesNotMatch(result, /7-10/, 'Raid result must not display legacy 70-level cap');
assert.match(index, /game-4\.js\?v=2026\.10\.30\.510-raid-cap-label/);
assert.match(index, /game-5\.js\?v=2026\.10\.30\.510-raid-cap-label-sanctuary-pause/);
assert.ok(index.includes('PAUSED_SANCTUARY'), 'Sanctuary pause must remain visible');
console.log('Raid cap UX source regression passed: ' + cap + ' = ' + label);
