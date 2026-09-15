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

/* V337 · per-save historical Raid Or adjustment */
(function(){
  'use strict';
  if(window.__srRaidRewardMigrationV337)return;
  window.__srRaidRewardMigrationV337=true;

  function deltaFor(level){
    var p=Math.pow(1.057,Math.max(0,level-1));
    return Math.floor(5000*p)-Math.floor(3000*p);
  }

  function totalFor(record){
    var r=Math.max(0,Math.floor(Number(record)||0));
    var total=0;
    for(var i=1;i<=r;i++)total+=deltaFor(i);
    return total;
  }

  try{
    if(typeof update==='function'&&typeof S!=='undefined'&&S&&S.raids&&S.raids.or){
      update(function(st){
        if(st.raidRewardMigrationV337)return;
        var record=Math.max(0,Math.floor(Number(st.raids.or.record)||0));
        var amount=totalFor(record);
        st.gold=(Number(st.gold)||0)+amount;
        st.raidRewardMigrationV337={record:record,amount:amount};
      });
      if(typeof saveNow==='function')saveNow();
    }
  }catch(_){ }

  window.__srRaidRewardMigrationCalcV337=totalFor;
})();
