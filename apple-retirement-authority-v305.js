/* SHADOWREACH V305 · Apple retirement authority
   Final additive retirement of the obsolete Apple progression system.
   Approved design: Familiars progress only through rarity/species/fusion/Ascension.
   Legacy Apple fields are preserved inert in saves for compatibility, but Apples
   can no longer be earned, spent, refunded, surfaced as a usable resource or
   referenced by the old Rebirth upgrade registry. */
(function(){'use strict';
if(window.__srAppleRetirementV305)return;window.__srAppleRetirementV305=true;

/* Gameplay: no Apple faucet, sink or refund path remains active. */
try{if(typeof megaAppleBaseReward==='function')megaAppleBaseReward=function(){return 0;};}catch(_){ }
try{if(typeof megaAppleFirstClearReward==='function')megaAppleFirstClearReward=function(){return 0;};}catch(_){ }
try{if(typeof petAppleInvestmentAtLevel==='function')petAppleInvestmentAtLevel=function(){return 0;};}catch(_){ }
try{if(typeof petAppleInvestment==='function')petAppleInvestment=function(){return 0;};}catch(_){ }
try{if(typeof petAppleInvestmentTotal==='function')petAppleInvestmentTotal=function(){return 0;};}catch(_){ }
try{if(typeof petUpgradeCost==='function')petUpgradeCost=function(){return Infinity;};}catch(_){ }
try{if(typeof upgradePet==='function')upgradePet=function(){return false;};}catch(_){ }

/* Legacy Rebirth definition is already retired by V281; remove the Apple entry
   here as a second authority so no earlier-loaded registry can expose it. */
try{
  if(typeof REBIRTH_UPGRADES!=='undefined'&&Array.isArray(REBIRTH_UPGRADES)){
    for(var i=REBIRTH_UPGRADES.length-1;i>=0;i--){
      var u=REBIRTH_UPGRADES[i]||{};
      if(String(u.key||'').toLowerCase()==='apples'||/pomme/i.test(String(u.label||'')))REBIRTH_UPGRADES.splice(i,1);
    }
  }
}catch(_){ }

/* Resource info popup: Apples are no longer a live currency. */
try{if(typeof RESOURCE_INFO!=='undefined'&&RESOURCE_INFO&&RESOURCE_INFO.apples)delete RESOURCE_INFO.apples;}catch(_){ }

/* Do NOT delete S.apples / applesInvested. Old saves keep historical values so
   migrations remain reversible and no player data is destructively rewritten. */
try{
  if(typeof S!=='undefined'&&S){
    S.appleRetirementVersion=305;
    if(typeof saveNow==='function')saveNow();
    if(typeof scheduleRender==='function')scheduleRender();
  }
}catch(_){ }

window.__srAppleRetirementConfigV305={
  earn:false,spend:false,refund:false,resourceVisible:false,
  legacyFieldsPreserved:true,familiarProgression:['rarity','species','fusion','ascension']
};
})();
