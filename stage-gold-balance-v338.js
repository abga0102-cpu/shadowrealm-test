/* SHADOWREACH V338 · Campaign stage gold balance
   Slightly raises base campaign gold while preserving the existing progression curve.
   Raid rewards and tree bonuses are untouched. */
(function(){
  'use strict';
  if(window.__srStageGoldBalanceV338)return;
  window.__srStageGoldBalanceV338=true;

  var MUL=1.10;

  try{
    if(typeof goldReward==='function'&&!goldReward.__srStageGoldBalanceV338){
      var previousGoldReward=goldReward;
      goldReward=function(floor){
        return Math.max(1,Math.floor(Number(previousGoldReward.apply(this,arguments)||0)*MUL));
      };
      goldReward.__srStageGoldBalanceV338=true;
    }
  }catch(_){ }

  window.__srStageGoldBalanceConfigV338={baseGoldMultiplier:MUL,baseGoldIncreasePct:10};
})();