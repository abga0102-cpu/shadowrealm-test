/* SHADOWREACH V394 · Raid Évolution PE authority
   Level 1 = 150 PE, then +3 PE per raid level.
   Only the Evolution raid reward is changed; Minerai, Or, Éclat, Essence and
   Autonomy remain under their existing authorities. */
(function(){
  'use strict';
  if(window.__srRaidPEV290)return;
  window.__srRaidPEV290=true;

  function peReward(level){
    level=Math.max(1,Math.floor(Number(level)||1));
    return 150+3*(level-1);
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

  window.__srRaidPEConfigV290={level1:150,perLevel:3,reward:peReward};
})();
