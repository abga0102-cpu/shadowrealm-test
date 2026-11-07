/* SHADOWREACH V342 · Pending boss progression fix
   A boss defeat may send the player back to the preceding stage, but clearing
   that stage again must immediately reopen the pending boss instead of looping
   the player forever on the same stage. */
(function(){
'use strict';
if(window.__srBossRetryProgressionV342)return;
window.__srBossRetryProgressionV342=true;

if(typeof handleCombatEnd!=='function')return;
var previousHandleCombatEnd=handleCombatEnd;

handleCombatEnd=function(c){
  var releasePendingBoss=false;
  var pendingBoss=0;
  var clearedFloor=0;

  try{
    pendingBoss=Math.floor(Number(S&&S.pendingBossFloor)||0);
    clearedFloor=Math.floor(Number(c&&c.floor)||0);
    var waveCount=typeof campaignWaveCount==='function'?campaignWaveCount(clearedFloor):1;
    releasePendingBoss=!!(
      c&&c.ctx==='campaign'&&c.status==='won'&&
      pendingBoss===clearedFloor+1&&
      typeof isBoss==='function'&&isBoss(pendingBoss)&&
      Number(c.step)>=Number(waveCount)
    );
  }catch(_){ }

  var out=previousHandleCombatEnd.apply(this,arguments);

  if(releasePendingBoss){
    try{
      if(typeof S!=='undefined'&&S&&
         Number(S.pendingBossFloor||0)===pendingBoss&&
         Number(S.floor||0)===clearedFloor){
        S.pendingBossFloor=0;
        S.floor=pendingBoss;
        S.step=1;
        S.recordFloor=Math.max(Number(S.recordFloor)||1,pendingBoss);
        if(typeof saveNow==='function')saveNow();
        if(typeof scheduleRender==='function')scheduleRender();
      }
    }catch(_){ }
  }

  return out;
};
handleCombatEnd.__srBossRetryProgressionV342=true;
handleCombatEnd.__srPrevious=previousHandleCombatEnd;
})();
