/* SHADOWREACH V292 · Poussière upgrade chance floor
   Additive authority layer. Keeps V283's approved curve, but prevents natural
   upgrade chance from becoming mathematically impossible: minimum 5% from the
   point where the old formula would fall below 5%. Security papers remain a
   separate future system and are not introduced here. */
(function(){
  'use strict';
  if(window.__srDustChanceFloorV292)return;
  window.__srDustChanceFloorV292=true;

  function chance(level){
    level=Math.max(0,Math.floor(Number(level)||0));
    if(level<70)return 100;
    return Math.max(5,95-5*Math.floor((level-70)/2));
  }

  window.__srV292UpgradeChance=chance;
  try{ if(typeof itemUpgradeChance==='function') itemUpgradeChance=function(it){return chance((it&&it.level)||0);}; }catch(_){ }
  try{ window.__srProgressionOverhaulConfigV292={minimumUpgradeChance:5,upgradeChance:chance}; }catch(_){ }
})();
