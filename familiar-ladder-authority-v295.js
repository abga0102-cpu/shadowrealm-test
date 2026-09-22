/* SHADOWREACH V295 · Familiar ladder authority
   Restores the approved Familiar ladder without rewriting legacy saves:
   Commun -> Peu commun -> Rare -> Epique -> Mythique -> Ancestral -> Legendaire -> Divin.
   Ancestral is a fusion progression tier (not a direct pre-Ascension summon).
   Approved fusion requirements through Ancestral -> Legendaire: 4 / 4 / 5 / 5 / 5 / 6.
   Familiar summon-rate policy is owned by V296.

   V334 hardens the authority against stale/legacy runtime ladders. The whole
   pet rarity order is normalized, so a cached ladder that still says
   Commun -> Rare can no longer make a Commun fusion skip Peu commun. */
(function(){'use strict';
if(window.__srFamiliarLadderV295)return;window.__srFamiliarLadderV295=true;
var APPROVED_ORDER=['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE','ANCESTRAL','LEGENDAIRE','DIVIN'];
function normalizeFamiliarLadder(){
  if(typeof PET_RARITY_ORDER==='undefined'||!Array.isArray(PET_RARITY_ORDER))return false;
  var same=PET_RARITY_ORDER.length===APPROVED_ORDER.length;
  if(same){for(var i=0;i<APPROVED_ORDER.length;i++){if(PET_RARITY_ORDER[i]!==APPROVED_ORDER[i]){same=false;break;}}}
  if(same)return false;
  PET_RARITY_ORDER.splice.apply(PET_RARITY_ORDER,[0,PET_RARITY_ORDER.length].concat(APPROVED_ORDER));
  return true;
}
try{normalizeFamiliarLadder();}catch(_){ }
try{
  if(typeof PET_FUSE_NEED!=='undefined'){
    PET_FUSE_NEED.COMMUN=4;
    PET_FUSE_NEED.PEU_COMMUN=4;
    PET_FUSE_NEED.RARE=5;
    PET_FUSE_NEED.EPIQUE=5;
    PET_FUSE_NEED.MYTHIQUE=5;
    PET_FUSE_NEED.ANCESTRAL=6;
  }
}catch(_){ }
try{if(typeof S!=='undefined'&&S){S.familiarLadderVersion=295;if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srNormalizeFamiliarLadderV295=normalizeFamiliarLadder;
window.__srFamiliarLadderConfigV295={order:APPROVED_ORDER.slice(),fusion:{COMMUN:4,PEU_COMMUN:4,RARE:5,EPIQUE:5,MYTHIQUE:5,ANCESTRAL:6},ancestralDirectSummon:false,rateOwner:'V296'};
})();

/* V421 · Gold economy and Autonomy authority
   Gold Autonomy base stays at 15% of Raid Or reward per hour.
   Gain/Or Autonomy nodes stay +1.25% per level.
   Global Gold nodes use tier caps +5% / +10% / +15% / +20% (+50% total).
   Time Autonomy uses +10% / +20% / +30% / +40% by tier (+100% total),
   taking the base storage window from 8h to a hard 16h maximum. */
(function(){'use strict';
if(window.__srGoldEconomyBalanceV335)return;window.__srGoldEconomyBalanceV335=true;
var AUTO=['n1_07','n2_07','n3_07','n4_07'];
var TIME=['n1_08','n2_08','n3_08','n4_08'];
var GLOBAL=['n1_06','n2_06','n3_06','n4_06'];
var R={n1_07:'I',n2_07:'II',n3_07:'III',n4_07:'IV'};
var TIME_PER={n1_08:2,n2_08:4,n3_08:6,n4_08:8};
var TIME_CAP={n1_08:10,n2_08:20,n3_08:30,n4_08:40};
var GLOBAL_PER={n1_06:1,n2_06:2,n3_06:3,n4_06:4};
var GLOBAL_CAP={n1_06:5,n2_06:10,n3_06:15,n4_06:20};
try{
  if(typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID){
    AUTO.forEach(function(id){var n=TREE_BY_ID[id];if(!n)return;n.per=1.25;n.label='Or d’Autonomie '+R[id];n.short='Or Auton. '+R[id];n.note='+1,25 % d’or d’Autonomie par niveau · Max +6,25 %';});
    TIME.forEach(function(id){var n=TREE_BY_ID[id];if(!n)return;n.per=TIME_PER[id];n.tierScale=false;n.note='+'+TIME_PER[id]+' % de durée par niveau · Max +'+TIME_CAP[id]+' % · Plafond global 16 h';});
    GLOBAL.forEach(function(id){var n=TREE_BY_ID[id];if(!n)return;n.per=GLOBAL_PER[id];n.tierScale=false;n.note='+'+GLOBAL_PER[id]+' % d’or global par niveau · Max +'+GLOBAL_CAP[id]+' %';});
  }
}catch(_){ }
try{
  if(typeof harvestRates==='function'&&!harvestRates.__srGoldEconomyV335){
    var oldHarvestRates=harvestRates;
    harvestRates=function(s){var r=oldHarvestRates(s);if(r&&isFinite(Number(r.gold)))r.gold=Number(r.gold)*0.60;return r;};
    harvestRates.__srGoldEconomyV335=true;
  }
}catch(_){ }
window.__srGoldEconomyConfigV335={autonomyBaseRaidSharePerHour:15,autonomyNodePerLevelPct:1.25,autonomyBranchMaxPct:25,autonomyEffectiveRaidShareAtMaxPct:18.75,globalGoldTierCapsPct:[5,10,15,20],globalGoldBranchMaxPct:50};
window.__srAutonomyTimeConfigV421={baseHours:8,tierCapsPct:[10,20,30,40],branchMaxPct:100,maxHours:16};
try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }
})();
