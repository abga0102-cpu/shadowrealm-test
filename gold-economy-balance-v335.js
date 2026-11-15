/* SHADOWREACH V420 · Gold economy balance
   - Gold Autonomy base rate: 25% -> 15% of current Raid Or reward per hour.
   - Autonomy Gold nodes stay at +1.25% per level (max +6.25% each, +25% total).
   - Global Gold nodes: tier caps +5% / +10% / +15% / +20% (+50% total).
   - Clarifies the autonomy node labels in the tree UI. */
(function(){
  'use strict';
  if(window.__srGoldEconomyBalanceV335)return;
  window.__srGoldEconomyBalanceV335=true;

  var AUTONOMY_IDS=['n1_07','n2_07','n3_07','n4_07'];
  var AUTONOMY_TIME_IDS=['n1_08','n2_08','n3_08','n4_08'];
  var GLOBAL_GOLD_IDS=['n1_06','n2_06','n3_06','n4_06'];
  var roman={n1_07:'I',n2_07:'II',n3_07:'III',n4_07:'IV'};
  var autonomyTimePer={n1_08:2,n2_08:4,n3_08:6,n4_08:8};
  var autonomyTimeCap={n1_08:10,n2_08:20,n3_08:30,n4_08:40};
  var globalPer={n1_06:1,n2_06:2,n3_06:3,n4_06:4};
  var globalCap={n1_06:5,n2_06:10,n3_06:15,n4_06:20};

  try{
    if(typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID){
      AUTONOMY_IDS.forEach(function(id){
        var n=TREE_BY_ID[id];
        if(!n)return;
        n.per=1.25;
        n.label='Or d’Autonomie '+roman[id];
        n.short='Or Auton. '+roman[id];
        n.note='+1,25 % d’or d’Autonomie par niveau · Max +6,25 %';
      });
      AUTONOMY_TIME_IDS.forEach(function(id){
        var node=TREE_BY_ID[id];
        if(!node)return;
        node.per=autonomyTimePer[id];
        node.tierScale=false;
        node.note='+'+autonomyTimePer[id]+' % de durée par niveau · Max +'+autonomyTimeCap[id]+' % · Plafond global 16 h';
      });
      GLOBAL_GOLD_IDS.forEach(function(id){
        var n=TREE_BY_ID[id];
        if(!n)return;
        n.per=globalPer[id];
        n.tierScale=false;
        n.note='+'+globalPer[id]+' % d’or global par niveau · Max +'+globalCap[id]+' %';
      });
    }
  }catch(_){ }

  /* harvestRates already includes the autonomy tree multiplier. Scale only the
     gold component so the base share becomes 15% instead of 25%; every other
     passive resource remains untouched. */
  try{
    if(typeof harvestRates==='function'&&!harvestRates.__srGoldEconomyV335){
      var previousHarvestRates=harvestRates;
      harvestRates=function(s){
        var rates=previousHarvestRates(s);
        if(rates&&isFinite(Number(rates.gold)))rates.gold=Number(rates.gold)*0.60;
        return rates;
      };
      harvestRates.__srGoldEconomyV335=true;
    }
  }catch(_){ }

  window.__srGoldEconomyConfigV335={
    autonomyBaseRaidSharePerHour:15,
    autonomyNodePerLevelPct:1.25,
    autonomyNodeMaxPct:6.25,
    autonomyBranchMaxPct:25,
    autonomyEffectiveRaidShareAtMaxPct:18.75,
    globalGoldTierCapsPct:[5,10,15,20],
    globalGoldBranchMaxPct:50
  };
  window.__srAutonomyTimeConfigV421={baseHours:8,tierCapsPct:[10,20,30,40],branchMaxPct:100,maxHours:16};
})();
