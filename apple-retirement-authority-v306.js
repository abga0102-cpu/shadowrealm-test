/* SHADOWREACH V306 · Apple retirement completion
   Additive completion of the approved Apple-system removal after V305.
   V305 already blocks Familiar fusion/Ascension Apple refunds. This layer closes
   the remaining legacy faucets/sinks/UI references without deleting historical
   save fields, so compatibility is preserved and no player data is rewritten. */
(function(){'use strict';
if(window.__srAppleRetirementV306)return;window.__srAppleRetirementV306=true;

/* Remaining gameplay faucet: Mega Boss first-clear Apples. Accelerators and
   Mega clear tracking remain untouched; only the obsolete Apple reward is zero. */
try{if(typeof megaAppleBaseReward==='function')megaAppleBaseReward=function(){return 0;};}catch(_){ }
try{if(typeof megaAppleFirstClearReward==='function')megaAppleFirstClearReward=function(){return 0;};}catch(_){ }

/* Familiar Apple levelling is retired. V283/V286 already disable it; keep one
   final authority late in the stack so older functions cannot become active. */
try{if(typeof petUpgradeCost==='function')petUpgradeCost=function(){return Infinity;};}catch(_){ }
try{if(typeof upgradePet==='function')upgradePet=function(){return false;};}catch(_){ }
try{if(typeof petAppleInvestmentAtLevel==='function')petAppleInvestmentAtLevel=function(){return 0;};}catch(_){ }
try{if(typeof petAppleInvestment==='function')petAppleInvestment=function(){return 0;};}catch(_){ }
try{if(typeof petAppleInvestmentTotal==='function')petAppleInvestmentTotal=function(){return 0;};}catch(_){ }

/* Remove obsolete Apple resource help and any surviving legacy Rebirth upgrade
   definition. Rebirth itself remains governed by V281. */
try{if(typeof RESOURCE_INFO!=='undefined'&&RESOURCE_INFO&&RESOURCE_INFO.apples)delete RESOURCE_INFO.apples;}catch(_){ }
try{
  if(typeof REBIRTH_UPGRADES!=='undefined'&&Array.isArray(REBIRTH_UPGRADES)){
    for(var i=REBIRTH_UPGRADES.length-1;i>=0;i--){
      var u=REBIRTH_UPGRADES[i]||{};
      if(String(u.key||'').toLowerCase()==='apples'||/pomme/i.test(String(u.label||'')))REBIRTH_UPGRADES.splice(i,1);
    }
  }
}catch(_){ }

/* Historical S.apples / applesInvested are deliberately preserved inert.
   No compensation, conversion or destructive migration is introduced. */
try{
  if(typeof S!=='undefined'&&S){
    S.appleRetirementVersion=306;
    if(typeof saveNow==='function')saveNow();
    if(typeof scheduleRender==='function')scheduleRender();
  }
}catch(_){ }

window.__srAppleRetirementConfigV306={
  megaAppleReward:0,
  familiarAppleLevelling:false,
  familiarAppleRefunds:false,
  resourceInfoVisible:false,
  legacyFieldsPreserved:true,
  destructiveMigration:false
};
})();
