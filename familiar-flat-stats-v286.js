/* SHADOWREACH V286 · Familiar flat stats
   Familiars are independent flat DGT/PV sources: rarity + species + stars.
   Apple levels stay retired. Tree pet branches amplify only familiar contribution. */
(function(){'use strict';if(window.__srFamiliarFlatV286)return;window.__srFamiliarFlatV286=true;
var BASE={COMMUN:[1500,12000],PEU_COMMUN:[5000,40000],RARE:[20000,160000],EPIQUE:[120000,960000],MYTHIQUE:[900000,7200000],ANCESTRAL:[7000000,56000000],LEGENDAIRE:[70000000,560000000],DIVIN:[544000000,4350000000]};
var SPEC={loup:[1.40,.65],felin:[1.20,.85],dragonnet:[1,1],oiseau:[.70,1.40]};
var STAR=[1,1.5,2.1,3];
function pstars(s){try{return Math.max(0,Math.floor(starsOf(s||S,'pet')||0));}catch(_){return 0;}}
function smul(s){var stars=pstars(s);return STAR[Math.min(stars,STAR.length-1)]||STAR[STAR.length-1];}
function stats(p,s){if(!p)return {damage:0,hp:0};var state=s||S,b=BASE[p.rarity]||BASE.COMMUN,sp=SPEC[p.species]||SPEC.dragonnet,m=smul(state);var d=b[0]*sp[0]*m,h=b[1]*sp[1]*m;try{d*=1+treeSum(state,'petDmg')/100;h*=1+treeSum(state,'petHp')/100;}catch(_){ }try{if(petElement(p).id==='normal')d*=1.10;}catch(_){ }return {damage:Math.round(d),hp:Math.round(h)};}
window.__srV286PetStats=stats;
/* Keep legacy petBonus callers harmless: percentage contribution is retired. */
try{if(typeof petBonus==='function')petBonus=function(){return 0;};}catch(_){ }
try{if(typeof petBonusAt==='function')petBonusAt=function(){return 0;};}catch(_){ }
try{if(typeof petMaxLevel==='function')petMaxLevel=function(){return 0;};}catch(_){ }
try{if(typeof petUpgradeCost==='function')petUpgradeCost=function(){return Infinity;};}catch(_){ }
/* Authority computeDerived: preserve every existing equipment/affix/global formula,
   then add the familiar BEFORE the global Forge/passive multipliers by replacing
   the old percentage-pet contribution at the final derived-stat boundary. */
try{if(typeof computeDerived==='function'&&!computeDerived.__srV286){var old=computeDerived;computeDerived=function(s){var pet=(s.pets||[]).find(function(p){return p&&p.id===s.activePetId;})||null;var ps=stats(pet,s),saveId=s.activePetId;s.activePetId=null;var d;try{d=old(s);}finally{s.activePetId=saveId;}if(!pet){d.petFlatDamage=0;d.petFlatHP=0;return d;}
 var forgePct=(s.forge&&s.forge.level||0)*2,passD=0,passH=0;try{passD=treeSum(s,'passDmg');passH=treeSum(s,'passHp');}catch(_){ }
 var dm=1+forgePct/100+passD/100,hm=1+forgePct/200+passH/100;
 d.damage=Math.floor(d.damage+ps.damage*dm);d.maxHP=Math.floor(d.maxHP+ps.hp*hm);d.petFlatDamage=ps.damage;d.petFlatHP=ps.hp;d.petPct=0;d.petDmgPct=0;
 /* Refresh power estimate from the authoritative post-pet combat stats. */
 var weaponDef=(typeof WEAPON_TYPES!=='undefined'&&(WEAPON_TYPES[d.weapon]||WEAPON_TYPES.epee))||{speed:1,hit:1};var critFactor=1+(d.critChance/100)*Math.max(0,d.critMult-1),doubleFactor=1+Math.min(100,d.doubleAtk||0)/100,skillFactor=1+((d.skillDmgBonus||0)/100)*.25,cooldownFactor=1+(Math.min(80,d.skillCdCut||0)/100)*.25;var offense=d.damage*d.attackSpeed*weaponDef.speed*weaponDef.hit*critFactor*doubleFactor*(1+((weaponDef.attackType==='MELEE'?d.meleeDmg:d.rangedDmg)||0)/100)*skillFactor*cooldownFactor;var mitigation=1/Math.max(.15,1-Math.min(85,d.dmgRed||0)/100),blockFactor=1+Math.min(75,d.blockChance||0)/200,sustainFactor=1+Math.min(50,Math.max(0,d.lifesteal||0))/200+Math.min(50,Math.max(0,d.regen||0))/250;d._power=Math.floor(Math.sqrt(Math.max(1,offense)*Math.max(1,d.maxHP*mitigation*blockFactor*sustainFactor))*1.5);return d;};computeDerived.__srV286=true;}}catch(_){ }
try{if(typeof computePower==='function')computePower=function(s){return computeDerived(s)._power||0;};}catch(_){ }
/* Existing saves: level is already inert since V283. No deletion, so legacy data remains recoverable. */
try{if(typeof S!=='undefined'&&S){(S.pets||[]).forEach(function(p){if(p){p.legacyLevel=p.legacyLevel==null?(p.level||0):p.legacyLevel;p.level=0;p.petCurveVersion=286;}});S.familiarFlatVersion=286;if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srFamiliarFlatConfigV286={base:BASE,species:SPEC,stars:STAR};
})();