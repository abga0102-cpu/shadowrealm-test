/* SHADOWREACH V299 · Import progression authority
   Correct late authority for legacy JSON imports. V283's local migration only
   runs during page boot, while V207 imports later through global migrate().
   This wrapper normalizes imported equipment/familiars deterministically,
   never rerolls quality, never lowers an owned stat and uses the IMPORTED
   state's Forge stars (never the previously loaded player's state). */
(function(){'use strict';
if(window.__srImportProgressionV299)return;window.__srImportProgressionV299=true;

var BASE={COMMUN:500,RARE:2000,EPIQUE:8000,MYTHIQUE:32000,ARTEFACT:128000,LEGENDAIRE:512000,INFERNAL:2048000,IMMORTEL:8192000,DIVIN:32768000,HEROIQUE:128000,ANCESTRAL:2048000};
function isDmg(slot){try{return MASTERY_STAT[slot]==='dmg';}catch(_){return ['arme','gants','collier','anneau'].indexOf(slot)>=0;}}
function clampQ(q){q=Number(q);return isFinite(q)?Math.max(.20,Math.min(1,q)):.20;}
function forgeStarMul(s){try{return Number(ascendPowerMul(starsOf(s,'forge'),'forge'))||1;}catch(_){return 1;}}
function normalizeItem(it,s){
  if(!it||!it.rarity)return;
  var b=Number(BASE[it.rarity])||0;if(!b)return;
  var oldBD=Math.max(0,Number(it.baseDamage)||0),oldBH=Math.max(0,Number(it.baseHp)||0);
  var oldD=Math.max(0,Number(it.damage)||0),oldH=Math.max(0,Number(it.hp)||0);
  var q=Number(it.statQuality);
  if(!(q>0&&q<=1)){
    /* Reconstruct from the stat already present instead of randomizing. If an
       old save contains too little metadata, .20 is the conservative quality
       floor of the current equipment curve. */
    var raw=isDmg(it.slot)?(oldBD||oldD):((oldBH||oldH)/4);
    q=clampQ(raw>0?raw/(b*forgeStarMul(s)):.20);
  }
  var target=isDmg(it.slot)?Math.floor(b*q*forgeStarMul(s)):Math.floor(b*4*q*forgeStarMul(s));
  if(isDmg(it.slot)){
    it.baseDamage=Math.max(oldBD,target);it.damage=Math.max(oldD,it.baseDamage);
    it.baseHp=oldBH;it.hp=oldH;
  }else{
    it.baseHp=Math.max(oldBH,target);it.hp=Math.max(oldH,it.baseHp);
    it.baseDamage=oldBD;it.damage=oldD;
  }
  it.originalPower=Math.max(Number(it.originalPower)||0,(Number(it.baseDamage)||0)+(Number(it.baseHp)||0));
  it.power=Math.max(Number(it.power)||0,(Number(it.damage)||0)+(Number(it.hp)||0));
  it.statQuality=Math.round(q*10000)/10000;
  it.powerCurveVersion=Math.max(283,Number(it.powerCurveVersion)||0);
  it.importProgressionVersion=299;
}
function normalizeState(s){
  if(!s||typeof s!=='object')return s;
  (s.inventory||[]).forEach(function(it){normalizeItem(it,s);});
  if(s.equipped)Object.keys(s.equipped).forEach(function(k){normalizeItem(s.equipped[k],s);});
  (s.pets||[]).forEach(function(p){if(!p)return;p.legacyLevel=p.legacyLevel==null?(Number(p.level)||0):p.legacyLevel;p.level=0;p.petCurveVersion=Math.max(286,Number(p.petCurveVersion)||0);});
  s.progressionOverhaulVersion=Math.max(283,Number(s.progressionOverhaulVersion)||0);
  s.importProgressionVersion=299;
  return s;
}
try{
  if(typeof migrate==='function'&&!migrate.__srV299){
    var oldMigrate=migrate;
    migrate=function(raw,name){return normalizeState(oldMigrate(raw,name));};
    migrate.__srV299=true;
  }
}catch(_){ }
window.__srNormalizeImportedProgressionV299=normalizeState;
window.__srImportProgressionConfigV299={deterministicLegacyQuality:true,noStatReduction:true,usesImportedState:true};
})();