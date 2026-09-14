/* SHADOWREACH V289 · Campaign enemy balance authority
   V323 extension: normal/elite durability and enemy damage now share one
   floor-only reference model across the canonical 800-stage campaign.

   Design rule:
   - A normally equipped, reasonably upgraded player is the reference, not the
     naked character and never the live player's current stats.
   - A normal enemy targets roughly 3.6 basic hits from that reference build.
   - Enemy damage targets roughly 1/8 of the reference build's HP per landed hit.
   - Better gear can still produce 1-2 hit kills; under-geared/naked builds take
     materially longer and receive materially more pressure.
   - Boss HP remains owned by V285/V288; boss damage still consumes this floor
     damage curve, and Mega Boss keeps its existing x10 path.

   The model intentionally never reads D, S.power or current equipment, so
   improving gear always creates real advantage instead of hidden rubber-band
   scaling. */
(function(){
  'use strict';
  if(window.__srEnemyDamageV289)return;
  window.__srEnemyDamageV289=true;
  window.__srCampaignReferenceBalanceV323=true;

  var LEGACY_MAX=400;
  var TARGET_HITS_TO_KILL=3.6;
  var TARGET_HITS_TO_DEFEAT_REFERENCE=8;

  /* Reference basic-attack damage for a player who is correctly geared and has
     made a reasonable amount of equipment upgrades for that world depth.
     These are progression expectations, not live-player samples. */
  var REFERENCE_DAMAGE={
    1:12,10:140,20:2300,30:23000,40:180000,50:900000,
    60:2700000,70:6800000,80:13600000,100:36000000,
    120:82000000,150:250000000,200:1000000000,
    250:3600000000,300:12700000000,350:43000000000,400:145000000000
  };

  /* Reference survivability follows the same philosophy: slightly optimized,
     realistically upgraded equipment rather than a minimum-stat character. */
  var REFERENCE_HP={
    1:100,10:500,20:3000,30:15000,40:20000,50:500000,
    60:3000000,70:15000000,80:60000000,90:100000000,
    100:150000000,110:200000000,120:260000000,130:320000000,
    140:380000000,150:380000000,200:900000000,
    250:2100000000,300:4800000000,350:10500000000,400:23000000000
  };

  function maxFloor(){
    try{return Math.max(1,Number(window.__srCampaignMaxFloor)||800);}catch(_){return 800;}
  }
  function semanticLegacyFloor(f){
    var max=maxFloor();f=Math.max(1,Math.min(max,Number(f)||1));
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

  function expectedDamage(f){return logInterp(REFERENCE_DAMAGE,semanticLegacyFloor(f));}
  function expectedHP(f){return logInterp(REFERENCE_HP,semanticLegacyFloor(f));}
  function campaignEnemyHP(f){return Math.max(1,Math.round(expectedDamage(f)*TARGET_HITS_TO_KILL));}
  function campaignEnemyDamage(f){return Math.max(1,Math.round(expectedHP(f)/TARGET_HITS_TO_DEFEAT_REFERENCE));}

  /* V285's boss multiplier reads __srV285EnemyHP dynamically. Pointing it at
     the new normal-enemy reference keeps its internal base coherent, while V288
     still overwrites final boss HP to the dedicated boss target. */
  window.__srV285EnemyHP=campaignEnemyHP;
  window.__srV289EnemyDamage=campaignEnemyDamage;
  window.__srV323ExpectedPlayerDamage=expectedDamage;
  window.__srV323ExpectedPlayerHP=expectedHP;
  try{if(typeof enemyHP==='function')enemyHP=campaignEnemyHP;}catch(_){ }
  try{if(typeof enemyDamage==='function')enemyDamage=campaignEnemyDamage;}catch(_){ }

  window.__srEnemyDamageConfigV289={
    maxFloor:800,legacyMaxFloor:400,semanticLegacyFloor:semanticLegacyFloor,
    referenceDamage:REFERENCE_DAMAGE,referenceHP:REFERENCE_HP,
    targetHitsToKill:TARGET_HITS_TO_KILL,
    targetHitsToDefeatReference:TARGET_HITS_TO_DEFEAT_REFERENCE,
    expectedPlayerDamage:expectedDamage,expectedPlayerHP:expectedHP,
    enemyHP:campaignEnemyHP,enemyDamage:campaignEnemyDamage,
    scaling:'floor-only-no-player-rubber-band',
    expectedGates:{
      weak:'69-89',normal:'99-119',max0:'139-159',ascended:'199-299+',
      nightmare:'301-400',infernal:'401-500',abyssal:'501-600',immortal:'601-700',divine:'701-800'
    }
  };
})();
