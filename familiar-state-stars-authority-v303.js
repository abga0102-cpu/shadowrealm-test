/* SHADOWREACH V303 · Familiar state-star authority
   QA correction for V286: Familiar flat-stat calculations must read the stars
   from the state being evaluated, not implicitly from the global live state.
   This matters for previews, migrations, simulations and any derived-stat call
   using a cloned/imported state. Normal live-state values remain unchanged. */
(function(){'use strict';
if(window.__srFamiliarStateStarsV303)return;window.__srFamiliarStateStarsV303=true;

try{
  if(typeof computeDerived==='function'&&!computeDerived.__srV303){
    var previousComputeDerived=computeDerived;
    computeDerived=function(state){
      /* V286's private Familiar helper reads starsOf(S,'pet'). During a derived
         calculation for another state, mirror only the pet-star value into S
         for the duration of this synchronous call, then restore it exactly. */
      if(!state||typeof S==='undefined'||!S||state===S)return previousComputeDerived(state);
      var liveStars=S.stars,hadStars=!!liveStars,hadPet=hadStars&&Object.prototype.hasOwnProperty.call(liveStars,'pet');
      var oldPet=hadStars?liveStars.pet:undefined,targetPet=0;
      try{targetPet=(state.stars&&Number(state.stars.pet))||0;}catch(_){targetPet=0;}
      try{
        if(!S.stars)S.stars={};
        S.stars.pet=targetPet;
        return previousComputeDerived(state);
      }finally{
        if(hadStars){if(hadPet)liveStars.pet=oldPet;else delete liveStars.pet;S.stars=liveStars;}
        else delete S.stars;
      }
    };
    computeDerived.__srV303=true;
    computeDerived.__srPrevious=previousComputeDerived;
  }
}catch(_){ }

try{if(typeof S!=='undefined'&&S){S.familiarStateStarsVersion=303;if(typeof computePower==='function')S.power=computePower(S);if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srFamiliarStateStarsConfigV303={stateIsolatedPetStars:true,liveValuesUnchanged:true};
})();
