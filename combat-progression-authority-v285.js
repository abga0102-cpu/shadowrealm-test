/* SHADOWREACH V285 · Combat progression authority
   Fixed campaign curve calibrated against weak/normal/max 0★ and Ascension builds.
   Never scales enemies from current player power. */
(function(){'use strict';if(window.__srCombatProgressionV285)return;window.__srCombatProgressionV285=true;
var BOSS={10:2000,20:20000,30:180000,40:3000000,50:20000000,60:80000000,70:180000000,80:350000000,90:600000000,100:800000000,110:1000000000,120:1200000000,130:2200000000,140:4000000000,150:7000000000};
var NORMAL={1:22,10:300,20:5000,30:50000,40:400000,50:2000000,60:6000000,70:15000000,80:30000000,100:80000000,120:180000000,150:550000000};
function logInterp(table,f){var ks=Object.keys(table).map(Number).sort(function(a,b){return a-b;});if(f<=ks[0])return table[ks[0]];for(var i=1;i<ks.length;i++){if(f<=ks[i]){var a=ks[i-1],b=ks[i],t=(f-a)/(b-a);return Math.round(Math.exp(Math.log(table[a])+(Math.log(table[b])-Math.log(table[a]))*t));}}var a=ks[ks.length-2],b=ks[ks.length-1],g=Math.log(table[b]/table[a])/(b-a);return Math.round(table[b]*Math.exp(g*(f-b)));}
window.__srV285EnemyHP=function(f){return logInterp(NORMAL,Math.max(1,Number(f)||1));};
window.__srV285BossHP=function(f){f=Math.max(1,Number(f)||1);if(f%10===0&&BOSS[f]!=null)return BOSS[f];return logInterp(BOSS,f);};
try{if(typeof enemyHP==='function')enemyHP=window.__srV285EnemyHP;}catch(_){ }
/* Campaign bosses are often built by multiplying enemyHP. Override known boss-stat multiplier if present so exact boss anchors win. */
try{if(typeof campaignBossStatMul==='function'){var old=campaignBossStatMul;campaignBossStatMul=function(f){var base=window.__srV285EnemyHP(f),target=window.__srV285BossHP(f),o=old(f),hp=base>0?target/base:1;if(o&&typeof o==='object'){o=Object.assign({},o);if('hp' in o)o.hp=hp;if('hpMul' in o)o.hpMul=hp;return o;}return hp;};}}catch(_){ }
window.__srCombatProgressionConfigV285={bossHP:BOSS,normalHP:NORMAL};
})();