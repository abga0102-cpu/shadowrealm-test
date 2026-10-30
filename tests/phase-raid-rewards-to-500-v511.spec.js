/* V511: final Raid reward authority must scale three approved resources to 500. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'raid-reward-authority-v396.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const game = fs.readFileSync(path.join(root, 'game-1.js'), 'utf8');
const context = {window:{}, raidReward:()=>0, raidCampaignReady:()=>false};
vm.runInNewContext(source, context, {filename:'raid-reward-authority-v396.js', timeout:3000});
assert.equal(context.raidReward.__srFinalAuthorityV396, true);
assert.match(game, /RAID_MAX_LEVEL:\s*500/);
assert.match(html, /raid-reward-authority-v396\.js\?v=2026\.10\.30\.511/);
assert.equal((html.match(/<script[^>]+raid-reward-authority-v396\.js/g)||[]).length,1);
const expected = {
  minerai: [[1,1000],[70,2845],[71,2850],[500,4995],[501,4995]],
  familier: [[1,225],[70,393],[71,395],[500,1253],[501,1253]],
  evolution: [[1,150],[70,560],[71,565],[500,2710],[501,2710]],
  competence: [[70,990],[71,1000],[500,5290]],
  or: [[70,344021],[71,361223],[500,444615714448201]]
};
for (const [type, entries] of Object.entries(expected)) {
  for (const [level, amount] of entries)
    assert.equal(context.raidReward(type, level), amount, type+' at level '+level);
}
assert.ok(html.includes('PAUSED_SANCTUARY'), 'Sanctuary pause must remain in place');
console.log('V511 Raid rewards: legacy values preserved, approved 71-500 scaling verified.');
