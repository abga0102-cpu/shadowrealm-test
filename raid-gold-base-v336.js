/* SHADOWREACH V336 · Raid Or base 5k
   Keeps the existing Raid Or progression system unchanged:
   level 1 starts at 5,000 Or and each following level keeps the same ×1.057 growth.
   All non-Or raid rewards are delegated to the previous authority. */
(function(){
  'use strict';
  if(window.__srRaidGoldBaseV336)return;
  window.__srRaidGoldBaseV336=true;

  var BASE=5000;
  var GROWTH=1.057;

  try{
    if(typeof raidReward==='function'&&!raidReward.__srRaidGoldBaseV336){
      var previousRaidReward=raidReward;
      raidReward=function(raid,level){
        if(raid==='or'){
          var lv=Math.max(1,Number(level)||1);
          return Math.floor(BASE*Math.pow(GROWTH,lv-1));
        }
        return previousRaidReward.apply(this,arguments);
      };
      raidReward.__srRaidGoldBaseV336=true;
    }
  }catch(_){ }

  window.__srRaidGoldBaseConfigV336={base:BASE,growth:GROWTH};
})();
