/* SHADOWREACH V394 · Raid Or milestone curve
   Level 1 stays at 5,000 Or.
   Level 10 = 10,000, level 15 = 15,000, level 20 = 20,000.
   From level 21 onward, the historical ×1.057 growth resumes from the 20,000 anchor.
   All non-Or raid rewards are delegated to the previous authority. */
(function(){
  'use strict';
  if(window.__srRaidGoldBaseV336)return;
  window.__srRaidGoldBaseV336=true;

  var BASE=5000;
  var GROWTH=1.057;

  function goldRaidReward(level){
    var lv=Math.max(1,Math.floor(Number(level)||1));
    if(lv<=10){
      return Math.round(BASE+(10000-BASE)*((lv-1)/9));
    }
    if(lv<=15){
      return 10000+(lv-10)*1000;
    }
    if(lv<=20){
      return 15000+(lv-15)*1000;
    }
    return Math.floor(20000*Math.pow(GROWTH,lv-20));
  }

  try{
    if(typeof raidReward==='function'&&!raidReward.__srRaidGoldBaseV336){
      var previousRaidReward=raidReward;
      raidReward=function(raid,level){
        if(raid==='or') return goldRaidReward(level);
        return previousRaidReward.apply(this,arguments);
      };
      raidReward.__srRaidGoldBaseV336=true;
    }
  }catch(_){ }

  window.__srRaidGoldBaseConfigV336={
    base:BASE,growth:GROWTH,
    level10:10000,level15:15000,level20:20000,
    reward:goldRaidReward
  };
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
