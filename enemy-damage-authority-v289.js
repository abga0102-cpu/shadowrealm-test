/* SHADOWREACH V289 · Enemy damage authority
   V322 extension: survivability curve through the canonical 800-stage campaign.
   The validated former 1..400 curve is stretched semantically over 1..800 so
   endpoint strength and difficulty power bands remain unchanged. Floor-based
   only: no player-power scaling. Bosses keep V288's multiplier path; Mega
   Bosses still multiply the resulting normal boss damage by x10. */
(function(){
  'use strict';
  if(window.__srEnemyDamageV289)return;
  window.__srEnemyDamageV289=true;

  var LEGACY_MAX=400;
  var DAMAGE={
    1:2,10:50,20:300,30:1500,40:2000,50:50000,60:300000,70:1500000,
    80:6000000,90:10000000,100:15000000,110:20000000,120:26000000,
    130:32000000,140:38000000,150:38000000,200:90000000,
    250:210000000,300:480000000,350:1050000000,400:2300000000
  };

  function maxFloor(){
    try{return Math.max(1,Number(window.__srCampaignMaxFloor)||800);}catch(_){return 800;}
  }
  function clampFloor(f){return Math.max(1,Math.min(maxFloor(),Number(f)||1));}
  function semanticLegacyFloor(f){
    var max=maxFloor();f=clampFloor(f);
    return 1+(f-1)*(LEGACY_MAX-1)/(max-1);
  }
  function logInterp(table,f){
    var keys=Object.keys(table).map(Number).sort(function(a,b){return a-b;});
    if(f<=keys[0])return table[keys[0]];
    for(var i=1;i<keys.length;i++){
      if(f<=keys[i]){
        var a=keys[i-1],b=keys[i],t=(f-a)/(b-a);
        return Math.max(1,Math.round(Math.exp(Math.log(table[a])+(Math.log(table[b])-Math.log(table[a]))*t)));
      }
    }
    return table[keys[keys.length-1]];
  }

  /* Mirror the approved early-HP resistance with a gentle normal-enemy damage
     lift. It ramps from +8% at 1-1 to +10% at 2-9, then returns to the untouched
     damage curve at 2-10. The 2-9 result is capped below 2-10 so progression
     never becomes harder just before the hand-off. Bosses use baseEnemyDamage
     through V288 and therefore keep their existing damage targets. */
  var EARLY_DAMAGE_END_FLOOR=29;
  var EARLY_DAMAGE_START_MUL=1.08;
  var EARLY_DAMAGE_END_MUL=1.10;
  function earlyDamageMul(f){
    f=clampFloor(f);
    if(f>EARLY_DAMAGE_END_FLOOR)return 1;
    var t=(f-1)/Math.max(1,EARLY_DAMAGE_END_FLOOR-1);
    return EARLY_DAMAGE_START_MUL+(EARLY_DAMAGE_END_MUL-EARLY_DAMAGE_START_MUL)*t;
  }
  function baseEnemyDamage(f){return logInterp(DAMAGE,semanticLegacyFloor(f));}
  function earlyEnemyDamage(f){
    f=clampFloor(f);
    var base=baseEnemyDamage(f);
    if(f>EARLY_DAMAGE_END_FLOOR)return base;
    var boosted=Math.max(1,Math.round(base*earlyDamageMul(f)));
    if(f===EARLY_DAMAGE_END_FLOOR){
      boosted=Math.min(boosted,Math.max(base,baseEnemyDamage(f+1)-1));
    }
    return boosted;
  }

  window.__srV289EnemyDamage=earlyEnemyDamage;
  try{if(typeof enemyDamage==='function')enemyDamage=window.__srV289EnemyDamage;}catch(_){ }

  window.__srEnemyDamageConfigV289={
    anchors:DAMAGE,maxFloor:800,legacyMaxFloor:400,semanticLegacyFloor:semanticLegacyFloor,
    baseDamage:baseEnemyDamage,
    earlyResistance:{
      endFloor:EARLY_DAMAGE_END_FLOOR,endStage:'2-9',
      startMul:EARLY_DAMAGE_START_MUL,endMul:EARLY_DAMAGE_END_MUL,multiplier:earlyDamageMul
    },
    expectedGates:{
      weak:'69-89',normal:'99-119',max0:'139-159',ascended:'199-299+',
      nightmare:'301-400',infernal:'401-500',abyssal:'501-600',immortal:'601-700',divine:'701-800'
    }
  };
})();