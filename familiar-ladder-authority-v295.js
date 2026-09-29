/* SHADOWREACH V295 · Familiar ladder authority
   Restores the approved Familiar ladder without rewriting legacy saves:
   Commun -> Peu commun -> Rare -> Epique -> Mythique -> Ancestral -> Legendaire -> Divin.
   Ancestral remains a fusion progression tier and can also be summoned directly
   at max Familiar mastery through the V296 rate authority.
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
window.__srFamiliarLadderConfigV295={order:APPROVED_ORDER.slice(),fusion:{COMMUN:4,PEU_COMMUN:4,RARE:5,EPIQUE:5,MYTHIQUE:5,ANCESTRAL:6},ancestralDirectSummonAtMaxMastery:true,rateOwner:'V296'};
})();

/* V476 · Split Autonomy yields + restored Global Gold authority
   - Or, Minerai, Essence and Étincelles each have their own 5%/h -> 20%/h branch.
   - Existing universal Autonomy investment is copied into all four branches once,
     preserving the yield an old save had before the split.
   - Existing Global Gold nodes now cap at +5% / +10% / +15% / +20% by tier
     for exactly +50% total.
   - Time Autonomy remains 8h base -> 16h maximum. */
(function(){'use strict';
if(window.__srGoldEconomyBalanceV335)return;window.__srGoldEconomyBalanceV335=true;
var TIERS=[1,2,3,4];
var TIME=['n1_08','n2_08','n3_08','n4_08'];
var GLOBAL=['n1_06','n2_06','n3_06','n4_06'];
var GOLD=['n1_07','n2_07','n3_07','n4_07'];
var MIN=['n1_afkmin','n2_afkmin','n3_afkmin','n4_afkmin'];
var ESS=['n1_afkess','n2_afkess','n3_afkess','n4_afkess'];
var ECL=['n1_afkecl','n2_afkecl','n3_afkecl','n4_afkecl'];
var ROM=['I','II','III','IV'];
var AUTO_PER=[0.3,0.6,0.9,1.2];
var AUTO_CAP=[1.5,3,4.5,6];
var TIME_PER=[2,4,6,8];
var TIME_CAP=[10,20,30,40];
var GLOBAL_PER=[1,2,3,4];
var GLOBAL_CAP=[5,10,15,20];

function tuneAutonomy(ids,label,short){
  ids.forEach(function(id,i){
    var n=TREE_BY_ID&&TREE_BY_ID[id];if(!n)return;
    n.per=AUTO_PER[i];n.tierScale=false;
    n.label=label+' '+ROM[i];n.short=short+' '+ROM[i];
    n.note='+'+String(AUTO_PER[i]).replace('.',',')+' point de %/h par niveau · Max 20 %/h avec la base';
  });
}
try{
  if(typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID){
    tuneAutonomy(GOLD,'Autonomie Or','Auton. Or');
    tuneAutonomy(MIN,'Autonomie Minéraux','Auton. Min.');
    tuneAutonomy(ESS,'Autonomie Essence','Auton. Ess.');
    tuneAutonomy(ECL,'Autonomie Étincelles','Auton. Étinc.');
    TIME.forEach(function(id,i){var n=TREE_BY_ID[id];if(!n)return;n.per=TIME_PER[i];n.tierScale=false;n.note='+'+TIME_PER[i]+' % de durée par niveau · Max +'+TIME_CAP[i]+' % · Plafond global 16 h';});
    GLOBAL.forEach(function(id,i){var n=TREE_BY_ID[id];if(!n)return;n.per=GLOBAL_PER[i];n.tierScale=false;n.label='Or obtenu '+ROM[i];n.short='Or obtenu '+ROM[i];n.note='+'+GLOBAL_PER[i]+' % d’or obtenu par niveau · Max +'+GLOBAL_CAP[i]+' %';});
  }
}catch(_){ }

/* Old nX_07 nodes affected all four resources. Copy their saved level once to
   the three newly-created branches while nX_07 itself becomes the Or branch. */
try{
  if(typeof S!=='undefined'&&S&&S.tree&&S.tree.levels&&!S.autonomySplitV476){
    for(var i=0;i<TIERS.length;i++){
      var lv=Math.max(0,Math.min(5,Math.floor(Number(S.tree.levels[GOLD[i]])||0)));
      [MIN[i],ESS[i],ECL[i]].forEach(function(id){
        S.tree.levels[id]=Math.max(Number(S.tree.levels[id])||0,lv);
      });
    }
    S.autonomySplitV476=true;
    if(typeof saveNow==='function')saveNow();
  }
}catch(_){ }

function branchShare(s,effect){
  var bonus=0;
  try{bonus=Math.max(0,Number(treeSum(s,effect))||0);}catch(_){ }
  return Math.min(20,5+bonus)/100;
}
try{
  if(typeof harvestRates==='function'&&!harvestRates.__srAutonomyYieldV476){
    var oldHarvestRates=harvestRates;
    harvestRates=function(s){
      return {
        minerai:raidReward('minerai',s.raids.minerai.level)*branchShare(s,'afkMinerai'),
        essence:raidReward('familier',s.raids.familier.level)*branchShare(s,'afkEssence'),
        eclat:raidReward('competence',s.raids.competence.level)*branchShare(s,'afkEclat'),
        gold:raidReward('or',s.raids.or.level)*branchShare(s,'afkGold')
      };
    };
    harvestRates.__srAutonomyYieldV476=true;
    harvestRates.__srPrevious=oldHarvestRates;
  }
}catch(_){ }
window.__srGoldEconomyConfigV335={
  version:476,
  autonomyBaseYieldPctPerHour:5,
  autonomyYieldTierCapsPctPoints:[1.5,3,4.5,6],
  autonomyYieldBranchMaxPctPoints:15,
  autonomyYieldMaxPctPerHour:20,
  autonomyResources:['minerai','essence','eclat','gold'],
  globalGoldTierCapsPct:[5,10,15,20],
  globalGoldBranchMaxPct:50
};
window.__srAutonomyTimeConfigV421={baseHours:8,tierCapsPct:[10,20,30,40],branchMaxPct:100,maxHours:16};
window.__srAutonomyYieldConfigV476={
  basePctPerHour:5,maxPctPerHour:20,treeAddsPctPoints:15,
  effects:{minerai:'afkMinerai',essence:'afkEssence',eclat:'afkEclat',gold:'afkGold'},
  legacyUniversalNodeMigrated:true
};
try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }
})();
