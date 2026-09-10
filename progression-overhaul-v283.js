/* SHADOWREACH V283 · Progression overhaul foundation
   Additive authority layer. Equipment + Poussiere + Familiar foundations.
   Existing saves are migrated upward only; no owned equipment stat is lowered. */
(function(){
'use strict';
if(window.__srProgressionOverhaulV283)return;window.__srProgressionOverhaulV283=true;

var EQUIP_BASE={COMMUN:500,RARE:2000,EPIQUE:8000,MYTHIQUE:32000,ARTEFACT:128000,LEGENDAIRE:512000,INFERNAL:2048000,IMMORTEL:8192000,DIVIN:32768000,HEROIQUE:128000,ANCESTRAL:2048000};
var EQ_MEAN={COMMUN:.40,RARE:.45,EPIQUE:.50,MYTHIQUE:.56,ARTEFACT:.62,LEGENDAIRE:.68,INFERNAL:.73,IMMORTEL:.78,DIVIN:.83,HEROIQUE:.62,ANCESTRAL:.73};
var EQ_PERF={COMMUN:.0001,RARE:.0003,EPIQUE:.0008,MYTHIQUE:.002,ARTEFACT:.01,LEGENDAIRE:.02,INFERNAL:.035,IMMORTEL:.055,DIVIN:.08,HEROIQUE:.01,ANCESTRAL:.035};
function qroll(r,rng){rng=rng||Math.random;var p=EQ_PERF[r]||0;if(rng()<p)return 1;var t=EQ_MEAN[r]||.5,n=(t-p)/(1-p),lo=.20,hi=.999;n=Math.max(lo+.001,Math.min(hi-.001,n));var e=(hi-lo)/(n-lo)-1;return lo+(hi-lo)*Math.pow(rng(),Math.max(.08,e));}
function isDmg(slot){try{return MASTERY_STAT[slot]==='dmg';}catch(_){return ['arme','gants','collier','anneau'].indexOf(slot)>=0;}}
function equipStar(){try{return Number(starMul(S,'forge'))||1;}catch(_){return 1;}}
function equipStats(slot,rar,q,star){var b=(EQUIP_BASE[rar]||500)*(star||1);return isDmg(slot)?{d:Math.floor(b*q),h:0}:{d:0,h:Math.floor(b*4*q)};}
try{if(typeof makeItem==='function'&&!makeItem.__srV283){var oldMake=makeItem;makeItem=function(slot,rar,forge){var it=oldMake(slot,rar,forge),q=qroll(rar),x=equipStats(slot,rar,q,equipStar());it.damage=x.d;it.hp=x.h;it.baseDamage=x.d;it.baseHp=x.h;it.level=0;it.upgradeBaseLevel=0;it.originalPower=x.d+x.h;it.power=x.d+x.h;it.statQuality=Math.round(q*10000)/10000;it.powerCurveVersion=283;return it;};makeItem.__srV283=true;}}catch(_){ }
try{if(typeof arenaItem==='function'){arenaItem=function(slot,rar,forge,stars){var q=qroll(rar),sm=1;try{sm=Number(ascendPowerMul(stars||0,'forge'))||1;}catch(_){ }var x=equipStats(slot,rar,q,sm);return {slot:slot,rarity:rar,weaponType:slot==='arme'?WEAPON_LIST[Math.floor(Math.random()*WEAPON_LIST.length)]:null,damage:x.d,hp:x.h,affixes:rollAffixes(rar),statQuality:Math.round(q*10000)/10000};};}}catch(_){ }

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
function migrateItem(it){if(!it||!it.rarity||Number(it.powerCurveVersion)>=283)return;var b=EQUIP_BASE[it.rarity];if(!b){it.powerCurveVersion=283;return;}var q=Number(it.statQuality);if(!(q>0&&q<=1))q=qroll(it.rarity,seeded(hash((it.id||'')+'|'+it.rarity+'|'+it.slot)));var star=equipStar(),x=equipStats(it.slot,it.rarity,q,star),oldBD=Number(it.baseDamage)||0,oldBH=Number(it.baseHp)||0,oldD=Number(it.damage)||0,oldH=Number(it.hp)||0;var df=oldBD>0?Math.max(1,oldD/oldBD):1,hf=oldBH>0?Math.max(1,oldH/oldBH):1;it.baseDamage=Math.max(oldBD,x.d);it.baseHp=Math.max(oldBH,x.h);it.damage=Math.max(oldD,it.baseDamage*df);it.hp=Math.max(oldH,it.baseHp*hf);it.originalPower=Math.max(Number(it.originalPower)||0,it.baseDamage+it.baseHp);it.power=it.damage+it.hp;it.statQuality=Math.round(q*10000)/10000;it.powerCurveVersion=283;}
function migrate(){try{if(typeof S==='undefined'||!S)return;if(Number(S.progressionOverhaulVersion)>=283)return;(S.inventory||[]).forEach(migrateItem);if(S.equipped)Object.keys(S.equipped).forEach(function(k){migrateItem(S.equipped[k]);});(S.pets||[]).forEach(function(p){if(!p)return;p.legacyLevel=p.legacyLevel==null?(Number(p.level)||0):p.legacyLevel;p.level=0;p.petCurveVersion=283;});S.progressionOverhaulVersion=283;if(typeof computePower==='function')S.power=computePower(S);if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }}
migrate();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',migrate,{once:true});else setTimeout(migrate,0);
window.__srProgressionOverhaulConfigV283={equipmentBase:EQUIP_BASE,petOrder:PET_ORDER,petFuse:PET_FUSE,dustCost:window.__srV283DustCost,upgradeChance:window.__srV283UpgradeChance};
})();