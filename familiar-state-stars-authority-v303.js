/* SHADOWREACH V303 · Familiar state-star authority
   V310 compatibility layer: V286 now reads Familiar stars directly from the
   state being evaluated, so the former temporary mutation of S.stars.pet is no
   longer required. Keep this marker/config for compatibility and QA visibility. */
(function(){'use strict';
if(window.__srFamiliarStateStarsV303)return;window.__srFamiliarStateStarsV303=true;

try{if(typeof S!=='undefined'&&S){S.familiarStateStarsVersion=303;if(typeof computePower==='function')S.power=computePower(S);if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srFamiliarStateStarsConfigV303={stateIsolatedPetStars:true,liveValuesUnchanged:true,globalStarMirroring:false};
})();
