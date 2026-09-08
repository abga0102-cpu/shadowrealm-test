/* SHADOWREACH · Rebirth scroll stability V220
   Keeps the Rebirth screen at the player's chosen scroll position when passive
   game updates/notifications trigger a rerender. Does not alter navigation,
   gameplay, economy, saves, Home layout or combat rendering. */
(function(){
  'use strict';
  if(window.__srRebirthScrollStabilityV220)return;
  window.__srRebirthScrollStabilityV220=true;

  var screen=document.getElementById('screen');
  if(!screen)return;

  var lastTop=0;
  var lastBottomGap=0;
  var wasRebirth=false;
  var interacting=false;
  var restoreQueued=false;
  var interactionTimer=0;

  function rebirthOpen(){
    return !!screen.querySelector('[data-sr-route="rebirth"]');
  }
  function maxTop(){
    return Math.max(0,screen.scrollHeight-screen.clientHeight);
  }
  function remember(){
    if(!rebirthOpen())return;
    var max=maxTop();
    lastTop=Math.max(0,Math.min(screen.scrollTop,max));
    lastBottomGap=Math.max(0,max-screen.scrollTop);
    wasRebirth=true;
  }
  function setInteracting(v){
    interacting=v;
    clearTimeout(interactionTimer);
    if(v){
      remember();
      interactionTimer=setTimeout(function(){interacting=false;remember();},180);
    }
  }
  function restore(){
    restoreQueued=false;
    var open=rebirthOpen();
    if(!open){wasRebirth=false;return;}
    if(!wasRebirth){remember();return;}
    if(interacting)return;

    var max=maxTop();
    /* When the player was near the bottom, preserve the bottom anchor. This is
       important for Rebirth because notifications can change content height. */
    var wanted=lastBottomGap<=48 ? Math.max(0,max-lastBottomGap) : Math.min(lastTop,max);
    if(Math.abs(screen.scrollTop-wanted)>1)screen.scrollTop=wanted;
    lastTop=screen.scrollTop;
    lastBottomGap=Math.max(0,max-screen.scrollTop);
  }
  function queueRestore(){
    if(restoreQueued)return;
    restoreQueued=true;
    requestAnimationFrame(function(){requestAnimationFrame(restore);});
  }

  screen.addEventListener('scroll',function(){if(!interacting)remember();},{passive:true});
  screen.addEventListener('touchstart',function(){if(rebirthOpen())setInteracting(true);},{passive:true});
  screen.addEventListener('touchmove',function(){if(rebirthOpen())remember();},{passive:true});
  screen.addEventListener('touchend',function(){if(rebirthOpen()){interacting=false;remember();}},{passive:true});
  screen.addEventListener('touchcancel',function(){interacting=false;},{passive:true});
  screen.addEventListener('pointerdown',function(e){if(e.pointerType==='touch'&&rebirthOpen())setInteracting(true);},{passive:true});
  screen.addEventListener('pointerup',function(e){if(e.pointerType==='touch'&&rebirthOpen()){interacting=false;remember();}},{passive:true});
  screen.addEventListener('pointercancel',function(){interacting=false;},{passive:true});

  var mo=new MutationObserver(function(){
    if(!wasRebirth&&!rebirthOpen())return;
    queueRestore();
  });
  mo.observe(screen,{childList:true,subtree:true});

  window.__srRebirthScrollV220={remember:remember,restore:restore};
})();
