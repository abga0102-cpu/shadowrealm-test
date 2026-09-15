/* Shadowreach V323 — Raid Minerai reward authority */
(function(){
  'use strict';
  var SHARE = 0.25;
  var EARLY = [750,780,810,840,870,900,930,960,980,1000];
  function reward(level){
    var lv=Math.max(1,Math.floor(Number(level)||1));
    return lv<=10?EARLY[lv-1]:1000+(lv-10)*10;
  }
  if(typeof raidReward==='function'&&!raidReward.__srV323Minerai){
    var prev=raidReward;
    raidReward=function(type,level){return type==='minerai'?reward(level):prev.apply(this,arguments);};
    raidReward.__srV323Minerai=true;
    raidReward.__srPrevious=prev;
  }
  if(typeof harvestPerHour==='function'&&!harvestPerHour.__srV323Minerai){
    var prevHarvest=harvestPerHour;
    harvestPerHour=function(s){
      var out=prevHarvest.apply(this,arguments)||{};
      try{
        var eff=typeof harvestEfficiency==='function'?harvestEfficiency(s)/100:0;
        out.minerai=eff>0&&s&&s.raids&&s.raids.minerai?raidReward('minerai',s.raids.minerai.level)*SHARE*eff:0;
      }catch(_){}
      return out;
    };
    harvestPerHour.__srV323Minerai=true;
    harvestPerHour.__srPrevious=prevHarvest;
  }
  try{window.__shadowreachRaidMineraiBalance={version:323,level1:750,level10:1000,postLevel10PerLevel:10,autonomySharePerHour:SHARE};}catch(_){}
})();
