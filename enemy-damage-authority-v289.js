/* SHADOWREACH V289 · Enemy damage authority
   Floor-based only. Calibrated against the approved weak / normal / max-0★ /
   Ascension profiles so survivability gates line up with the HP progression.
   No player-power scaling. Bosses keep V288's boss multiplier path; Mega Bosses
   still multiply the resulting normal boss damage by x10. */
(function(){
  'use strict';
  if(window.__srEnemyDamageV289)return;
  window.__srEnemyDamageV289=true;

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
    150:42000000
  };

  function logInterp(table,f){
    var keys=Object.keys(table).map(Number).sort(function(a,b){return a-b;});
    f=Math.max(1,Number(f)||1);
    if(f<=keys[0])return table[keys[0]];
    for(var i=1;i<keys.length;i++){
      if(f<=keys[i]){
        var a=keys[i-1],b=keys[i],t=(f-a)/(b-a);
        return Math.max(1,Math.round(Math.exp(Math.log(table[a])+(Math.log(table[b])-Math.log(table[a]))*t)));
      }
    }
    var a=keys[keys.length-2],b=keys[keys.length-1];
    var g=Math.log(table[b]/table[a])/(b-a);
    return Math.max(1,Math.round(table[b]*Math.exp(g*(f-b))));
  }

  window.__srV289EnemyDamage=function(f){return logInterp(DAMAGE,f);};
  try{if(typeof enemyDamage==='function')enemyDamage=window.__srV289EnemyDamage;}catch(_){ }

  /* QA reference only; does not affect gameplay. Approximate gates assume the
     existing boss attack multiplier/cadence and are intentionally stored for
     future regression checks rather than coupled to the player's live stats. */
  window.__srEnemyDamageConfigV289={
    anchors:DAMAGE,
    expectedGates:{weak:'35-45',normal:'50-60',max0:'70-80',ascended:'100-150+'}
  };
})();