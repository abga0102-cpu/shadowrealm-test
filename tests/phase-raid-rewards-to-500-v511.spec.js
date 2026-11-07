/* Frozen pre-extension values come from the recorded main commit, not this PR. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const legacy = require('./fixtures/raid-rewards-through-70.json');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'raid-reward-authority-v396.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const game = fs.readFileSync(path.join(root, 'game-1.js'), 'utf8');
const state = {gold:123456,essence:789,raids:{familier:{level:70,record:69}}};
const before = JSON.stringify(state);
const context = {window:{},S:state,raidReward:()=>0,raidCampaignReady:()=>false,
  update:()=>assert.fail('Reward owner must not mutate saves'),
  localStorage:{setItem:()=>assert.fail('Reward owner must not write storage')}};
vm.runInNewContext(source, context, {filename:'raid-reward-authority-v396.js', timeout:3000});
assert.equal(JSON.stringify(state),before);
assert.equal(context.raidReward.__srFinalAuthorityV396,true);
assert.equal(context.window.__srRaidRewardConfigV396.reward,context.raidReward);
assert.equal(context.window.__srRaidRewardConfigV396.maxLevel,500);
assert.match(game,/RAID_MAX_LEVEL:\s*500/);
assert.match(html,/raid-reward-authority-v396\.js\?v=2026\.11\.05\.511/);
assert.equal((html.match(/<script[^>]+raid-reward-authority-v396\.js/g)||[]).length,1);
for(const [type,values] of Object.entries(legacy.rewards)) {
  if(type!=='or')values.forEach((amount,i)=>assert.equal(context.raidReward(type,i+1),amount,`${type}: legacy level ${i+1}`));
  for(let level=2;level<=500;level++) {
    const current=context.raidReward(type,level),previous=context.raidReward(type,level-1);
    assert.ok(Number.isSafeInteger(current),`${type}: safe integer at ${level}`);
    assert.ok(current>previous,`${type}: strictly increasing at ${level}`);
    if(type==='familier'&&level>70)assert.equal(current-previous,2);
    if(type==='or')assert.equal(current,Math.round(50+49950*(level-1)/499));
  }
  for(const level of [501,1000,Infinity])assert.equal(context.raidReward(type,level),context.raidReward(type,500));
  for(const level of [0,-1,NaN,undefined])assert.equal(context.raidReward(type,level),type==='or'?50:values[0]);
}
const expected={
  minerai:[[69,2840],[70,2845],[71,2862],[100,3344],[200,5008],[300,6672],[400,8336],[500,10000]],
  evolution:[[69,555],[70,560],[71,562],[100,626],[200,844],[300,1063],[400,1281],[500,1500]],
  competence:[[69,980],[70,990],[71,998],[100,1235],[200,2051],[300,2867],[400,3684],[500,4500]],
  familier:[[69,391],[70,393],[71,395],[100,453],[200,653],[300,853],[400,1053],[500,1253]]
};
for(const [type,rows] of Object.entries(expected))for(const [level,amount] of rows)
  assert.equal(context.raidReward(type,level),amount,`${type}: level ${level}`);
assert.equal(context.raidReward('unknown',500),0);
assert.ok(html.includes('PAUSED_SANCTUARY'));
assert.equal(context.raidReward('or',1),50);
assert.equal(context.raidReward('or',500),50000);
console.log('Raid rewards: non-Gold legacy values preserved; approved linear Gold 50–50000, levels 1–500 increasing, caps and no save writes verified.');
