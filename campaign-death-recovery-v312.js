/* SHADOWREACH V312 · Campaign death recovery guard
   A campaign defeat must never leave the terminal combat object installed.
   The canonical engine still owns rewards/checkpoints; this guard only makes the
   final restart synchronous and provides an idempotent checkpoint fallback if
   that settlement throws before installing the next fight. */
(function(){
  'use strict';
  if(window.__srCampaignDeathRecoveryV312)return;
  window.__srCampaignDeathRecoveryV312=true;
  if(typeof handleCombatEnd!=='function'||typeof startCampaign!=='function')return;

  var baseHandleCombatEnd=handleCombatEnd;

  function isCampaignLoss(c){
    return !!c&&c.status==='lost'&&c.ctx!=='raid'&&c.ctx!=='mega'&&c.ctx!=='arenaLive';
  }

  function forceRecovery(c,reason){
    var statePatched=false;
    try{
      if(typeof update==='function'){
        update(function(s){
          var floor=Math.max(1,Math.floor(Number(c&&c.floor)||Number(s.floor)||1));
          var cp=Math.max(1,Math.floor(Number(s.checkpoint)||1));
          if(c&&c.boss){s.pendingBossFloor=floor;s.floor=Math.max(1,floor-1);}
          else{s.floor=Math.max(cp,floor-1);}
          s.step=1;
        });
        statePatched=true;
      }
    }catch(e){try{console.error('campaign death recovery state update',e);}catch(_){}}

    if(!statePatched){
      try{
        var floor=Math.max(1,Math.floor(Number(c&&c.floor)||Number(S&&S.floor)||1));
        var cp=Math.max(1,Math.floor(Number(S&&S.checkpoint)||1));
        if(c&&c.boss){S.pendingBossFloor=floor;S.floor=Math.max(1,floor-1);}
        else S.floor=Math.max(cp,floor-1);
        S.step=1;
        if(typeof refreshDerived==='function')refreshDerived();
        if(typeof dirty!=='undefined')dirty=true;
      }catch(e){try{console.error('campaign death recovery direct fallback',e);}catch(_){}}
    }

    try{
      combat=spawnCampaign(S);
      if(combat)combat.__srRecoveredV312=true;
      if(typeof scheduleRender==='function')scheduleRender();
      return true;
    }catch(e){
      try{console.error('campaign death recovery respawn',reason||e,e);}catch(_){ }
      return false;
    }
  }

  handleCombatEnd=function(c){
    if(!isCampaignLoss(c))return baseHandleCombatEnd.apply(this,arguments);

    var previousSetTimeout=window.setTimeout;
    var restartTriggered=false;
    window.setTimeout=function(fn,delay){
      if(!restartTriggered&&fn===startCampaign&&Number(delay)===40){
        restartTriggered=true;
        try{startCampaign();}
        catch(e){forceRecovery(c,e);}
        return 0;
      }
      return previousSetTimeout.apply(this,arguments);
    };

    try{
      var out=baseHandleCombatEnd.apply(this,arguments);
      if(!restartTriggered&&(!combat||combat===c||combat.status!=='fight'))forceRecovery(c,'canonical restart missing');
      return out;
    }catch(e){
      try{console.error('campaign death settlement failed',e);}catch(_){ }
      forceRecovery(c,e);
      return undefined;
    }finally{
      window.setTimeout=previousSetTimeout;
    }
  };

  try{window.handleCombatEnd=handleCombatEnd;}catch(_){ }
  window.__srCampaignDeathRecoveryConfigV312={
    synchronousRestart:true,
    checkpointFallback:true,
    wrapsCampaignLossOnly:true
  };
})();
