/* SHADOWREACH · Sanctuary pause: preserve previously activated reward boosts.
   The Sanctuary UI, board actions and endgame module stay unloaded.
   This is the reward-only portion of sanctuary-endgame-v130.js (normalizeActive,
   boostMultiplier and the three reward wrappers), with no board initialization. */
(function(){
  'use strict';
  if(window.__SHADOWREACH_SANCTUARY_PAUSED!==true || window.__srSanctuaryPauseBoostsV1)return;
  window.__srSanctuaryPauseBoostsV1=true;

  function normalizeActive(type){
    var st=typeof S!=='undefined' && S && S.sanctuary;
    if(!st || !st.activeBoosts || typeof st.activeBoosts!=='object')return null;
    var a=st.activeBoosts[type],now=Date.now();
    if(!a)return null;
    a.queue=Array.isArray(a.queue)?a.queue:[];
    while(a && Number(a.end||0)<=now){
      if(!a.queue.length){delete st.activeBoosts[type];return null;}
      var n=a.queue.shift(),start=Number(a.end)||now;
      a={pct:Number(n.pct)||0,end:start+(Number(n.mins)||0)*60000,queue:a.queue};
      st.activeBoosts[type]=a;
    }
    return a;
  }
  function boostMultiplier(type){
    var a=normalizeActive(type);
    return a?1+(Number(a.pct)||0)/100:1;
  }

  // Keep the original reward multipliers, without loading any Sanctuary actions.
  if(typeof goldReward==='function'){
    var previousGoldReward=goldReward;
    goldReward=function(){return previousGoldReward.apply(this,arguments)*boostMultiplier('gold');};
  }
  if(typeof expReward==='function'){
    var previousExpReward=expReward;
    expReward=function(){return previousExpReward.apply(this,arguments)*boostMultiplier('xp');};
  }
  if(typeof prFromFloor==='function'){
    var previousPrFromFloor=prFromFloor;
    prFromFloor=function(){return previousPrFromFloor.apply(this,arguments)*boostMultiplier('pr');};
  }
})();
