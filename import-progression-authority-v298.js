/* SHADOWREACH V298 · Import progression authority
   QA fix: V283's progression migration runs only during page boot, while V207
   imports a JSON later through the global migrate() function. A legacy save
   imported after boot could therefore bypass the current equipment/familiar
   progression rules. This late wrapper makes imported states compatible without
   deleting or lowering any owned stat and without rerolling legacy item quality. */
(function(){'use strict';
if(window.__srImportProgressionV298)return;window.__srImportProgressionV298=true;

var BASE={COMMUN:500,RARE:2000,EPIQUE:8000,MYTHIQUE:32000,ARTEFACT:128000,LEGENDAIRE:512000,INFERNAL:2048000,IMMORTEL:8192000,DIVIN:32768000,HEROIQUE:128000,ANCESTRAL:2048000};
function isDmg(slot){try{return MASTERY_STAT[slot]==='dmg';}catch(_){return ['arme','gants','collier','anneau'].indexOf(slot)>=0;}}
function clampQ(q){q=Number(q);return isFinite(q)?Math.max(.20,Math.min(1,q)):.20;}
function normalizeItem(it){
  if(!it||!it.rarity)return;
  var b=Number(BASE[it.rarity])||0;if(!b)return;
  var oldBD=Math.max(0,Number(it.baseDamage)||0),oldBH=Math.max(0,Number(it.baseHp)||0);
  var oldD=Math.max(0,Number(it.damage)||0),oldH=Math.max(0,Number(it.hp)||0);
  var q=Number(it.statQuality);
  if(!(q>0&&q<=1)){
    /* Infer quality from the stat already owned. Never randomize an imported
       item: identical save files must always import identically. */
    var raw=isDmg(it.slot)?(oldBD||oldD):(oldBH||oldH)/4;
    q=clampQ(raw>0?raw/b:.20);
  }
  var star=1;try{star=Number(ascendPowerMul(starsOf(S||{},'forge'),'forge'))||1;}catch(_){ }
  var target=isDmg(it.slot)?Math.floor(b*q*star):Math.floor(b*4*q*star);
  if(isDmg(it.slot)){
    it.baseDamage=Math.max(oldBD,target);
    it.damage=Math.max(oldD,it.baseDamage);
    it.baseHp=oldBH;it.hp=oldH;
  }else{
    it.baseHp=Math.max(oldBH,target);
    it.hp=Math.max(oldH,it.baseHp);
    it.baseDamage=oldBD;it.damage=oldD;
  }
  it.originalPower=Math.max(Number(it.originalPower)||0,(Number(it.baseDamage)||0)+(Number(it.baseHp)||0));
  it.power=Math.max(Number(it.power)||0,(Number(it.damage)||0)+(Number(it.hp)||0));
  it.statQuality=Math.round(q*10000)/10000;
  it.powerCurveVersion=Math.max(283,Number(it.powerCurveVersion)||0);
  it.importProgressionVersion=298;
}
function normalizeState(s){
  if(!s||typeof s!=='object')return s;
  (s.inventory||[]).forEach(normalizeItem);
  if(s.equipped)Object.keys(s.equipped).forEach(function(k){normalizeItem(s.equipped[k]);});
  (s.pets||[]).forEach(function(p){if(!p)return;p.legacyLevel=p.legacyLevel==null?(Number(p.level)||0):p.legacyLevel;p.level=0;p.petCurveVersion=Math.max(286,Number(p.petCurveVersion)||0);});
  s.progressionOverhaulVersion=Math.max(283,Number(s.progressionOverhaulVersion)||0);
  s.importProgressionVersion=298;
  return s;
}

try{
  if(typeof migrate==='function'&&!migrate.__srV298){
    var oldMigrate=migrate;
    migrate=function(raw,name){var s=oldMigrate(raw,name);return normalizeState(s);};
    migrate.__srV298=true;
  }
}catch(_){ }
window.__srNormalizeImportedProgressionV298=normalizeState;
window.__srImportProgressionConfigV298={deterministicLegacyQuality:true,noStatReduction:true};
})();