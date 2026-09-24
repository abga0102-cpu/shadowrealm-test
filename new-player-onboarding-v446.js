/* SHADOWREACH · new-player onboarding authority V446
   Loaded immediately after game-1.js, before the first runtime state is built.
   Existing saves keep their stored minerai because migrate() overlays saved data
   on top of defaultState(). Only genuinely new states receive the starter grant. */
(function(){
  'use strict';
  if (window.__srNewPlayerOnboardingV446) return;
  window.__srNewPlayerOnboardingV446 = true;

  if (typeof defaultState !== 'function') return;
  var nativeDefaultState = defaultState;
  defaultState = function(name){
    var state = nativeDefaultState.apply(this, arguments);
    state.minerai = 50;
    return state;
  };

  window.__srNewPlayerStarterV446 = {
    minerai: 50,
    forgeCraftsAtBaseCost: 5
  };
})();
