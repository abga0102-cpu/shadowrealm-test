/* SHADOWREACH V302 · Legacy equipment migration preflight
   Prospective fairness guard for old local saves before V283 runs.
   V283 used a deterministic pseudo-random quality when a legacy item had no
   statQuality, while V299 imports use a conservative reconstructed/floor value.
   This preflight gives unmigrated local legacy gear the same conservative 20%
   quality floor before V283 sees it. Existing V283+ items are never touched,
   owned stats are never reduced, and later JSON imports remain owned by V299. */
(function(){
  'use strict';
  if(window.__srLegacyEquipmentPreflightV302)return;
  window.__srLegacyEquipmentPreflightV302=true;

  function prep(it){
    if(!it||!it.rarity)return;
    if(Number(it.powerCurveVersion)>=283)return;
    var q=Number(it.statQuality);
    if(q>0&&q<=1)return;
    it.statQuality=.20;
    it.legacyQualityPreflightVersion=302;
  }

  try{
    if(typeof S!=='undefined'&&S){
      (S.inventory||[]).forEach(prep);
      if(S.equipped)Object.keys(S.equipped).forEach(function(k){prep(S.equipped[k]);});
      S.legacyEquipmentPreflightVersion=302;
    }
  }catch(_){ }

  window.__srLegacyEquipmentPreflightConfigV302={
    appliesBeforeV283:true,
    legacyQualityFloor:.20,
    existingMigratedItemsUntouched:true,
    noStatReduction:true,
    laterImportsRemainV299:true
  };
})();
