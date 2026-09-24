/* SHADOWREACH V283 · Progression overhaul foundation
   Additive authority layer. Equipment + Poussiere + Familiar foundations.
   Existing saves are migrated upward only; no owned equipment stat is lowered. */
(function(){
'use strict';
if(window.__srProgressionOverhaulV283)return;window.__srProgressionOverhaulV283=true;

/* V442: canonical equipment power curve. Do not duplicate or replace this table in base generators. */
var EQUIP_BASE={COMMUN:500,PEU_COMMUN:1000,RARE:2000,EPIQUE:8000,HEROIQUE:16000,MYTHIQUE:32000,ARTEFACT:128000,LEGENDAIRE:512000,INFERNAL:2048000,IMMORTEL:8192000,DIVIN:32768000,ANCESTRAL:2048000};
var EQ_MEAN={COMMUN:.40,PEU_COMMUN:.425,RARE:.45,EPIQUE:.50,HEROIQUE:.53,MYTHIQUE:.56,ARTEFACT:.62,LEGENDAIRE:.68,INFERNAL:.73,IMMORTEL:.78,DIVIN:.83,ANCESTRAL:.73};
var EQ_PERF={COMMUN:.0001,PEU_COMMUN:.0002,RARE:.0003,EPIQUE:.0008,HEROIQUE:.0013,MYTHIQUE:.002,ARTEFACT:.01,LEGENDAIRE:.02,INFERNAL:.035,IMMORTEL:.055,DIVIN:.08,ANCESTRAL:.035};

/* V445 · Permanent equipment mastery from paid lifetime forges.
   This progression never resets with Forge Ascension. It boosts the BASE stat
   of owned and future equipment, while originalPower remains pre-mastery so
   recycling cannot create extra Dust. The final guard keeps every rarity
   strictly below the same-quality base of the next rarity. */
var EQUIP_ORDER=['COMMUN','PEU_COMMUN','RARE','EPIQUE','HEROIQUE','MYTHIQUE','ARTEFACT','LEGENDAIRE','INFERNAL','IMMORTEL','DIVIN'];
var FORGE_LIFETIME_TIERS=[
  {need:0,rank:0,roman:'—',bonusPct:0},
  {need:100,rank:1,roman:'I',bonusPct:10},
  {need:300,rank:2,roman:'II',bonusPct:20},
  {need:600,rank:3,roman:'III',bonusPct:30},
  {need:1000,rank:4,roman:'IV',bonusPct:40},
  {need:1500,rank:5,roman:'V',bonusPct:50},
  {need:2500,rank:6,roman:'VI',bonusPct:60},
  {need:4000,rank:7,roman:'VII',bonusPct:70},
  {need:6500,rank:8,roman:'VIII',bonusPct:75},
  {need:10000,rank:9,roman:'IX',bonusPct:80}
];
function forgeLifetimeInfo(s){
  var count=Math.max(0,Math.floor(Number(s&&s.forge&&s.forge.lifetimeCount)||0));
  var current=FORGE_LIFETIME_TIERS[0],next=null;
  for(var i=1;i<FORGE_LIFETIME_TIERS.length;i++){
    if(count>=FORGE_LIFETIME_TIERS[i].need)current=FORGE_LIFETIME_TIERS[i];
    else{next=FORGE_LIFETIME_TIERS[i];break;}
  }
  var progressPct=100;
  if(next){
    var span=Math.max(1,next.need-current.need);
    progressPct=Math.max(0,Math.min(100,(count-current.need)/span*100));
  }
  return {
    count:count,rank:current.rank,roman:current.roman,bonusPct:current.bonusPct,
    currentNeed:current.need,nextNeed:next?next.need:null,nextRoman:next?next.roman:null,
    progressPct:progressPct,maxed:!next
  };
}
function forgeLifetimeBonusPct(s){return forgeLifetimeInfo(s).bonusPct;}
function qroll(r,rng){rng=rng||Math.random;var p=EQ_PERF[r]||0;if(rng()<p)return 1;var t=EQ_MEAN[r]||.5,n=(t-p)/(1-p),lo=.20,hi=.999;n=Math.max(lo+.001,Math.min(hi-.001,n));var e=(hi-lo)/(n-lo)-1;return lo+(hi-lo)*Math.pow(rng(),Math.max(.08,e));}
function isDmg(slot){try{return MASTERY_STAT[slot]==='dmg';}catch(_){return ['arme','gants','collier','anneau'].indexOf(slot)>=0;}}
function equipStarForState(s){try{return Number(starMul(s,'forge'))||1;}catch(_){return 1;}}
function equipStar(){return equipStarForState(typeof S!=='undefined'?S:null);}
function rawEquipStats(slot,rar,q,star){
  var b=(EQUIP_BASE[rar]||500)*(star||1);
  return isDmg(slot)?{d:Math.floor(b*q),h:0}:{d:0,h:Math.floor(b*4*q)};
}
function nextEquipRarity(rar){
  var i=EQUIP_ORDER.indexOf(rar);
  return i>=0&&i<EQUIP_ORDER.length-1?EQUIP_ORDER[i+1]:null;
}
function equipStats(slot,rar,q,star,bonusPct){
  var raw=rawEquipStats(slot,rar,q,star),mul=1+Math.max(0,Math.min(80,Number(bonusPct)||0))/100;
  var d=Math.floor(raw.d*mul),h=Math.floor(raw.h*mul),next=nextEquipRarity(rar);
  if(next){
    var cap=rawEquipStats(slot,next,q,star);
    if(d&&cap.d)d=Math.min(d,Math.max(0,cap.d-1));
    if(h&&cap.h)h=Math.min(h,Math.max(0,cap.h-1));
  }
  return {d:d,h:h,rawD:raw.d,rawH:raw.h};
}
function itemQuality(it){
  var q=Number(it&&it.statQuality);
  if(q>0&&q<=1)return q;
  return qroll(it&&it.rarity,seeded(hash(((it&&it.id)||'')+'|'+((it&&it.rarity)||'')+'|'+((it&&it.slot)||''))));
}
function applyForgeLifetimeMasteryItem(it,s){
  if(!it||!it.rarity||!EQUIP_BASE[it.rarity])return false;
  var q=itemQuality(it),star=equipStarForState(s),pct=forgeLifetimeBonusPct(s);
  var oldBD=Number(it.baseDamage)||0,oldBH=Number(it.baseHp)||0,oldD=Number(it.damage)||0,oldH=Number(it.hp)||0;
  var df=oldBD>0?Math.max(1,oldD/oldBD):1,hf=oldBH>0?Math.max(1,oldH/oldBH):1;
  var x=equipStats(it.slot,it.rarity,q,star,pct);
  it.baseDamage=x.d;it.baseHp=x.h;
  it.damage=Math.round(x.d*df*100)/100;it.hp=Math.round(x.h*hf*100)/100;
  it.originalPower=x.rawD+x.rawH;
  it.power=it.damage+it.hp;
  it.statQuality=Math.round(q*10000)/10000;
  it.forgeLifetimeMasteryPct=pct;
  it.forgeLifetimeMasteryVersion=445;
  return true;
}
function applyForgeLifetimeMasteryState(s){
  if(!s||!s.forge)return {changed:false,info:forgeLifetimeInfo(s)};
  var changed=false;
  (s.inventory||[]).forEach(function(it){if(applyForgeLifetimeMasteryItem(it,s))changed=true;});
  if(s.equipped)Object.keys(s.equipped).forEach(function(k){if(applyForgeLifetimeMasteryItem(s.equipped[k],s))changed=true;});
  s.forge.lifetimeMasteryVersion=445;
  return {changed:changed,info:forgeLifetimeInfo(s)};
}
try{if(typeof makeItem==='function'&&!makeItem.__srV283){var oldMake=makeItem;makeItem=function(slot,rar,forge){
  var it=oldMake(slot,rar,forge),q=qroll(rar),pct=forgeLifetimeBonusPct(typeof S!=='undefined'?S:null);
  var x=equipStats(slot,rar,q,equipStar(),pct);
  it.damage=x.d;it.hp=x.h;it.baseDamage=x.d;it.baseHp=x.h;it.level=0;it.upgradeBaseLevel=0;
  it.originalPower=x.rawD+x.rawH;it.power=x.d+x.h;it.statQuality=Math.round(q*10000)/10000;
  it.powerCurveVersion=372;it.forgeLifetimeMasteryPct=pct;it.forgeLifetimeMasteryVersion=445;
  return it;
};makeItem.__srV283=true;}}catch(_){ }
try{if(typeof arenaItem==='function'){arenaItem=function(slot,rar,forge,stars){
  var q=qroll(rar),sm=1;try{sm=Number(ascendPowerMul(stars||0,'forge'))||1;}catch(_){ }
  var x=equipStats(slot,rar,q,sm,forgeLifetimeBonusPct(typeof S!=='undefined'?S:null));
  return {slot:slot,rarity:rar,weaponType:slot==='arme'?WEAPON_LIST[Math.floor(Math.random()*WEAPON_LIST.length)]:null,
    damage:x.d,hp:x.h,affixes:rollAffixes(rar),statQuality:Math.round(q*10000)/10000};
};}}catch(_){ }

/* Poussiere: old live formula (20 + 12*level) x3. No level cap. Chance may reach 0%.
   Security papers are deliberately NOT introduced in this build. */
window.__srV283DustCost=function(level){return Math.max(0,Math.round(60+36*Math.max(0,Number(level)||0)));};
window.__srV283UpgradeChance=function(level){level=Math.max(0,Math.floor(Number(level)||0));if(level<70)return 100;return Math.max(0,95-5*Math.floor((level-70)/2));};
try{if(typeof itemUpgradeCost==='function')itemUpgradeCost=function(it){return window.__srV283DustCost((it&&it.level)||0);};}catch(_){ }
try{if(typeof itemUpgradeChance==='function')itemUpgradeChance=function(it){return window.__srV283UpgradeChance((it&&it.level)||0);};}catch(_){ }

/* Familiar ladder/fusion. Apple levelling is disabled; familiar levels become inert legacy data. */
var PET_ORDER=['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE','ANCESTRAL','LEGENDAIRE','DIVIN'];
var PET_FUSE={COMMUN:4,PEU_COMMUN:4,RARE:5,EPIQUE:5,MYTHIQUE:5,ANCESTRAL:6};
try{if(typeof PET_RARITY_ORDER!=='undefined'){PET_RARITY_ORDER.length=0;PET_ORDER.forEach(function(r){PET_RARITY_ORDER.push(r);});}}catch(_){ }
try{if(typeof PET_FUSE_NEED!=='undefined'){Object.keys(PET_FUSE_NEED).forEach(function(k){delete PET_FUSE_NEED[k];});Object.keys(PET_FUSE).forEach(function(k){PET_FUSE_NEED[k]=PET_FUSE[k];});}}catch(_){ }
try{if(typeof upgradePet==='function')upgradePet=function(){return {ok:false,reason:'La progression par pommes a été retirée.'};}}catch(_){ }

function hash(s){s=String(s||'legacy');var h=2166136261>>>0;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function seeded(x){return function(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function migrateItem(it,s){
  if(!it||!it.rarity)return;
  if(!EQUIP_BASE[it.rarity]){it.powerCurveVersion=372;return;}
  applyForgeLifetimeMasteryItem(it,s);
  it.powerCurveVersion=372;
}
function migrate(){try{
  if(typeof S==='undefined'||!S)return;
  if(!S.forge)S.forge={};
  if(!Number.isFinite(Number(S.forge.lifetimeCount)))S.forge.lifetimeCount=Math.max(0,Math.floor(Number(S.forge.summonCount)||0));
  var curveNeeded=Number(S.progressionOverhaulVersion)<372;
  var info=forgeLifetimeInfo(S);
  var masteryNeeded=Number(S.forge.lifetimeMasteryVersion)<445;
  if(!masteryNeeded){
    var all=(S.inventory||[]).concat(S.equipped?Object.keys(S.equipped).map(function(k){return S.equipped[k];}):[]);
    masteryNeeded=all.some(function(it){return it&&Number(it.forgeLifetimeMasteryPct)!==info.bonusPct;});
  }
  if(!curveNeeded&&!masteryNeeded)return;
  (S.inventory||[]).forEach(function(it){migrateItem(it,S);});
  if(S.equipped)Object.keys(S.equipped).forEach(function(k){migrateItem(S.equipped[k],S);});
  if(curveNeeded)(S.pets||[]).forEach(function(p){if(!p)return;p.legacyLevel=p.legacyLevel==null?(Number(p.level)||0):p.legacyLevel;p.level=0;p.petCurveVersion=283;});
  S.progressionOverhaulVersion=372;
  S.forge.lifetimeMasteryVersion=445;
  if(typeof computePower==='function')S.power=computePower(S);
  if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);
  if(typeof saveNow==='function')saveNow();
  if(typeof scheduleRender==='function')scheduleRender();
}catch(_){ }}
migrate();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',migrate,{once:true});else setTimeout(migrate,0);
window.__srForgeLifetimeMasteryV445={
  version:445,
  tiers:FORGE_LIFETIME_TIERS.map(function(t){return Object.assign({},t);}),
  info:forgeLifetimeInfo,
  bonusPct:forgeLifetimeBonusPct,
  rawStats:rawEquipStats,
  statsFor:equipStats,
  applyItem:applyForgeLifetimeMasteryItem,
  applyState:applyForgeLifetimeMasteryState
};
window.__srProgressionOverhaulConfigV283={equipmentBase:EQUIP_BASE,petOrder:PET_ORDER,petFuse:PET_FUSE,dustCost:window.__srV283DustCost,upgradeChance:window.__srV283UpgradeChance,forgeLifetimeMastery:window.__srForgeLifetimeMasteryV445};
window.__srEquipmentCurveAuthority={version:445,equipmentBase:EQUIP_BASE,ownsMakeItem:!!(typeof makeItem==='function'&&makeItem.__srV283),forgeLifetimeMastery:true};
})();