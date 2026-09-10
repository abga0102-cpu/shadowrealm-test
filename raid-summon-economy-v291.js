/* SHADOWREACH V291 · Skill/Familiar summon economy authority
   QA result: current 125 +5/level rewards only fund ~10 summons/day at Raid 1
   with the two native daily keys, while the validated progression target is
   ~20 summons/day at level 1 and ~59/day at level 50.
   Authority:
   - Raid Compétence: 250 at lvl1, +10 per level.
   - Raid Familier:   250 at lvl1, +10 per level.
   Costs, key cadence, tree reductions and every other raid remain unchanged. */
(function(){
  'use strict';
  if(window.__srRaidSummonEconomyV291)return;
  window.__srRaidSummonEconomyV291=true;

  function summonReward(level){
    level=Math.max(1,Math.floor(Number(level)||1));
    return 250+10*(level-1);
  }

  try{
    if(typeof raidReward==='function'&&!raidReward.__srV291){
      var previousRaidReward=raidReward;
      var wrapped=function(type,level){
        if(type==='competence'||type==='familier')return summonReward(level);
        return previousRaidReward.apply(this,arguments);
      };
      wrapped.__srV291=true;
      wrapped.__srPrevious=previousRaidReward;
      raidReward=wrapped;
    }
  }catch(_){ }

  window.__srRaidSummonEconomyConfigV291={
    competence:{base:250,perLevel:10},
    familier:{base:250,perLevel:10},
    expectedDailySummonsAtBaseCost:{level1:20,level50:59.2}
  };
})();
