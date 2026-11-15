/* SHADOWREACH V394 / V486 · Raid Évolution PE compatibility authority
   Level 1 = 150 PE; +10 per level through level 14, then +5 per level through level 70.
   Only the Evolution raid reward is changed; Minerai, Or, Éclat, Essence and
   Autonomy remain under their existing authorities. */
(function(){
  'use strict';
  if(window.__srRaidPEV290)return;
  window.__srRaidPEV290=true;

  function peReward(level){
    level=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    if(level<=14)return 150+10*(level-1);
    return 280+5*(level-14);
  }

  try{
    if(typeof raidReward==='function'&&!raidReward.__srV290){
      var previous=raidReward;
      var wrapped=function(raid,level){
        if(raid==='evolution') return peReward(level);
        return previous.apply(this,arguments);
      };
      wrapped.__srV290=true;
      wrapped.__srPrevious=previous;
      raidReward=wrapped;
    }
  }catch(_){ }

  window.__srRaidPEConfigV290={curveVersion:486,level1:150,perLevelTo14:10,level14:280,perLevelFrom15:5,level15:285,level70:560,reward:peReward};
})();
