/* SHADOWREACH V337 · per-save Raid reward migration */
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
