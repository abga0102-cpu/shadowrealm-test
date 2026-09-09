/* SHADOWREACH · Home lifecycle stability V227
   Restores the Phase 2B lifecycle contract on top of the current V219 Home authority.
   UI/lifecycle only: no gameplay, economy, progression or save data changes. */
(function(){
'use strict';
if(window.__srHomeLifecycleStabilityV227)return;
window.__srHomeLifecycleStabilityV227=true;
window.__srHomeFramePhase2B=true;
window.__srHomeLayoutPhase2B=true;
function sync(){
  if(typeof window.__srSyncHomeLayoutV219==='function')window.__srSyncHomeLayoutV219();
}
window.__srSyncHomeFramePhase2B=sync;
var nativeRenderTabs=typeof window.renderTabs==='function'?window.renderTabs:null;
if(nativeRenderTabs){
  window.renderTabs=function(){
    var out=nativeRenderTabs.apply(this,arguments);
    sync();
    return out;
  };
  try{renderTabs=window.renderTabs;}catch(_){}
}
window.addEventListener('resize',sync,{passive:true});
window.addEventListener('orientationchange',sync,{passive:true});
sync();
})();