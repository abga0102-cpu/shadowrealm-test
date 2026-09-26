/* SHADOWREACH V449 / V457 · Early Campaign rebalance authority
   Requested balance window, applied LAST after the existing Campaign authorities.

   Visible Campaign mapping: 20 stages per chapter.
   - Facile 1-2 .. Facile 5-4  => HP -40%, damage +60%.
   - Next 15 stages (5-5 .. 5-19) => HP -30% only.
   - Everything else unchanged.

   Progression invariant: outside the intentional post-Boss reset, the canonical
   adjusted HP and damage baselines are not allowed to go backwards. Boss cadence
   is every 5 stages; a stage immediately following a Boss may be easier.
   Raids and Mega-Bosses are not modified here. */
(function(){
'use strict';
if(window.__srCampaignEarlyRebalanceV449)return;
window.__srCampaignEarlyRebalanceV449=true;

var FIRST=2, FIRST_END=84, SECOND_START=85, SECOND_END=99, BOSS_EVERY=5;
function multipliers(f){
  f=Math.max(1,Math.floor(Number(f)||1));
  if(f>=FIRST&&f<=FIRST_END)return {hp:0.60,dmg:1.60,band:1};
  if(f>=SECOND_START&&f<=SECOND_END)return {hp:0.70,dmg:1.00,band:2};
  return {hp:1,dmg:1,band:0};
}
function isBossFloor(f){return Math.max(1,Math.floor(Number(f)||1))%BOSS_EVERY===0;}
function postBoss(f){return f>1&&isBossFloor(f-1);}

/* Final-spawn authority. This intentionally sits after V288/V289/V333/V362 so
   the percentages are relative to the balance the player actually had before
   V449, rather than resurrecting an obsolete source curve. */
try{
  if(typeof makeEnemy==='function'&&!makeEnemy.__srCampaignEarlyRebalanceV449){
    var previousMakeEnemy=makeEnemy;
    makeEnemy=function(mode,opts){
      var enemy=previousMakeEnemy(mode,opts);
      if(mode!=='campaign'||!opts||!enemy||opts.megaBoss)return enemy;
      var f=Math.max(1,Math.floor(Number(opts.floor)||1)),m=multipliers(f);
      if(!m.band)return enemy;
      var beforeHP=Math.max(1,Number(enemy.maxHP||enemy.hp||1));
      var beforeDmg=Math.max(1,Number(enemy.dmg||1));
      enemy.maxHP=Math.max(1,Math.floor(beforeHP*m.hp));
      enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(Number(enemy.hp||beforeHP)*m.hp)));
      enemy.dmg=Math.max(1,Math.floor(beforeDmg*m.dmg));
      enemy.__srCampaignEarlyRebalanceV449={floor:f,hpMul:m.hp,dmgMul:m.dmg,band:m.band};
      return enemy;
    };
    makeEnemy.__srCampaignEarlyRebalanceV449=true;
  }
}catch(_){}

window.__srCampaignEarlyRebalanceConfigV449={
  version:457,first:{from:2,to:84,visible:'Facile 1-2 → Facile 5-4',hpMul:.60,damageMul:1.60},
  second:{from:85,to:99,visible:'15 étages suivants (Facile 5-5 → Facile 5-19)',hpMul:.70,damageMul:1},
  multipliers:multipliers,isBossFloor:isBossFloor,postBossException:postBoss,
  invariant:'no-higher-stage-easier-except-stage-after-boss',raidsChanged:false,megaBossChanged:false
};
})();
