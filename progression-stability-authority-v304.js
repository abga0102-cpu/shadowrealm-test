/* SHADOWREACH V304 · Progression stability authority / V323 Forge rarity Ascensions
   One late, additive authority for approved progression rules.
   Purpose: reduce cross-version drift without rewriting legacy files.
   - Ascension multipliers remain: Forge x2 from 1★ onward,
     Skill x1.5 at 1★, Familiar x1 / x1.5 / x2.1 / x3.
   - V323 extends Forge Ascension to 4★ only for the rarity ladder:
     ★ Légendaire, ★★ Infernal, ★★★ Immortel, ★★★★ Divin.
   - Raid rewards keep the approved V290/V291 curves.
   - Dust upgrade ownership stays in V283 (cost) + V301 (chance); this late layer
     must never overwrite those live authorities.
   This layer changes no save schema and performs no destructive migration. */
(function(){'use strict';
if(window.__srProgressionStabilityV304)return;window.__srProgressionStabilityV304=true;

var PET_STAR=[1,1.5,2.1,3],FORGE_STAR=[1,2],SKILL_STAR=[1,1.5];
var FORGE_ASCEND_MAX_STARS_V323=4;
var FORGE_RARITY_BY_STAR_V323={1:'Légendaire',2:'Infernal',3:'Immortel',4:'Divin'};
function pick(table,stars){stars=Math.max(0,Math.floor(Number(stars)||0));return table[Math.min(stars,table.length-1)];}
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

/* V323: Forge may Ascend four times so each post-Artefact rarity has its own
   earned star. Pet and Skill retain their existing caps unchanged. */
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
   equipment power; stars 2-4 are rarity unlocks, not extra hidden power. */
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

/* V454: Dust cost/chance intentionally delegated to their canonical owners.
   V304 is loaded late, so overriding them here would silently undo newer balance. */

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
  forgeRarityAscensionV323:{maxStars:FORGE_ASCEND_MAX_STARS_V323,rarityByStar:FORGE_RARITY_BY_STAR_V323,powerStopsGrowingAfterStar:1},
  raids:{evolution:{base:100,perLevel:3},competence:{base:250,perLevel:10},familier:{base:250,perLevel:10}},
  dust:{delegated:true,costOwner:'progression-overhaul-v283.js',chanceOwner:'dust-chance-floor-v301.js'},
  destructiveMigration:false
};
})();
