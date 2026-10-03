/* SHADOWREACH V449 / V465 / V483 / V493 · Early Campaign rebalance authority
   Requested balance windows, applied LAST after the existing Campaign authorities.

   Visible Campaign mapping: 20 stages per chapter.
   - Facile 1-2 .. Facile 5-4  => HP -40%, damage +60%.
   - Next 15 stages (5-5 .. 5-19) => HP -30% and target damage -30%.
   - 5-5 is continuity-protected at -15% damage because a full -30% there would
     make that Boss hit softer than the 5-4 Elite. From 5-6 through 5-19 the
     full -30% damage multiplier applies.
   - V483 adds +30% damage RELATIVE TO THE CURRENT FINAL DAMAGE from Facile 1-3
     through Facile 3-1 (floors 3..41). This is deliberately applied after the
     existing V465 x1.60 damage pass, so it compounds to x2.08 versus the
     pre-V449 source rather than incorrectly replacing x1.60 with x1.90.
   - Floors 42..44 use a short continuity taper only, preventing Facile 3-2 from
     becoming weaker than boosted Facile 3-1. Facile 3-5 returns to the existing curve.
   - V493: from Facile 3-16 (floor 56), the first two floors after every Boss are
     anchored to the two floors immediately before that Boss at +10%. The third
     post-Boss floor may resume the normal curve but is capped at +15% versus the
     second breathing floor, preventing a sudden rebound spike.
   - Everything else unchanged.

   Progression invariant: outside the intentional post-Boss breathing window, the
   canonical adjusted HP and damage baselines are not allowed to go backwards.
   Raids and Mega-Bosses are not modified here. */
(function(){
'use strict';
if(window.__srCampaignEarlyRebalanceV449)return;
window.__srCampaignEarlyRebalanceV449=true;

var FIRST=2, FIRST_END=84, SECOND_START=85, SECOND_END=99, BOSS_EVERY=5;
var SECOND_DAMAGE_MUL=0.70;
var CURRENT_DAMAGE_BOOST_START=3, CURRENT_DAMAGE_BOOST_END=41, CURRENT_DAMAGE_BOOST_MUL=1.30;
var CURRENT_DAMAGE_EXIT_GUARD={42:1.21,43:1.14,44:1.07};
var BREATHING_START=56, BREATHING_REFERENCE_MUL=1.10, BREATHING_EXIT_MAX_MUL=1.15;
function currentDamageBoostMultiplier(f){
  f=Math.max(1,Math.floor(Number(f)||1));
  if(f>=CURRENT_DAMAGE_BOOST_START&&f<=CURRENT_DAMAGE_BOOST_END)return CURRENT_DAMAGE_BOOST_MUL;
  return CURRENT_DAMAGE_EXIT_GUARD[f]||1;
}
function applyCurrentDamageBoost(currentDamage,f,excluded){
  currentDamage=Math.max(1,Math.floor(Number(currentDamage)||1));
  if(excluded)return currentDamage;
  var mul=currentDamageBoostMultiplier(f);
  return mul===1?currentDamage:Math.max(1,Math.floor(currentDamage*mul));
}
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
function postBossOffset(f){
  f=Math.max(1,Math.floor(Number(f)||1));
  if(f<BREATHING_START)return 0;
  var r=f%BOSS_EVERY;
  return r>=1&&r<=3?r:0;
}
function stageKindFlags(f){
  var r=Math.max(1,Math.floor(Number(f)||1))%BOSS_EVERY;
  return {boss:r===0,elite:r===4};
}
function applyLegacyBalance(enemy,f,opts){
  if(!enemy)return enemy;
  var m=multipliers(f);
  if(!m.band)return enemy;
  var beforeHP=Math.max(1,Number(enemy.maxHP||enemy.hp||1));
  var beforeDmg=Math.max(1,Number(enemy.dmg||1));
  enemy.maxHP=Math.max(1,Math.floor(beforeHP*m.hp));
  enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(Number(enemy.hp||beforeHP)*m.hp)));
  enemy.dmg=Math.max(1,Math.floor(beforeDmg*m.dmg));
  enemy.dmg=applyCurrentDamageBoost(enemy.dmg,f,!!(opts&&opts.noFastback));
  enemy.__srCampaignEarlyRebalanceV449={floor:f,hpMul:m.hp,dmgMul:m.dmg,band:m.band};
  return enemy;
}
function referenceEnemy(previousMakeEnemy,opts,f){
  var ropts=Object.assign({},opts||{}, {floor:f});
  var flags=stageKindFlags(f);
  ropts.boss=flags.boss;
  ropts.elite=flags.elite;
  /* Reference-only spawns must not advance the live combat RNG stream. V493
     originally called makeEnemy extra times with the global Math.random, which
     changed later encounters and could make the historical floor-110 combat
     fail. A fixed local random source keeps reference construction deterministic
     while leaving the real encounter sequence untouched. */
  var realRandom=Math.random,ref=null;
  try{
    Math.random=function(){return 0.5;};
    ref=previousMakeEnemy('campaign',ropts);
  }finally{
    Math.random=realRandom;
  }
  return applyLegacyBalance(ref,f,ropts);
}
function capEnemyTo(enemy,targetHP,targetDmg,meta){
  if(!enemy)return enemy;
  targetHP=Math.max(1,Math.floor(Number(targetHP)||1));
  targetDmg=Math.max(1,Math.floor(Number(targetDmg)||1));
  enemy.maxHP=Math.min(Math.max(1,Math.floor(Number(enemy.maxHP||enemy.hp||1))),targetHP);
  enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(Number(enemy.hp||enemy.maxHP||1))));
  enemy.dmg=Math.min(Math.max(1,Math.floor(Number(enemy.dmg||1))),targetDmg);
  enemy.__srPostBossBreathingV493=meta;
  return enemy;
}

try{
  if(typeof makeEnemy==='function'&&!makeEnemy.__srCampaignEarlyRebalanceV449){
    var previousMakeEnemy=makeEnemy;
    makeEnemy=function(mode,opts){
      var enemy=previousMakeEnemy(mode,opts);
      if(mode!=='campaign'||!opts||!enemy||opts.megaBoss)return enemy;
      var f=Math.max(1,Math.floor(Number(opts.floor)||1));
      enemy=applyLegacyBalance(enemy,f,opts);

      var offset=postBossOffset(f);
      if(!offset)return enemy;
      var bossFloor=f-offset;
      if(offset===1||offset===2){
        var refFloor=bossFloor-3+offset; /* B-2 for B+1; B-1 for B+2 */
        var ref=referenceEnemy(previousMakeEnemy,opts,refFloor);
        if(!ref)return enemy;
        return capEnemyTo(
          enemy,
          Number(ref.maxHP||ref.hp||1)*BREATHING_REFERENCE_MUL,
          Number(ref.dmg||1)*BREATHING_REFERENCE_MUL,
          {floor:f,bossFloor:bossFloor,offset:offset,referenceFloor:refFloor,referenceMul:BREATHING_REFERENCE_MUL}
        );
      }

      var secondRef=referenceEnemy(previousMakeEnemy,opts,bossFloor-1);
      if(!secondRef)return enemy;
      var secondHP=Number(secondRef.maxHP||secondRef.hp||1)*BREATHING_REFERENCE_MUL;
      var secondDmg=Number(secondRef.dmg||1)*BREATHING_REFERENCE_MUL;
      return capEnemyTo(
        enemy,
        secondHP*BREATHING_EXIT_MAX_MUL,
        secondDmg*BREATHING_EXIT_MAX_MUL,
        {floor:f,bossFloor:bossFloor,offset:3,referenceFloor:bossFloor-1,referenceMul:BREATHING_REFERENCE_MUL,exitMaxMul:BREATHING_EXIT_MAX_MUL}
      );
    };
    makeEnemy.__srCampaignEarlyRebalanceV449=true;
  }
}catch(_){}

window.__srCampaignEarlyRebalanceConfigV449={
  version:493,first:{from:2,to:84,visible:'Facile 1-2 → Facile 5-4',hpMul:.60,damageMul:1.60},
  second:{from:85,to:99,visible:'15 étages suivants (Facile 5-5 → Facile 5-19)',hpMul:.70,damageMul:SECOND_DAMAGE_MUL,
    entryFloor:SECOND_START,entryDamageMul:SECOND_ENTRY_DAMAGE_MUL,fullDamageFrom:SECOND_START+1},
  currentDamageBoostV483:{
    from:CURRENT_DAMAGE_BOOST_START,to:CURRENT_DAMAGE_BOOST_END,
    visible:'Facile 1-3 → Facile 3-1',relativeToCurrentMul:CURRENT_DAMAGE_BOOST_MUL,
    exitContinuity:{from:42,to:44,multipliers:[1.21,1.14,1.07],returnsToCurrentAt:45},
    hpChanged:false,raidsChanged:false,megaBossChanged:false
  },
  postBossBreathingV493:{
    from:BREATHING_START,visibleFrom:'Facile 3-16',bossCadence:BOSS_EVERY,
    firstTwo:{reference:'two floors immediately before Boss',relativeMul:BREATHING_REFERENCE_MUL},
    third:{normalCurve:true,maxIncreaseVsSecond:BREATHING_EXIT_MAX_MUL},
    stats:['hp','damage'],bossChanged:false,raidsChanged:false,megaBossChanged:false,rngNeutralReferences:true
  },
  currentDamageBoostMultiplier:currentDamageBoostMultiplier,
  applyCurrentDamageBoost:applyCurrentDamageBoost,
  multipliers:multipliers,isBossFloor:isBossFloor,postBossException:postBoss,postBossOffset:postBossOffset,
  invariant:'post-boss B+1/B+2 anchored to B-2/B-1; B+3 capped at +15% vs B+2 target',raidsChanged:false,megaBossChanged:false
};
})();
