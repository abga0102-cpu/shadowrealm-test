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

  window.__srV289EnemyDamage=function(f){return logInterp(DAMAGE,semanticLegacyFloor(f));};
  try{if(typeof enemyDamage==='function')enemyDamage=window.__srV289EnemyDamage;}catch(_){ }

  window.__srEnemyDamageConfigV289={
    anchors:DAMAGE,maxFloor:800,legacyMaxFloor:400,semanticLegacyFloor:semanticLegacyFloor,
    expectedGates:{
      weak:'69-89',normal:'99-119',max0:'139-159',ascended:'199-299+',
      nightmare:'301-400',infernal:'401-500',abyssal:'501-600',immortal:'601-700',divine:'701-800'
    }
  };
})();