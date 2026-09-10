/* SHADOWREACH V300 · Dust upgrade chance authority
   Additive authority layer. Restores the approved progression curve after V292:
   - 100% below +70
   - then -5 percentage points every 2 levels
   - natural chance may reach 0% at extreme levels
   No cap is added to equipment upgrade level. Security papers remain separate. */
(function(){
  'use strict';
  if(window.__srDustChanceAuthorityV300)return;
  window.__srDustChanceAuthorityV300=true;

  function chance(level){
    level=Math.max(0,Math.floor(Number(level)||0));
    if(level<70)return 100;
    return Math.max(0,95-5*Math.floor((level-70)/2));
  }

  window.__srV300UpgradeChance=chance;
  try{
    if(typeof itemUpgradeChance==='function'){
      itemUpgradeChance=function(it){return chance((it&&it.level)||0);};
      itemUpgradeChance.__srV300=true;
    }
  }catch(_){ }

  try{
    window.__srProgressionOverhaulConfigV300={
      minimumUpgradeChance:0,
      noUpgradeLevelCap:true,
      upgradeChance:chance,
      supersedesChanceAuthority:292
    };
  }catch(_){ }
})();