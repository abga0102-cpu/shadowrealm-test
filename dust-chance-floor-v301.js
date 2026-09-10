/* SHADOWREACH V301 · Dust chance minimum authority
   Restores the approved minimum 5% upgrade chance after V300 temporarily
   removed it. Additive authority only: prior versions remain preserved.
*/
(function(){
  'use strict';
  if(window.__srDustChanceFloorV301)return;
  window.__srDustChanceFloorV301=true;

  function chance(level){
    level=Math.max(0,Math.floor(Number(level)||0));
    if(level<70)return 100;
    return Math.max(5,95-5*Math.floor((level-70)/2));
  }

  window.__srV301UpgradeChance=chance;
  try{ if(typeof itemUpgradeChance==='function') itemUpgradeChance=function(it){return chance((it&&it.level)||0);}; }catch(_){ }
  try{ window.__srProgressionOverhaulConfigV301={minimumUpgradeChance:5,upgradeChance:chance}; }catch(_){ }
})();
