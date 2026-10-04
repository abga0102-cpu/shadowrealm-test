/* Shadowreach V496 — Raid Minerai economy compatibility
   Final reward ownership is V396. Autonomy base is 10% of the Raid reward
   per hour before the existing autonomy/tree efficiency multiplier. */
(function(){
  'use strict';
  var MINERAI_AUTONOMY_SHARE=0.10;

  function mineraiReward(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    if(lv<=11)return 500+50*(lv-1);
    if(lv<=31)return 1000+25*(lv-11);
    return 1500+10*(lv-31);
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
      version:496,level1:500,perLevelTo1000:50,level11:1000,
      perLevelTo1500:25,level31:1500,perLevelAfter1500:10,level70:1890,
      autonomySharePerHour:MINERAI_AUTONOMY_SHARE
    };
  }catch(_){}
})();