/* SHADOWREACH V289 · Campaign enemy balance authority
   V324 extension: early campaign reference now follows the real V283 equipment
   curve so playing naked stops feeling almost identical to playing geared.

   Design rule:
   - The floor determines enemy power. Current player stats are never sampled.
   - A correctly equipped, reasonably upgraded player targets ~3.6 basic hits.
   - Naked / badly under-geared players should hit a clear progression wall.
   - Better gear keeps its real advantage and may still produce 1-2 hit kills.
   - Boss HP remains owned by V285/V288; boss damage consumes this floor curve.
*/
(function(){
  'use strict';
  if(window.__srEnemyDamageV289)return;
  window.__srEnemyDamageV289=true;
  window.__srCampaignReferenceBalanceV323=true;
  window.__srCampaignReferenceBalanceV324=true;

  var LEGACY_MAX=400;
  var TARGET_HITS_TO_KILL=3.6;
  var TARGET_HITS_TO_DEFEAT_REFERENCE=8;

  /* V324 early anchors deliberately rise much faster than V323. V283 common
     equipment already starts around hundreds of offensive stat points, so the
     old 12-damage floor-1 reference made the new balance nearly invisible.
     These remain floor expectations, never live-player rubber-band scaling. */
  var REFERENCE_DAMAGE={
    1:30,3:80,5:150,10:350,15:800,20:2500,30:23000,40:180000,50:900000,
    60:2700000,70:6800000,80:13600000,100:36000000,
    120:82000000,150:250000000,200:1000000000,
    250:3600000000,300:12700000000,350:43000000000,400:145000000000
  };

  /* Early survivability also ramps with expected armour acquisition. This
     makes incoming damage relevant to naked characters without scaling against
     whatever equipment the player actually owns. */
  var REFERENCE_HP={
    1:100,3:180,5:400,10:1200,20:4000,30:15000,40:20000,50:500000,
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

  window.__srV285EnemyHP=campaignEnemyHP;
  window.__srV289EnemyDamage=campaignEnemyDamage;
  window.__srV323ExpectedPlayerDamage=expectedDamage;
  window.__srV323ExpectedPlayerHP=expectedHP;
  window.__srV324ExpectedPlayerDamage=expectedDamage;
  window.__srV324ExpectedPlayerHP=expectedHP;
  try{if(typeof enemyHP==='function')enemyHP=campaignEnemyHP;}catch(_){ }
  try{if(typeof enemyDamage==='function')enemyDamage=campaignEnemyDamage;}catch(_){ }

  window.__srEnemyDamageConfigV289={
    version:324,maxFloor:800,legacyMaxFloor:400,semanticLegacyFloor:semanticLegacyFloor,
    referenceDamage:REFERENCE_DAMAGE,referenceHP:REFERENCE_HP,
    targetHitsToKill:TARGET_HITS_TO_KILL,
    targetHitsToDefeatReference:TARGET_HITS_TO_DEFEAT_REFERENCE,
    expectedPlayerDamage:expectedDamage,expectedPlayerHP:expectedHP,
    enemyHP:campaignEnemyHP,enemyDamage:campaignEnemyDamage,
    scaling:'floor-only-no-player-rubber-band',
    earlyCampaign:'gear-required-1-50',
    expectedGates:{
      weak:'69-89',normal:'99-119',max0:'139-159',ascended:'199-299+',
      nightmare:'301-400',infernal:'401-500',abyssal:'501-600',immortal:'601-700',divine:'701-800'
    }
  };
})();
