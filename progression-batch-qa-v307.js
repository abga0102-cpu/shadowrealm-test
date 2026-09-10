/* SHADOWREACH V307 · Progression batch QA
   One additive integration layer for several verified cross-system QA points.
   It does not rebalance approved economies or erase legacy data.

   - Completes direct Ancestral Familiar summons with a real hatch timer.
   - Prevents any unknown/invalid egg timer from writing NaN into a save.
   - Hardens rarity rolls against non-finite legacy/authority values without
     changing valid distributions.
   - Keeps the approved Familiar rule: Ancestral = 0% before max mastery and
     exactly 5% at max mastery.
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

/* ---------- Rarity integrity ---------- */
function finiteRate(v){v=Number(v);return isFinite(v)&&v>0?v:0;}
function normalizeTable(src,order){
  var out={},sum=0;
  (order||[]).forEach(function(r){var v=finiteRate(src&&src[r]);out[r]=v;sum+=v;});
  if(sum<=0){if(order&&order.length)out[order[0]]=100;return out;}
  (order||[]).forEach(function(r){out[r]=out[r]/sum*100;});
  return out;
}
try{
  if(typeof getRates==='function'&&!getRates.__srV307){
    var oldGetRates=getRates;
    getRates=function(system,mastery,ascension,stars){
      var out=oldGetRates.apply(this,arguments);
      if(system!=='pet'||!out)return out;
      var order=(typeof PET_RARITY_ORDER!=='undefined'&&Array.isArray(PET_RARITY_ORDER))?PET_RARITY_ORDER.slice():Object.keys(out);
      var clean=normalizeTable(out,order);
      var max=50;try{if(typeof masteryMax==='function')max=Math.max(0,Number(masteryMax('pet'))||50);}catch(_){ }
      var target=Math.max(0,Number(mastery)||0)>=max?5:0;
      var current=finiteRate(clean.ANCESTRAL);
      if(Math.abs(current-target)>1e-9){
        var others=order.filter(function(r){return r!=='ANCESTRAL';});
        var otherSum=others.reduce(function(n,r){return n+finiteRate(clean[r]);},0);
        var available=Math.max(0,100-target);
        if(otherSum>0)others.forEach(function(r){clean[r]=finiteRate(clean[r])/otherSum*available;});
        else if(others.length)clean[others[0]]=available;
        clean.ANCESTRAL=target;
      }
      return clean;
    };
    getRates.__srV307=true;getRates.__srPrevious=oldGetRates;
  }
}catch(_){ }

/* Valid tables use the old roll exactly. The fallback path is used only if an
   authority/legacy table contains NaN, Infinity, negatives or a zero total. */
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
  dustChanceHigh:safe(function(){return itemUpgradeChance({level:999});}),
  dustCost0:safe(function(){return itemUpgradeCost({level:0});}),
  forgeStar1:safe(function(){return ascendPowerMul(1,'forge');}),
  skillStar1:safe(function(){return ascendPowerMul(1,'skill');}),
  petStars:safe(function(){return [ascendPowerMul(1,'pet'),ascendPowerMul(2,'pet'),ascendPowerMul(3,'pet')];}),
  treeTotalPE:safe(function(){return treeTotalPE();})
};
audit.ok=!!(
  audit.ancestralHatchSeconds===57600&&audit.ancestralRateBeforeMax===0&&Math.abs(audit.ancestralRateAtMax-5)<1e-6&&
  audit.raidEvolution1===100&&audit.raidEvolution50===247&&audit.raidSkill1===250&&audit.raidSkill50===740&&
  audit.raidPet1===250&&audit.raidPet50===740&&audit.dustChanceHigh===5&&audit.dustCost0===60&&
  audit.forgeStar1===2&&audit.skillStar1===1.5&&Array.isArray(audit.petStars)&&audit.petStars[0]===1.5&&audit.petStars[1]===2.1&&audit.petStars[2]===3
);
window.__srProgressionAuditV307=audit;

try{if(typeof S!=='undefined'&&S){S.progressionBatchQAVersion=307;if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srProgressionBatchQAConfigV307={
  ancestralHatchHours:16,
  ancestralDirectRateAtMax:5,
  invalidRarityGuard:true,
  deprecatedTreeKeysExcludedFromTotals:true,
  destructiveMigration:false,
  economyRebalanced:false,
  saveSchemaChanged:false
};
})();
