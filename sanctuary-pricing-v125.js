/* SANCTUARY_PRICING_V125
   Direct purchases now follow the real 2->1 Merge economy.
   Each supplier bracket only discounts the rarity currently being progressed.
   Older unlocked rarities keep the best price reached in their own bracket.
*/
(function(){
  if (window.__srSanctuaryPricingV125) return;
  window.__srSanctuaryPricingV125 = true;

  if (typeof sanctSupplierPrice !== "function") return;
  const previousPrice = sanctSupplierPrice;

  const TABLE = {
    COMMUN:      { unlock:1,  prices:[250,240,230,225] },
    PEU_COMMUN:  { unlock:5,  prices:[600,575,550,525] },
    RARE:        { unlock:9,  prices:[1200,1150,1100,1050] },
    EPIQUE:      { unlock:13, prices:[2400,2300,2100] }
  };

  function balancedPrice(level, rarity){
    const def = TABLE[rarity];
    if (!def) return previousPrice(level, rarity);
    const lv = Math.max(def.unlock, Math.floor(Number(level) || def.unlock));
    const idx = Math.max(0, Math.min(def.prices.length - 1, lv - def.unlock));
    return def.prices[idx];
  }

  sanctSupplierPrice = function(level, rarity){
    return balancedPrice(level, rarity);
  };

  /* Existing players keep every supplier level and every gauge purchase.
     Because those tracked purchases were paid at the previous, much higher
     prices, refund only the verifiable difference once. Level 15 free buying is
     deliberately excluded because the save does not track how many purchases
     were made after the gauge was completed. */
  try {
    if (typeof S !== "undefined" && S && S.sanctuary && !S.sanctuaryPricingRebaseV125 &&
        typeof sanctSupplierNeed === "function" && typeof sanctSupplierTier === "function") {
      const st = S.sanctuary;
      const lvl = Math.max(1, Math.min(15, Math.floor(Number(st.supplierLevel) || 1)));
      const progress = Math.max(0, Math.floor(Number(st.supplierProgress) || 0));
      let refund = 0, purchases = 0;

      for (let l = 1; l < lvl && l < 15; l++) {
        const n = Math.max(0, Math.floor(Number(sanctSupplierNeed(l)) || 0));
        const rarity = sanctSupplierTier(l);
        const oldP = Math.max(0, Number(previousPrice(l, rarity)) || 0);
        const newP = balancedPrice(l, rarity);
        refund += Math.max(0, oldP - newP) * n;
        purchases += n;
      }
      if (lvl < 15) {
        const n = Math.min(progress, Math.max(0, Math.floor(Number(sanctSupplierNeed(lvl)) || 0)));
        const rarity = sanctSupplierTier(lvl);
        const oldP = Math.max(0, Number(previousPrice(lvl, rarity)) || 0);
        const newP = balancedPrice(lvl, rarity);
        refund += Math.max(0, oldP - newP) * n;
        purchases += n;
      }

      refund = Math.round(refund);
      S.sanctuaryPricingRebaseV125 = true;
      S.sanctuaryPricingRebaseNoticeV125 = { level:lvl, progress:progress, purchases:purchases, refundGold:refund };
      if (refund > 0) S.gold = Math.max(0, Number(S.gold) || 0) + refund;
      if (typeof dirty !== "undefined") dirty = true;
      if (typeof saveNow === "function") saveNow();
      if (refund > 0 && typeof toast === "function") toast("Sanctuaire rééquilibré · +" + (typeof fmt === "function" ? fmt(refund) : refund) + " Or remboursé", true);
      if (typeof render === "function") render();
    }
  } catch (e) {
    console.warn("Sanctuary pricing v125 migration failed", e);
  }
})();

/* IMPORT_GUARD_V206
   Save import must preserve the exact key counts stored in the JSON. */
(function(){
  'use strict';
  if(window.__srImportGuardV206)return;
  window.__srImportGuardV206=true;
  if(typeof ACT!=='object'||!ACT)return;

  ACT.importSave=function(){
    const inp=document.createElement('input');
    inp.type='file';
    inp.accept='.json,application/json';
    inp.onchange=()=>{
      const f=inp.files&&inp.files[0];
      if(!f)return;
      const fr=new FileReader();
      fr.onload=()=>{
        try{
          const raw=JSON.parse(String(fr.result));
          S=migrate(raw,'Héros');
          /* Do NOT call applyDailyReset here. Import is state replacement,
             not a new calendar day. Anchor the imported save to today so the
             normal reset only resumes on the next real day. */
          S.lastKeyReset=todayStr();
          if(raw&&raw.eventDay)S.eventDay=raw.eventDay;
          S.testDays=Math.max(0,Number(S.testDays)||0);
          S.power=computePower(S);
          refreshDerived();
          saveNow();
          startCampaign();
          nav('accueil');
          toast('Sauvegarde importée',true);
        }catch(e){
          console.warn('import save failed',e);
          toast('Fichier invalide');
        }
      };
      fr.readAsText(f);
    };
    inp.click();
  };
})();
