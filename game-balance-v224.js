/* SHADOWREACH · Game Balance V224 / V372 Forge rarity ladder
   - Equipment base power is fixed by rarity and no longer scales with Forge level.
   - Rarity-specific stat quality rolls; perfect rolls stay rare through Mythic.
   - Every newly available Forge rarity starts at exactly 0.25%.
   - 0★ ends at Artefact; ★/★★/★★★ unlock Légendaire/Infernal/Immortel.
   - Divin requires both ★★★ Forge and at least one global character Ascension.
   - Removes obsolete Rebirth upgrades (including Regeneration) from active effects/UI registry.
   - Existing gear is migrated once without lowering owned stats or upgrade investment. */
(function(){
'use strict';
if(window.__srGameBalanceV224)return;
window.__srGameBalanceV224=true;

var FIXED_BASE={
  COMMUN:100,RARE:220,EPIQUE:500,MYTHIQUE:1100,ARTEFACT:2300,
  LEGENDAIRE:4500,INFERNAL:8000,IMMORTEL:13000,DIVIN:20000,
  /* legacy aliases only, never newly rolled */ HEROIQUE:2300,ANCESTRAL:8000
};
var TARGET_MEAN={
  COMMUN:.40,RARE:.45,EPIQUE:.50,MYTHIQUE:.56,ARTEFACT:.62,
  LEGENDAIRE:.68,INFERNAL:.73,IMMORTEL:.78,DIVIN:.83,
  HEROIQUE:.62,ANCESTRAL:.73
};
/* Exact perfect-roll probability. Commun -> Mythique all remain below 1%.
   The meaningful perfect-roll ramp starts at Artefact. */
var PERFECT={
  COMMUN:.0001,RARE:.0003,EPIQUE:.0008,MYTHIQUE:.002,
  ARTEFACT:.01,LEGENDAIRE:.02,INFERNAL:.035,IMMORTEL:.055,DIVIN:.08,
  HEROIQUE:.01,ANCESTRAL:.035
};
var QUALITY_FLOOR=.20,QUALITY_TOP=.999;

function qualityRoll(rarity,rng){
  rng=rng||Math.random;
  var p=PERFECT[rarity]||0;
  if(rng()<p)return 1;
  var target=TARGET_MEAN[rarity]||.50;
  var nonPerfect=(target-p)/(1-p);
  nonPerfect=Math.max(QUALITY_FLOOR+.001,Math.min(QUALITY_TOP-.001,nonPerfect));
  var exponent=(QUALITY_TOP-QUALITY_FLOOR)/(nonPerfect-QUALITY_FLOOR)-1;
  exponent=Math.max(.08,exponent);
  return QUALITY_FLOOR+(QUALITY_TOP-QUALITY_FLOOR)*Math.pow(rng(),exponent);
}
function round2(v){return Math.round((Number(v)||0)*100)/100;}
function blockedRebirth(u){
  if(!u)return false;
  var k=String(u.key||'').toLowerCase(),l=String(u.label||'').toLowerCase();
  return k==='regen'||k==='lifesteal'||k==='atkspeed'||k==='critdmg'||k==='apples'||
    /r[eé]g[eé]n[eé]ration/.test(l)||/vol\s*(de\s*)?vie/.test(l)||/vitesse.*attaque|vit\.\s*attaque/.test(l)||
    /d[eé]g[aâ]ts?\s*crit/.test(l)||/pomme/.test(l);
}
function pruneRebirth(){
  try{
    if(typeof REBIRTH_UPGRADES==='undefined'||!Array.isArray(REBIRTH_UPGRADES))return;
    for(var i=REBIRTH_UPGRADES.length-1;i>=0;i--)if(blockedRebirth(REBIRTH_UPGRADES[i]))REBIRTH_UPGRADES.splice(i,1);
  }catch(_){ }
}
pruneRebirth();

/* V372 Forge rarity progression.
   Base 0★ keeps the approved Forge-50 targets through Artefact. The three
   Forge-star tiers enter at Forge 45: 0.25%, reaching 1.00% at Forge 50.
   Divin uses the same endgame ramp only after ★★★ plus global Ascension.
   Higher-tier probability is taken only from Commun, preserving lower tiers.
   At ★★★ / Forge 50 before global Ascension:
   C36 / R28 / E21 / M8 / A4 / L1 / I1 / Im1 / D0.
   After global Ascension: C35 ... / Im1 / D1. */
var FORGE_BASE_RARITIES_V323=[
  {key:'RARE',unlock:1,target:28,ease:.70},
  {key:'EPIQUE',unlock:6,target:21,ease:1.15},
  {key:'MYTHIQUE',unlock:14,target:8,ease:1.55},
  {key:'ARTEFACT',unlock:22,target:4,ease:1.85}
];
var FORGE_STAR_RARITIES_V323=[
  {key:'LEGENDAIRE',stars:1},
  {key:'INFERNAL',stars:2},
  {key:'IMMORTEL',stars:3}
];
function forgeBaseRarityChanceV323(level,cfg){
  level=Math.max(1,Math.min(50,Math.floor(Number(level)||1)));
  if(level<cfg.unlock)return 0;
  if(level>=50)return cfg.target;
  if(cfg.unlock>=50)return .25;
  var p=(level-cfg.unlock)/(50-cfg.unlock);
  return .25+(cfg.target-.25)*Math.pow(Math.max(0,Math.min(1,p)),cfg.ease);
}
function forgeStarRarityChanceV323(level){
  level=Math.max(1,Math.min(50,Math.floor(Number(level)||1)));
  if(level<45)return 0;
  return .25+.75*((level-45)/5);
}
function forgeRatesV323(level,stars,ascension){
  level=Math.max(1,Math.min(50,Math.floor(Number(level)||1)));
  stars=Math.min(3,Math.max(0,Math.floor(Number(stars)||0)));
  ascension=Math.max(0,Math.floor(Number(ascension)||0));
  var out={COMMUN:0,RARE:0,EPIQUE:0,MYTHIQUE:0,ARTEFACT:0,LEGENDAIRE:0,INFERNAL:0,IMMORTEL:0,DIVIN:0};
  var used=0;
  FORGE_BASE_RARITIES_V323.forEach(function(cfg){
    var chance=forgeBaseRarityChanceV323(level,cfg);
    out[cfg.key]=chance;used+=chance;
  });
  var starChance=forgeStarRarityChanceV323(level);
  FORGE_STAR_RARITIES_V323.forEach(function(cfg){
    if(stars<cfg.stars)return;
    out[cfg.key]=starChance;used+=starChance;
  });
  if(stars>=3&&ascension>=1){out.DIVIN=starChance;used+=starChance;}
  out.COMMUN=Math.max(0,100-used);
  return out;
}
function forgeRequiredStarsV323(rarity){
  if(rarity==='DIVIN')return 3;
  for(var i=0;i<FORGE_STAR_RARITIES_V323.length;i++)if(FORGE_STAR_RARITIES_V323[i].key===rarity)return FORGE_STAR_RARITIES_V323[i].stars;
  return 0;
}
/* Keep the existing Forge floor gate aligned with the new star-tier entrance.
   Base rarity floors remain unchanged; every Ascension-only tier enters at 45. */
try{
  if(typeof RARITY_MIN_FORGE!=='undefined'&&RARITY_MIN_FORGE){
    RARITY_MIN_FORGE.LEGENDAIRE=45;
    RARITY_MIN_FORGE.INFERNAL=45;
    RARITY_MIN_FORGE.IMMORTEL=45;
    RARITY_MIN_FORGE.DIVIN=45;
  }
}catch(_){ }


/* V372 runtime reachability mirrors the actual rarity ladder so the Forge filter
   and rarity-info panel never present a locked star/global-Ascension tier as
   reachable merely because its Forge level requirement is met. */
try{
  if(typeof rarityAllowed==='function'&&!rarityAllowed.__srV372){
    var oldRarityAllowedV372=rarityAllowed;
    rarityAllowed=function(rarity,forgeLevel,state){
      if(!oldRarityAllowedV372(rarity,forgeLevel))return false;
      var s=state||(typeof S!=='undefined'?S:null),stars=0,asc=0;
      try{stars=s&&typeof starsOf==='function'?Math.max(0,Math.floor(Number(starsOf(s,'forge'))||0)):0;}catch(_){}
      try{asc=Math.max(0,Math.floor(Number(s&&s.ascension)||0));}catch(_){}
      if(rarity==='LEGENDAIRE')return stars>=1;
      if(rarity==='INFERNAL')return stars>=2;
      if(rarity==='IMMORTEL')return stars>=3;
      if(rarity==='DIVIN')return stars>=3&&asc>=1;
      return true;
    };
    rarityAllowed.__srV372=true;rarityAllowed.__srPrevious=oldRarityAllowedV372;
  }
}catch(_){ }

try{
  if(typeof getRates==='function'&&!getRates.__srV224){
    var oldGetRates=getRates;
    var wrappedGetRates=function(system,mastery,ascension,stars){
      if(system==='forge')return forgeRatesV323(mastery,stars,ascension);
      return oldGetRates(system,mastery,ascension,stars);
    };
    wrappedGetRates.__srV224=true;
    wrappedGetRates.__srV323=true;
    wrappedGetRates.__srPrevious=oldGetRates;
    getRates=wrappedGetRates;
  }
}catch(_){ }

/* New equipment: Forge level is intentionally ignored for stat base.
   Forge Ascension stars remain a separate earned multiplier. */
try{
  if(typeof makeItem==='function'&&!makeItem.__srV224){
    var oldMakeItem=makeItem;
    var wrappedMakeItem=function(slot,rarity,forgeLevel){
      var it=oldMakeItem(slot,rarity,forgeLevel);
      var fixed=FIXED_BASE[rarity];
      if(!fixed)return it;
      var star=1;try{if(typeof starMul==='function')star=Number(starMul(S,'forge'))||1;}catch(_){ }
      var q=qualityRoll(rarity,Math.random),base=fixed*star;
      var isDmg=(typeof MASTERY_STAT!=='undefined'&&MASTERY_STAT[slot]==='dmg');
      var dmg=isDmg?Math.floor(base*q):0;
      var hp=isDmg?0:Math.floor(base*4*q);
      it.damage=dmg;it.hp=hp;it.baseDamage=dmg;it.baseHp=hp;
      it.upgradeBaseLevel=0;it.originalPower=dmg+hp;it.power=dmg+hp;
      it.statQuality=Math.round(q*10000)/10000;it.powerCurveVersion=224;
      return it;
    };
    wrappedMakeItem.__srV224=true;
    makeItem=wrappedMakeItem;
  }
}catch(_){ }

/* Arena/preview uses the exact same fixed-power model, so comparison screens
   cannot disagree with actual Forge drops. */
try{
  if(typeof arenaItem==='function'&&!arenaItem.__srV224){
    var wrappedArenaItem=function(slot,rar,forge,forgeStars){
      var fixed=FIXED_BASE[rar]||FIXED_BASE.COMMUN;
      var star=1;try{if(typeof ascendPowerMul==='function')star=Number(ascendPowerMul(forgeStars||0,'forge'))||1;}catch(_){ }
      var q=qualityRoll(rar,Math.random),base=fixed*star;
      var isDmg=(typeof MASTERY_STAT!=='undefined'&&MASTERY_STAT[slot]==='dmg');
      return {slot:slot,rarity:rar,weaponType:slot==='arme'?WEAPON_LIST[Math.floor(Math.random()*WEAPON_LIST.length)]:null,
        damage:isDmg?Math.floor(base*q):0,hp:isDmg?0:Math.floor(base*4*q),affixes:rollAffixes(rar),statQuality:Math.round(q*10000)/10000};
    };
    wrappedArenaItem.__srV224=true;
    arenaItem=wrappedArenaItem;
  }
}catch(_){ }

/* Stable pseudo-random migration: old gear gets a rarity-appropriate quality
   without requiring a save reset. We never lower an owned stat; this protects
   previous Forge/Poussiere investment while future drops follow V224 exactly. */
function hashSeed(s){
  s=String(s||'legacy');var h=2166136261>>>0;
  for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0;
}
function seeded(seed){var x=seed>>>0;return function(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function migrateItem(it){
  if(!it||!it.rarity||it.powerCurveVersion>=224)return;
  var fixed=FIXED_BASE[it.rarity];if(!fixed){it.powerCurveVersion=224;return;}
  var rng=seeded(hashSeed((it.id||'')+'|'+it.rarity+'|'+it.slot)),q=qualityRoll(it.rarity,rng);
  var isDmg=(typeof MASTERY_STAT!=='undefined'&&MASTERY_STAT[it.slot]==='dmg');
  var targetBaseDmg=isDmg?Math.floor(fixed*q):0,targetBaseHp=isDmg?0:Math.floor(fixed*4*q);
  var oldBaseDmg=Number(it.baseDamage)||0,oldBaseHp=Number(it.baseHp)||0;
  var oldDmg=Number(it.damage)||0,oldHp=Number(it.hp)||0;
  var dmgFactor=oldBaseDmg>0?Math.max(1,oldDmg/oldBaseDmg):1;
  var hpFactor=oldBaseHp>0?Math.max(1,oldHp/oldBaseHp):1;
  it.baseDamage=Math.max(oldBaseDmg,targetBaseDmg);
  it.baseHp=Math.max(oldBaseHp,targetBaseHp);
  it.damage=Math.max(oldDmg,round2(it.baseDamage*dmgFactor));
  it.hp=Math.max(oldHp,round2(it.baseHp*hpFactor));
  it.originalPower=Math.max(Number(it.originalPower)||0,round2(it.baseDamage+it.baseHp));
  it.power=round2((Number(it.damage)||0)+(Number(it.hp)||0));
  it.statQuality=Math.round(q*10000)/10000;it.powerCurveVersion=224;
}
function migrate(){
  try{
    if(typeof S==='undefined'||!S)return;
    pruneRebirth();
    if(Number(S.equipmentPowerCurveVersion)>=224)return;
    (S.inventory||[]).forEach(migrateItem);
    if(S.equipped)Object.keys(S.equipped).forEach(function(k){migrateItem(S.equipped[k]);});
    S.equipmentPowerCurveVersion=224;
    if(typeof computePower==='function')S.power=computePower(S);
    if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);
    if(typeof dirty!=='undefined')dirty=true;
    if(typeof scheduleRender==='function')scheduleRender();
    if(typeof saveNow==='function')saveNow();
  }catch(_){ }
}
migrate();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',migrate,{once:true});else setTimeout(migrate,0);

window.__srEquipmentBalanceV224={
  fixedBase:FIXED_BASE,targetMean:TARGET_MEAN,perfectChance:PERFECT,qualityRoll:qualityRoll,pruneRebirth:pruneRebirth,
  forgeRarityV323:{base:FORGE_BASE_RARITIES_V323,stars:FORGE_STAR_RARITIES_V323,rates:forgeRatesV323,requiredStars:forgeRequiredStarsV323,starUnlockLevel:45,starStartChance:.25,starMaxChance:1,maxStars:3,divineRequiresGlobalAscension:true,divineMinStars:3},
  forgeRarityV372:{base:FORGE_BASE_RARITIES_V323,stars:FORGE_STAR_RARITIES_V323,rates:forgeRatesV323,requiredStars:forgeRequiredStarsV323,starUnlockLevel:45,starStartChance:.25,starMaxChance:1,maxStars:3,divineRequiresGlobalAscension:true,divineMinStars:3}
};
})();