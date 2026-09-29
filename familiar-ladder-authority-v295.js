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

/* V476 · Split Autonomy yield + Global Gold 50% authority
   - Each Autonomy resource has its own Tree branch: Or, Minerai, Essence,
     Étincelles. Every branch is 5%/h base -> 20%/h max independently.
   - Existing n*_07 ids are the Or branch; save migration in game-1 copies
     already-paid legacy levels to the three new branches once.
   - Global Gold caps at +5/+10/+15/+20 by tier = +50% total.
   - Time Autonomy remains 8h base -> 16h maximum. */
(function(){'use strict';
if(window.__srGoldEconomyBalanceV335)return;window.__srGoldEconomyBalanceV335=true;
var AUTO_GOLD=['n1_07','n2_07','n3_07','n4_07'];
var AUTO_MIN=['n1_am','n2_am','n3_am','n4_am'];
var AUTO_ESS=['n1_ae','n2_ae','n3_ae','n4_ae'];
var AUTO_ECL=['n1_as','n2_as','n3_as','n4_as'];
var TIME=['n1_08','n2_08','n3_08','n4_08'];
var GLOBAL=['n1_06','n2_06','n3_06','n4_06'];
var ROMAN=['I','II','III','IV'];
var AUTO_PER=[0.3,0.6,0.9,1.2];
var AUTO_CAP=[1.5,3,4.5,6];
var TIME_PER={n1_08:2,n2_08:4,n3_08:6,n4_08:8};
var TIME_CAP={n1_08:10,n2_08:20,n3_08:30,n4_08:40};
var GLOBAL_PER={n1_06:1,n2_06:2,n3_06:3,n4_06:4};
var GLOBAL_CAP={n1_06:5,n2_06:10,n3_06:15,n4_06:20};
function tuneAuto(ids,label,short,effect){
  ids.forEach(function(id,i){var n=TREE_BY_ID&&TREE_BY_ID[id];if(!n)return;n.effect=effect;n.per=AUTO_PER[i];n.tierScale=false;n.label=label+' '+ROMAN[i];n.short=short+' '+ROMAN[i];n.note='+'+String(AUTO_PER[i]).replace('.',',')+' point de %/h par niveau · Max +'+String(AUTO_CAP[i]).replace('.',',')+' points';});
}
try{
  if(typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID){
    tuneAuto(AUTO_GOLD,'Autonomie Or','Auton. Or','afkGold');
    tuneAuto(AUTO_MIN,'Autonomie Minéraux','Auton. Min.','afkMinerai');
    tuneAuto(AUTO_ESS,'Autonomie Essence','Auton. Essence','afkEssence');
    tuneAuto(AUTO_ECL,'Autonomie Étincelles','Auton. Étinc.','afkEclat');
    TIME.forEach(function(id){var n=TREE_BY_ID[id];if(!n)return;n.per=TIME_PER[id];n.tierScale=false;n.note='+'+TIME_PER[id]+' % de durée par niveau · Max +'+TIME_CAP[id]+' % · Plafond global 16 h';});
    GLOBAL.forEach(function(id){var n=TREE_BY_ID[id];if(!n)return;n.per=GLOBAL_PER[id];n.tierScale=false;n.label='Or obtenu '+ROMAN[GLOBAL.indexOf(id)];n.short='Or obtenu '+ROMAN[GLOBAL.indexOf(id)];n.note='+'+GLOBAL_PER[id]+' % d’or obtenu par niveau · Max +'+GLOBAL_CAP[id]+' %';});
  }
}catch(_){ }
try{
  if(typeof harvestRates==='function'&&!harvestRates.__srAutonomyYieldV476){
    var oldHarvestRates=harvestRates;
    function share(s,effect){var bonus=0;try{bonus=Math.max(0,Number(treeSum(s,effect))||0);}catch(_){ }return Math.min(20,5+bonus)/100;}
    harvestRates=function(s){
      return {
        minerai:raidReward('minerai',s.raids.minerai.level)*share(s,'afkMinerai'),
        essence:raidReward('familier',s.raids.familier.level)*share(s,'afkEssence'),
        eclat:raidReward('competence',s.raids.competence.level)*share(s,'afkEclat'),
        gold:raidReward('or',s.raids.or.level)*share(s,'afkGold')
      };
    };
    harvestRates.__srAutonomyYieldV476=true;
    harvestRates.__srPrevious=oldHarvestRates;
  }
}catch(_){ }
window.__srGoldEconomyConfigV335={
  autonomyBaseYieldPctPerHour:5,
  autonomyYieldTierCapsPctPoints:[1.5,3,4.5,6],
  autonomyYieldBranchMaxPctPoints:15,
  autonomyYieldMaxPctPerHour:20,
  autonomyIndependentResources:true,
  globalGoldTierCapsPct:[5,10,15,20],
  globalGoldBranchMaxPct:50
};
window.__srAutonomyTimeConfigV421={baseHours:8,tierCapsPct:[10,20,30,40],branchMaxPct:100,maxHours:16};
window.__srAutonomyYieldConfigV476={basePctPerHour:5,maxPctPerHour:20,treeAddsPctPoints:15,resources:{minerai:'afkMinerai',essence:'afkEssence',eclat:'afkEclat',gold:'afkGold'},independent:true};
try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }
})();