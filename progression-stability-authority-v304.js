/* SHADOWREACH V304 · Progression stability authority
   One late, additive authority for already-approved progression rules.
   Purpose: reduce cross-version drift without rewriting legacy files.
   - Ascension multipliers reflect the actual approved systems: Forge x2 at 1★,
     Skill x1.5 at 1★, Familiar x1 / x1.5 / x2.1 / x3.
   - Raid rewards keep the approved V290/V291 curves.
   - Dust upgrade keeps the approved V301 5% minimum and V283 cost curve.
   This layer changes no save schema and performs no destructive migration. */
(function(){'use strict';
if(window.__srProgressionStabilityV304)return;window.__srProgressionStabilityV304=true;

var PET_STAR=[1,1.5,2.1,3],FORGE_STAR=[1,2],SKILL_STAR=[1,1.5];
function pick(table,stars){stars=Math.max(0,Math.floor(Number(stars)||0));return table[Math.min(stars,table.length-1)];}
try{
  ascendPowerMul=function(stars,sys){
    if(sys==='pet')return pick(PET_STAR,stars);
    if(sys==='skill')return pick(SKILL_STAR,stars);
    /* Preserve historical callers that omit sys: Forge was the legacy default.
       Unknown explicit systems must stay neutral instead of silently inheriting Forge. */
    if(sys==='forge'||sys==null)return pick(FORGE_STAR,stars);
    return 1;
  };
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
  raids:{evolution:{base:100,perLevel:3},competence:{base:250,perLevel:10},familier:{base:250,perLevel:10}},
  dust:{minimumChance:5,costBase:60,costPerLevel:36},
  destructiveMigration:false
};
})();
