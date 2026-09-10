/* SHADOWREACH V295 · Familiar ladder authority
   Restores the approved Familiar ladder without rewriting legacy saves:
   Commun -> Peu commun -> Rare -> Epique -> Mythique -> Ancestral -> Legendaire -> Divin.
   Ancestral is a fusion progression tier (not a direct pre-Ascension summon).
   Approved fusion requirements through Ancestral -> Legendaire: 4 / 4 / 5 / 5 / 5 / 6. */
(function(){'use strict';
if(window.__srFamiliarLadderV295)return;window.__srFamiliarLadderV295=true;
try{
  if(typeof PET_RARITY_ORDER!=='undefined'&&Array.isArray(PET_RARITY_ORDER)&&PET_RARITY_ORDER.indexOf('ANCESTRAL')<0){
    var leg=PET_RARITY_ORDER.indexOf('LEGENDAIRE');
    PET_RARITY_ORDER.splice(leg<0?PET_RARITY_ORDER.length:leg,0,'ANCESTRAL');
  }
}catch(_){ }
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
/* getRates() builds its output from the Familiar summon anchors, which deliberately
   contain no ANCESTRAL entry. Keep it fusion-only and expose an explicit zero for
   UI/rate readers instead of letting undefined leak into displays/calculations. */
try{if(typeof getRates==='function'&&!getRates.__srV295){var oldRates=getRates;getRates=function(system,m,a,s){var out=oldRates(system,m,a,s);if(system==='pet'&&out&&out.ANCESTRAL==null)out.ANCESTRAL=0;return out;};getRates.__srV295=true;}}catch(_){ }
try{if(typeof S!=='undefined'&&S){S.familiarLadderVersion=295;if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srFamiliarLadderConfigV295={order:['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE','ANCESTRAL','LEGENDAIRE','DIVIN'],fusion:{COMMUN:4,PEU_COMMUN:4,RARE:5,EPIQUE:5,MYTHIQUE:5,ANCESTRAL:6},ancestralDirectSummon:false};
})();