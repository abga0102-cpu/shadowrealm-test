/* SHADOWREACH V295 · Familiar ladder authority
   Restores the approved Familiar ladder without rewriting legacy saves:
   Commun -> Peu commun -> Rare -> Epique -> Mythique -> Ancestral -> Legendaire -> Divin.
   Ancestral is a fusion progression tier (not a direct pre-Ascension summon).
   Approved fusion requirements through Ancestral -> Legendaire: 4 / 4 / 5 / 5 / 5 / 6.
   Familiar summon-rate policy is owned by V296.

   V330 hardens the authority against stale/legacy runtime ladders. The whole
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
