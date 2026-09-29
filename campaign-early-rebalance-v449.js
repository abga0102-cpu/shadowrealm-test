/* SHADOWREACH V449 / V465 · Early Campaign rebalance authority
   Requested balance window, applied LAST after the existing Campaign authorities.

   Visible Campaign mapping: 20 stages per chapter.
   - Facile 1-2 .. Facile 5-4  => HP -40%, damage +60%.
   - Next 15 stages (5-5 .. 5-19) => HP -30% and target damage -30%.
   - 5-5 is continuity-protected at -15% damage because a full -30% there would
     make that Boss hit softer than the 5-4 Elite. From 5-6 through 5-19 the
     full -30% damage multiplier applies.
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
var SECOND_DAMAGE_MUL=0.70;
/* V465 continuity guard: the previous stage (5-4) is an Elite still carrying
   the +60% early-pressure damage. A raw x0.70 on the 5-5 Boss would make the
   higher Boss weaker than that Elite. x0.85 is the smallest clean margin used
   here; the full x0.70 begins immediately after the Boss, where a drop is
   explicitly allowed by the progression rule. */
var SECOND_ENTRY_DAMAGE_MUL=0.85;
function multipliers(f){
  f=Math.max(1,Math.floor(Number(f)||1));
  if(f>=FIRST&&f<=FIRST_END)return {hp:0.60,dmg:1.60,band:1};
  if(f===SECOND_START)return {hp:0.70,dmg:SECOND_ENTRY_DAMAGE_MUL,band:2,continuityGuard:true};
  if(f>SECOND_START&&f<=SECOND_END)return {hp:0.70,dmg:SECOND_DAMAGE_MUL,band:2};
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
  version:465,first:{from:2,to:84,visible:'Facile 1-2 → Facile 5-4',hpMul:.60,damageMul:1.60},
  second:{from:85,to:99,visible:'15 étages suivants (Facile 5-5 → Facile 5-19)',hpMul:.70,damageMul:SECOND_DAMAGE_MUL,
    entryFloor:SECOND_START,entryDamageMul:SECOND_ENTRY_DAMAGE_MUL,fullDamageFrom:SECOND_START+1},
  multipliers:multipliers,isBossFloor:isBossFloor,postBossException:postBoss,
  invariant:'no-higher-stage-easier-except-stage-after-boss',raidsChanged:false,megaBossChanged:false
};
})();
