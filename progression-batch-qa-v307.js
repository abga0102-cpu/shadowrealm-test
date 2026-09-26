/* SHADOWREACH V307 · Progression batch QA
   One additive integration layer for several verified cross-system QA points.
   It does not rebalance approved economies or erase legacy data.

   - Completes direct Ancestral Familiar summons with a real hatch timer.
   - Prevents any unknown/invalid egg timer from writing NaN into a save.
   - Hardens rarity rolls against non-finite legacy/authority values without
     changing valid distributions.
   - Keeps Familiar summon-rate policy owned by V296.
   - Makes the Tree total-PE diagnostic ignore deprecated legacy key nodes.
   - Exposes a compact runtime progression audit for future QA.
*/
(function(){'use strict';
if(window.__srProgressionBatchQAV307)return;window.__srProgressionBatchQAV307=true;

/* ---------- Familiar Ancestral hatch integration ---------- */
try{
  if(typeof EGG_TIMERS!=='undefined'&&EGG_TIMERS){
    /* Geometric midpoint between Mythique (10h) and Legendaire (24h), rounded
       to a clean gameplay value. This only fills the previously missing tier. */
    if(!(Number(EGG_TIMERS.ANCESTRAL)>0))EGG_TIMERS.ANCESTRAL=16*3600;
  }
}catch(_){ }

/* Never allow an unsupported rarity to create hatchEnd = NaN. All currently
   supported rarities keep the exact same startEgg path and timing. */
try{
  if(typeof startEgg==='function'&&!startEgg.__srV307){
    var oldStartEgg=startEgg;
    startEgg=function(id){
      try{
        var egg=(typeof S!=='undefined'&&S&&Array.isArray(S.eggs))?S.eggs.find(function(e){return e&&e.id===id;}):null;
        if(egg){
          var timer=(typeof EGG_TIMERS!=='undefined'&&EGG_TIMERS)?Number(EGG_TIMERS[egg.rarity]):NaN;
          if(!isFinite(timer)||timer<=0)return false;
        }
      }catch(_){return false;}
      return oldStartEgg.apply(this,arguments);
    };
    startEgg.__srV307=true;startEgg.__srPrevious=oldStartEgg;
  }
}catch(_){ }

/* ---------- Rarity integrity ----------
   Familiar getRates() normalization and the max-mastery Ancestral policy live
   in V296. V307 only guards the generic rarity roll fallback. */
try{
  if(typeof rollRarity==='function'&&!rollRarity.__srV307){
    var oldRollRarity=rollRarity;
    rollRarity=function(rates,order){
      var list=order||((typeof RARITY_ORDER!=='undefined'&&RARITY_ORDER)||[]),dirty=false,total=0,vals=[];
      try{
        for(var i=0;i<list.length;i++){
          var raw=Number(rates&&rates[list[i]]),v=(isFinite(raw)&&raw>=0)?raw:0;
          if(!isFinite(raw)||raw<0)dirty=true;
          vals.push(v);total+=v;
        }
      }catch(_){dirty=true;}
      if(!dirty&&total>0)return oldRollRarity.apply(this,arguments);
      if(!(total>0))return list[0]||'COMMUN';
      var x=Math.random()*total,acc=0;
      for(var j=0;j<list.length;j++){acc+=vals[j]||0;if(x<=acc)return list[j];}
      return list[0]||'COMMUN';
    };
    rollRarity.__srV307=true;rollRarity.__srPrevious=oldRollRarity;
  }
}catch(_){ }

/* ---------- Tree diagnostic accuracy ---------- */
try{
  if(typeof treeTotalPE==='function'){
    treeTotalPE=function(){
      var total=0;
      try{
        TREE_NODES.forEach(function(nd){
          if(!nd||nd.deprecatedKey)return;
          var base=PE_TIER_COST[nd.tier-1];
          total+=Math.max(0,Number(nd.cost)||0);
          for(var lv=1;lv<Math.max(0,Number(nd.max)||0);lv++)total+=Math.round(base*Math.pow(PE_LEVEL_GROWTH,lv-1));
        });
      }catch(_){ }
      return total;
    };
    treeTotalPE.__srV307=true;
  }
}catch(_){ }

/* ---------- Non-destructive runtime QA snapshot ---------- */
function safe(fn){try{return fn();}catch(_){return null;}}
var audit={
  build:307,
  ancestralHatchSeconds:safe(function(){return Number(EGG_TIMERS.ANCESTRAL)||0;}),
  ancestralRateBeforeMax:safe(function(){return Number(getRates('pet',49,0,0).ANCESTRAL)||0;}),
  ancestralRateAtMax:safe(function(){return Number(getRates('pet',50,0,0).ANCESTRAL)||0;}),
  raidEvolution1:safe(function(){return raidReward('evolution',1);}),
  raidEvolution50:safe(function(){return raidReward('evolution',50);}),
  raidSkill1:safe(function(){return raidReward('competence',1);}),
  raidSkill50:safe(function(){return raidReward('competence',50);}),
  raidPet1:safe(function(){return raidReward('familier',1);}),
  raidPet50:safe(function(){return raidReward('familier',50);}),
  dustChance25:safe(function(){return window.__srV283UpgradeChance?window.__srV283UpgradeChance(25):itemUpgradeChance({level:25});}),
  dustChanceHigh:safe(function(){return window.__srV283UpgradeChance?window.__srV283UpgradeChance(999):itemUpgradeChance({level:999});}),
  dustCost0:safe(function(){return window.__srV283DustCost?window.__srV283DustCost(0):itemUpgradeCost({level:0});}),
  dustCost10:safe(function(){return window.__srV283DustCost?window.__srV283DustCost(10):itemUpgradeCost({level:10});}),
  forgeStar1:safe(function(){return ascendPowerMul(1,'forge');}),
  skillStar1:safe(function(){return ascendPowerMul(1,'skill');}),
  petStars:safe(function(){return [ascendPowerMul(1,'pet'),ascendPowerMul(2,'pet'),ascendPowerMul(3,'pet')];}),
  treeTotalPE:safe(function(){return treeTotalPE();})
};
audit.ok=!!(
  audit.ancestralHatchSeconds===57600&&audit.ancestralRateBeforeMax===0&&Math.abs(audit.ancestralRateAtMax-5)<1e-6&&
  audit.raidEvolution1===100&&audit.raidEvolution50===247&&audit.raidSkill1===250&&audit.raidSkill50===740&&
  audit.raidPet1===250&&audit.raidPet50===740&&audit.dustChance25===95&&audit.dustChanceHigh===5&&
  audit.dustCost0===30&&audit.dustCost10===210&&
  audit.forgeStar1===2&&audit.skillStar1===1.5&&Array.isArray(audit.petStars)&&audit.petStars[0]===1.5&&audit.petStars[1]===2.1&&audit.petStars[2]===3
);
window.__srProgressionAuditV307=audit;

try{if(typeof S!=='undefined'&&S){S.progressionBatchQAVersion=307;if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srProgressionBatchQAConfigV307={
  ancestralHatchHours:16,
  ancestralDirectRateAtMax:5,
  invalidRarityGuard:true,
  familiarRateOwner:'V296',
  deprecatedTreeKeysExcludedFromTotals:true,
  destructiveMigration:false,
  economyRebalanced:false,
  saveSchemaChanged:false
};
})();