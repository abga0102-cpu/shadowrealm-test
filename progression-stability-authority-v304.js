/* SHADOWREACH V304 / V372 · Progression stability authority
   One late authority for approved progression rules.
   - Ascension multipliers remain: Forge x2 from 1★ onward,
     Skill x1.5 at 1★, Familiar x1 / x1.5 / x2.1 / x3.
   - Forge rarity Ascension ends at 3★:
     ★ Légendaire, ★★ Infernal, ★★★ Immortel.
   - Divin is not a fourth Forge star. It requires the character's global Ascension.
   - Legacy saves that physically contain Forge 4★ keep their raw save value, but
     runtime progression treats it as the approved 3★ cap (no destructive rewrite).
   - Raid rewards keep the approved V290/V291 curves.
   - Dust upgrade keeps the approved V301 5% minimum and V283 cost curve. */
(function(){'use strict';
if(window.__srProgressionStabilityV304)return;window.__srProgressionStabilityV304=true;

var PET_STAR=[1,1.5,2.1,3],FORGE_STAR=[1,2],SKILL_STAR=[1,1.5];
var FORGE_ASCEND_MAX_STARS_V323=3;
var FORGE_RARITY_BY_STAR_V323={1:'Légendaire',2:'Infernal',3:'Immortel'};
function pick(table,stars){stars=Math.max(0,Math.floor(Number(stars)||0));return table[Math.min(stars,table.length-1)];}

/* Preserve legacy raw save data while making every runtime caller observe the
   approved three-star Forge ceiling. This is intentionally non-destructive. */
try{
  if(typeof starsOf==='function'&&!starsOf.__srV372){
    var rawStarsOfV372=starsOf;
    starsOf=function(s,sys){
      var raw=Math.max(0,Math.floor(Number(rawStarsOfV372(s,sys))||0));
      return sys==='forge'?Math.min(FORGE_ASCEND_MAX_STARS_V323,raw):raw;
    };
    starsOf.__srV372=true;starsOf.__srPrevious=rawStarsOfV372;
  }
}catch(_){ }

try{
  ascendPowerMul=function(stars,sys){
    if(sys==='pet')return pick(PET_STAR,stars);
    if(sys==='skill')return pick(SKILL_STAR,stars);
    /* Preserve historical callers that omit sys: Forge was the legacy default.
       V323 deliberately keeps Forge power at x2 after the first star; later
       Forge stars advance rarity access instead of multiplying power again. */
    if(sys==='forge'||sys==null)return pick(FORGE_STAR,stars);
    return 1;
  };
}catch(_){ }

/* V372: Forge has exactly three rarity stars. Divin belongs to the character
   Ascension gate, not to a fourth Forge reset. Pet and Skill keep their caps. */
try{
  if(typeof canAscend==='function'&&!canAscend.__srV323){
    var oldCanAscend=canAscend;
    canAscend=function(s,sys){
      if(sys==='forge'){
        var stars=0,level=0,max=50;
        try{stars=Math.max(0,Math.floor(Number(starsOf(s,'forge'))||0));}catch(_){ }
        try{level=Number(masteryLevel(s,'forge'))||0;max=Number(masteryMax('forge'))||50;}catch(_){ }
        return level>=max&&stars<FORGE_ASCEND_MAX_STARS_V323;
      }
      return oldCanAscend(s,sys);
    };
    canAscend.__srV323=true;canAscend.__srPrevious=oldCanAscend;
  }
}catch(_){ }

/* Keep the Ascension preview honest: the first Forge star still doubles base
   equipment power; stars 2-3 are rarity unlocks, not extra hidden power. */
try{
  if(typeof ascensionPreview==='function'&&!ascensionPreview.__srV323){
    var oldAscensionPreview=ascensionPreview;
    ascensionPreview=function(s,sys){
      var out=oldAscensionPreview(s,sys);
      if(sys!=='forge'||!out)return out;
      var next=Math.max(1,Math.floor(Number(out.nextStars)||1));
      var rarity=FORGE_RARITY_BY_STAR_V323[next]||'';
      if(rarity){
        var unlock=rarity+' · 0,25 % à Forge 45 → 1 % à Forge 50';
        out.gain=next===1?'Puissance de base des équipements ×2 · '+unlock:unlock;
      }
      return out;
    };
    ascensionPreview.__srV323=true;ascensionPreview.__srPrevious=oldAscensionPreview;
  }
}catch(_){ }

function peReward(level){level=Math.max(1,Math.floor(Number(level)||1));return 100+3*(level-1);}
function summonReward(level){level=Math.max(1,Math.floor(Number(level)||1));return 250+10*(level-1);}
try{
  if(typeof raidReward==='function'&&!raidReward.__srV304){
    var oldRaidReward=raidReward;
    raidReward=function(type,level){
      if(type==='evolution')return peReward(level);
      if(type==='competence'||type==='familier')return summonReward(level);
      return oldRaidReward.apply(this,arguments);
    };
    raidReward.__srV304=true;raidReward.__srPrevious=oldRaidReward;
  }
}catch(_){ }

function dustChance(level){level=Math.max(0,Math.floor(Number(level)||0));if(level<70)return 100;return Math.max(5,95-5*Math.floor((level-70)/2));}
function dustCost(level){return Math.max(0,Math.round(60+36*Math.max(0,Number(level)||0)));}
try{if(typeof itemUpgradeChance==='function')itemUpgradeChance=function(it){return dustChance((it&&it.level)||0);};}catch(_){ }
try{if(typeof itemUpgradeCost==='function')itemUpgradeCost=function(it){return dustCost((it&&it.level)||0);};}catch(_){ }

try{
  if(typeof S!=='undefined'&&S){
    S.progressionStabilityVersion=304;
    if(typeof computePower==='function')S.power=computePower(S);
    if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);
    if(typeof saveNow==='function')saveNow();
    if(typeof scheduleRender==='function')scheduleRender();
  }
}catch(_){ }

window.__srProgressionStabilityConfigV304={
  stars:{forge:FORGE_STAR,skill:SKILL_STAR,pet:PET_STAR},
  forgeRarityAscensionV323:{maxStars:FORGE_ASCEND_MAX_STARS_V323,rarityByStar:FORGE_RARITY_BY_STAR_V323,powerStopsGrowingAfterStar:1,divineRequiresGlobalAscension:true,legacyRawStarsPreserved:true},
  forgeRarityAscensionV372:{maxStars:FORGE_ASCEND_MAX_STARS_V323,rarityByStar:FORGE_RARITY_BY_STAR_V323,powerStopsGrowingAfterStar:1,divineRequiresGlobalAscension:true,legacyRawStarsPreserved:true},
  raids:{evolution:{base:100,perLevel:3},competence:{base:250,perLevel:10},familier:{base:250,perLevel:10}},
  dust:{minimumChance:5,costBase:60,costPerLevel:36},
  destructiveMigration:false
};
})();
