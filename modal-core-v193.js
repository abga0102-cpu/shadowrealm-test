/* SHADOWREACH · Modal interaction contract V196
   Modal-local interaction ownership for reliable iOS taps.

   Keep #overlay inside #app and preserve the game's real ACT handlers, but do
   not depend on Safari synthesizing a click that reaches #app. Every modal owns
   its own [data-act] taps locally. Touch activation happens on touchend; mouse
   and keyboard activation happens on click. No document-level interception and
   no modal portal are used, so normal game controls keep their native path. */
(function(){
  'use strict';
  if(window.__srModalCoreV196)return;
  window.__srModalCoreV196=true;

  function app(){return document.getElementById('app');}
  function overlay(){return document.getElementById('overlay');}

  function clearTutorialForModal(){
    var ov=overlay();
    if(!ov)return;
    try{if(typeof clearTutorialGuide==='function')clearTutorialGuide();}catch(_){}
    var guide=document.getElementById('tutorialGuide');
    if(guide)guide.remove();
    var card=document.getElementById('tutorialCard');
    if(card)card.remove();
    try{if(typeof tutorialCurrentKey!=='undefined')tutorialCurrentKey=null;}catch(_){}
  }

  function actionTarget(target,ov){
    if(!target||!target.closest||!ov)return null;
    var el=target.closest('[data-act]');
    if(!el||!ov.contains(el)||el.disabled||el.hasAttribute('disabled')||el.getAttribute('aria-disabled')==='true')return null;
    return el;
  }

  function stopEvent(e){
    if(!e)return;
    if(e.cancelable)e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  }

  function invoke(el,e){
    if(!el)return false;
    var act=el.getAttribute('data-act')||'';
    var fn=(typeof ACT!=='undefined'&&ACT)?ACT[act]:null;
    if(typeof fn!=='function')return false;
    stopEvent(e);
    fn(el.dataset?el.dataset.arg:undefined,el.dataset?el.dataset.arg2:undefined);
    return true;
  }

  function bindModal(ov){
    if(!ov||ov.getAttribute('data-sr-modal-v196')==='1')return;
    ov.setAttribute('data-sr-modal-v196','1');

    var touch=null;
    var suppressAct='';
    var suppressUntil=0;

    ov.addEventListener('touchstart',function(e){
      if(!e.touches||e.touches.length!==1){touch=null;return;}
      var el=actionTarget(e.target,ov);
      if(!el){touch=null;return;}
      var t=e.touches[0];
      touch={el:el,x:t.clientX,y:t.clientY,moved:false};
    },{capture:true,passive:true});

    ov.addEventListener('touchmove',function(e){
      if(!touch||!e.touches||!e.touches.length)return;
      var t=e.touches[0];
      if(Math.hypot(t.clientX-touch.x,t.clientY-touch.y)>12)touch.moved=true;
    },{capture:true,passive:true});

    ov.addEventListener('touchcancel',function(){touch=null;},true);

    ov.addEventListener('touchend',function(e){
      if(!touch)return;
      var tap=touch;touch=null;
      var changed=e.changedTouches&&e.changedTouches[0];
      var hit=changed&&document.elementFromPoint?document.elementFromPoint(changed.clientX,changed.clientY):e.target;
      var end=actionTarget(hit,ov);
      if(tap.moved||end!==tap.el)return;
      suppressAct=tap.el.getAttribute('data-act')||'';
      suppressUntil=Date.now()+900;
      invoke(tap.el,e);
    },{capture:true,passive:false});

    ov.addEventListener('click',function(e){
      var el=actionTarget(e.target,ov);
      if(!el)return;
      var act=el.getAttribute('data-act')||'';
      if(Date.now()<suppressUntil&&act===suppressAct){stopEvent(e);return;}
      invoke(el,e);
    },true);
  }

  function normalizeModal(){
    var ov=overlay(),root=app();
    if(!ov||!root)return ov;
    if(ov.parentElement!==root)root.appendChild(ov);
    ov.style.removeProperty('position');
    ov.style.removeProperty('inset');
    ov.style.removeProperty('z-index');
    ov.style.removeProperty('pointer-events');
    ov.removeAttribute('data-sr-modal-v193');
    ov.removeAttribute('data-sr-modal-v191');
    clearTutorialForModal();
    bindModal(ov);
    return ov;
  }

  var nativeOpen=typeof window.openModal==='function'?window.openModal:null;
  if(nativeOpen){
    window.openModal=function(){
      var out=nativeOpen.apply(this,arguments);
      normalizeModal();
      return out;
    };
  }

  /* Harvest keeps accumulating in game state; only freeze the cosmetic HTML
     rebuild so the touched action node remains stable for the whole gesture. */
  var nativeRefresh=typeof window.refreshHarvestModal==='function'?window.refreshHarvestModal:null;
  if(nativeRefresh){
    window.refreshHarvestModal=function(){
      var ov=overlay();
      if(ov&&ov.getAttribute('data-modal')==='harvest')return;
      return nativeRefresh.apply(this,arguments);
    };
  }

  normalizeModal();

  var queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){queued=false;normalizeModal();});
  }
  var root=app();
  if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:false});
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:false});
})();
