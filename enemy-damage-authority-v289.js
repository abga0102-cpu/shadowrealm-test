/* SHADOWREACH V289 · Enemy damage authority
   V314 extension: survivability curve through the canonical 400-floor campaign.
   Floor-based only. No player-power scaling. Bosses keep V288's boss multiplier
   path; Mega Bosses still multiply the resulting normal boss damage by x10. */
(function(){
  'use strict';
  if(window.__srEnemyDamageV289)return;
  window.__srEnemyDamageV289=true;

  /* Existing 1..150 values stay exact. New anchors begin only after Expert. */
  var DAMAGE={
    1:2,
    10:50,
    20:300,
    30:1500,
    40:2000,
    50:50000,
    60:300000,
    70:1500000,
    80:6000000,
    90:10000000,
    100:15000000,
    110:20000000,
    120:26000000,
    130:32000000,
    140:38000000,
    150:38000000,
    200:90000000,
    250:210000000,
    300:480000000,
    350:1050000000,
    400:2300000000
  };

  function maxFloor(){
    try{return Math.max(1,Number(window.__srCampaignMaxFloor)||400);}catch(_){return 400;}
  }
  function logInterp(table,f){
    var keys=Object.keys(table).map(Number).sort(function(a,b){return a-b;});
    f=Math.max(1,Math.min(maxFloor(),Number(f)||1));
    if(f<=keys[0])return table[keys[0]];
    for(var i=1;i<keys.length;i++){
      if(f<=keys[i]){
        var a=keys[i-1],b=keys[i],t=(f-a)/(b-a);
        return Math.max(1,Math.round(Math.exp(Math.log(table[a])+(Math.log(table[b])-Math.log(table[a]))*t)));
      }
    }
    return table[keys[keys.length-1]];
  }

  window.__srV289EnemyDamage=function(f){return logInterp(DAMAGE,f);};
  try{if(typeof enemyDamage==='function')enemyDamage=window.__srV289EnemyDamage;}catch(_){ }

  window.__srEnemyDamageConfigV289={
    anchors:DAMAGE,
    maxFloor:400,
    expectedGates:{
      weak:'35-45',normal:'50-60',max0:'70-80',ascended:'100-150+',
      nightmare:'151-200',infernal:'201-250',abyssal:'251-300',immortal:'301-350',divine:'351-400'
    }
  };
})();