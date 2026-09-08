/* SHADOWREACH · Runtime performance consolidation V217
   - Restores the core combat simulation cadence to ~30 Hz instead of the V156 16 ms override.
   - Caps the expensive DOM arena renderer to ~30 FPS on coarse-pointer/mobile devices.
   - Skips arena work entirely while its DOM is detached or the page is hidden.
   - Keeps V156/V157/V169 combat behavior, damage, cooldowns, rewards and saves unchanged.
   This is a runtime scheduling authority only. */
(function(){
'use strict';
if(window.__srRuntimePerformanceV217)return;
window.__srRuntimePerformanceV217=true;

var MOBILE=false;
try{MOBILE=matchMedia('(pointer:coarse)').matches||/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'');}catch(_){}

/* V156 temporarily replaces setInterval so the engine's named tick registered at
   33 ms is silently converted to 16 ms. Keep V156's visual compatibility layer,
   but bypass only that cadence rewrite by registering an anonymous proxy at the
   engine's original 33 ms. Every unrelated interval still delegates unchanged. */
var inheritedSetInterval=window.setInterval;
var combatTickHooked=false;
window.setInterval=function(fn,delay){
  var args=Array.prototype.slice.call(arguments,2);
  if(delay===33&&typeof fn==='function'&&fn.name==='tick'){
    combatTickHooked=true;
    var ctx=this;
    var safeTick=function(){return fn.apply(ctx,arguments);};
    return inheritedSetInterval.apply(window,[safeTick,33].concat(args));
  }
  return inheritedSetInterval.apply(window,[fn,delay].concat(args));
};

/* game-3 owns a perpetual requestAnimationFrame loop. Its drawArena rebuilds
   #aLayer with innerHTML, then V169 walks and restyles those freshly-created DOM
   nodes. On mobile that work does not need 60 executions/second. The simulation
   remains independent; only visual DOM rebuilding is capped. */
if(typeof window.drawArena==='function'){
  var inheritedDrawArena=window.drawArena;
  var lastArenaDraw=0;
  var MOBILE_FRAME_MS=32; // ~31 FPS, enough for combat readability without 60 DOM rebuilds/s.
  window.drawArena=function(){
    try{
      if(document.hidden)return;
      if(typeof arenaEl==='undefined'||!arenaEl||!arenaEl.isConnected)return;
      if(MOBILE){
        var now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
        if(now-lastArenaDraw<MOBILE_FRAME_MS)return;
        lastArenaDraw=now;
      }
    }catch(_){}
    return inheritedDrawArena.apply(this,arguments);
  };
  try{drawArena=window.drawArena;}catch(_){}
}

/* Expose read-only diagnostic state for future profiling without rendering UI. */
window.__srRuntimePerf217={
  mobile:MOBILE,
  visualFrameMs:MOBILE?32:0,
  expectedSimulationMs:33,
  combatTickHooked:function(){return combatTickHooked;}
};
})();
