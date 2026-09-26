/* SHADOWREACH V301 / V453 · Dust chance minimum authority
   Keeps the approved 5% minimum while preserving V446's +25 risk threshold.
   This is the final runtime chance authority loaded after progression-overhaul.
*/
(function(){
  'use strict';
  if(window.__srDustChanceFloorV301)return;
  window.__srDustChanceFloorV301=true;

  function chance(level){
    level=Math.max(0,Math.floor(Number(level)||0));
    if(level<25)return 100;
    return Math.max(5,95-5*Math.floor((level-25)/2));
  }

  window.__srV301UpgradeChance=chance;
  try{ if(typeof itemUpgradeChance==='function') itemUpgradeChance=function(it){return chance((it&&it.level)||0);}; }catch(_){ }
  try{ window.__srProgressionOverhaulConfigV301={minimumUpgradeChance:5,upgradeChance:chance}; }catch(_){ }
})();
