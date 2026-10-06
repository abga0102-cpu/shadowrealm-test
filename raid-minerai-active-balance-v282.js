/* Shadowreach V499 — Raid Minerai economy compatibility
   Final reward ownership is V396. Autonomy base is 10% of the Raid reward
   per hour before the existing autonomy/tree efficiency multiplier. */
(function(){
  'use strict';
  var MINERAI_AUTONOMY_SHARE=0.10;

  function mineraiReward(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    if(lv<=21)return 1000+50*(lv-1);
    if(lv<=41)return 2000+25*(lv-21);
    if(lv<=61)return 2500+15*(lv-41);
    return 2800+5*(lv-61);
  }

  if(typeof raidReward==='function'&&!raidReward.__srV323Minerai){
    var previousRaidReward=raidReward;
    var wrappedRaidReward=function(type,level){
      if(type==='minerai')return mineraiReward(level);
      return previousRaidReward.apply(this,arguments);
    };
    wrappedRaidReward.__srV323Minerai=true;
    wrappedRaidReward.__srPrevious=previousRaidReward;
    raidReward=wrappedRaidReward;
  }

  if(typeof harvestPerHour==='function'&&!harvestPerHour.__srV323Minerai){
    var previousHarvestPerHour=harvestPerHour;
    var wrappedHarvestPerHour=function(s){
      var out=previousHarvestPerHour.apply(this,arguments)||{};
      try{
        var eff=(typeof harvestEfficiency==='function')?harvestEfficiency(s)/100:0;
        if(eff>0&&s&&s.raids&&s.raids.minerai){
          out.minerai=raidReward('minerai',s.raids.minerai.level)*MINERAI_AUTONOMY_SHARE*eff;
        }else if(Object.prototype.hasOwnProperty.call(out,'minerai'))out.minerai=0;
      }catch(_){}
      return out;
    };
    wrappedHarvestPerHour.__srV323Minerai=true;
    wrappedHarvestPerHour.__srPrevious=previousHarvestPerHour;
    harvestPerHour=wrappedHarvestPerHour;
  }

  try{
    window.__shadowreachRaidMineraiBalance={
      version:499,level1:1000,perLevelTo2000:50,level21:2000,
      perLevelTo2500:25,level41:2500,perLevelTo2800:15,level61:2800,
      perLevelAfter2800:5,level70:2845,
      autonomySharePerHour:MINERAI_AUTONOMY_SHARE
    };
  }catch(_){}
})();