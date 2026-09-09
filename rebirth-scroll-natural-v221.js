/* SHADOWREACH · Rebirth natural scroll V221
   Replaces V220 behavior with the same continuous position-preservation model
   already validated on Familiar. UI-only: no gameplay, economy, save or layout changes. */
(function(){
  'use strict';
  if(window.__srRebirthScrollNaturalV221)return;
  window.__srRebirthScrollNaturalV221=true;
  /* Prevent the older V220 layer from installing if it is ever loaded later. */
  window.__srRebirthScrollStabilityV220=true;

  var screen=document.getElementById('screen');
  if(!screen)return;

  var lastTop=0;
  var restoring=false;
  var lastRouteRebirth=false;

  function isRebirthScreen(){
    return !!screen.querySelector('[data-sr-route="rebirth"]');
  }
  function remember(){
    if(restoring||!isRebirthScreen())return;
    lastTop=screen.scrollTop;
    lastRouteRebirth=true;
  }
  function restoreIfNeeded(){
    var rebirth=isRebirthScreen();
    if(!rebirth){lastRouteRebirth=false;return;}
    if(!lastRouteRebirth){
      lastTop=screen.scrollTop;
      lastRouteRebirth=true;
      return;
    }
    var max=Math.max(0,screen.scrollHeight-screen.clientHeight);
    var wanted=Math.max(0,Math.min(lastTop,max));
    if(Math.abs(screen.scrollTop-wanted)<1)return;
    restoring=true;
    screen.scrollTop=wanted;
    restoring=false;
  }

  /* Same behavior as Familiar: every real user movement becomes the desired
     scroll position immediately. No bottom anchoring and no delayed correction. */
  screen.addEventListener('scroll',remember,{passive:true});
  screen.addEventListener('touchmove',remember,{passive:true});
  screen.addEventListener('pointermove',function(e){if(e.pointerType==='touch')remember();},{passive:true});

  /* Restore before the next paint when a passive game rerender replaces content. */
  var mo=new MutationObserver(function(){
    if(!isRebirthScreen()){lastRouteRebirth=false;return;}
    restoreIfNeeded();
  });
  mo.observe(screen,{childList:true,subtree:true});

  screen.addEventListener('pointerdown',function(){if(isRebirthScreen())remember();},true);
  screen.addEventListener('touchstart',function(){if(isRebirthScreen())remember();},{capture:true,passive:true});
  screen.addEventListener('click',function(){if(isRebirthScreen())remember();},true);

  window.__srRebirthScrollV221={remember:remember,restore:restoreIfNeeded};
})();