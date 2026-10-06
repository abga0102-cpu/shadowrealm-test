/* Shadowreach V500 — Raid Minerai difference compensation + economy compatibility
   Final reward ownership is V396. Autonomy base is 10% of the Raid reward
   per hour before the existing autonomy/tree efficiency multiplier.
   V500 grants once, and only once, the DIFFERENCE between the former V496
   Minerai curve and V499 for Raid Minerai levels already cleared. */
(function(){
  'use strict';
  var MINERAI_AUTONOMY_SHARE=0.10;
  var COMPENSATION_MARKER='raidMineraiDifferenceCompensationV500';
  var COMPENSATION_LOCAL_KEY='shadowreach.raidMinerai.compensation.v500.done';

  function mineraiRewardV496(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    if(lv<=11)return 500+50*(lv-1);
    if(lv<=31)return 1000+25*(lv-11);
    return 1500+10*(lv-31);
  }

  function mineraiReward(level){
    var lv=Math.max(1,Math.min(70,Math.floor(Number(level)||1)));
    if(lv<=21)return 1000+50*(lv-1);
    if(lv<=41)return 2000+25*(lv-21);
    if(lv<=61)return 2500+15*(lv-41);
    return 2800+5*(lv-61);
  }

  function compensationForRecord(record){
    var max=Math.max(0,Math.min(70,Math.floor(Number(record)||0)));
    var total=0;
    for(var lv=1;lv<=max;lv++)total+=Math.max(0,mineraiReward(lv)-mineraiRewardV496(lv));
    return total;
  }

  function compensateExistingRaidMinerai(state){
    if(!state||typeof state!=='object')return {applied:false,amount:0,throughLevel:0};
    if(state[COMPENSATION_MARKER])return {applied:false,amount:0,throughLevel:Number(state[COMPENSATION_MARKER].throughLevel)||0};
    var record=0;
    try{record=Math.max(0,Math.min(70,Math.floor(Number(state.raids&&state.raids.minerai&&state.raids.minerai.record)||0)));}catch(_){}
    var amount=compensationForRecord(record);
    if(amount>0)state.minerai=(Number(state.minerai)||0)+amount;
    state[COMPENSATION_MARKER]={
      done:true,throughLevel:record,amount:amount,curveFrom:496,curveTo:499,at:Date.now()
    };
    return {applied:true,amount:amount,throughLevel:record};
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
      version:500,curveVersion:499,level1:1000,perLevelTo2000:50,level21:2000,
      perLevelTo2500:25,level41:2500,perLevelTo2800:15,level61:2800,
      perLevelAfter2800:5,level70:2845,
      autonomySharePerHour:MINERAI_AUTONOMY_SHARE,
      compensation:{fromVersion:496,toVersion:499,marker:COMPENSATION_MARKER,
        differenceOnly:true,forRecord:compensationForRecord,apply:compensateExistingRaidMinerai}
    };
  }catch(_){}

  function runCompensationOnce(){
    try{
      if(typeof SMOKE!=='undefined'&&SMOKE)return;
      if(typeof S==='undefined'||!S)return;
      if(window.__srSaveLoadGuardV430&&window.__srSaveLoadGuardV430.blocked)return;
      var locallyDone=false;
      try{locallyDone=typeof localStorage!=='undefined'&&localStorage.getItem(COMPENSATION_LOCAL_KEY)==='1';}catch(_){}
      if(locallyDone&&!S[COMPENSATION_MARKER]){
        S[COMPENSATION_MARKER]={done:true,throughLevel:0,amount:0,curveFrom:496,curveTo:499,at:Date.now(),source:'device-marker'};
        if(typeof saveNow==='function')saveNow();
        return;
      }
      var result=compensateExistingRaidMinerai(S);
      if(!result.applied)return;
      try{if(typeof localStorage!=='undefined')localStorage.setItem(COMPENSATION_LOCAL_KEY,'1');}catch(_){}
      if(typeof saveNow==='function')saveNow();
      if(result.amount>0&&typeof toast==='function'){
        toast('Rattrapage Raid Minerai · +'+Math.floor(result.amount).toLocaleString('fr-FR')+' Minerai (différence uniquement)',true);
      }
    }catch(_){}
  }
  setTimeout(runCompensationOnce,0);
})();