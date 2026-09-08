/* SHADOWREACH · Modal interaction authority V191
   Modals are portalled to <body> and own their activation path directly.
   This removes two fragile dependencies from mobile Safari:
   1) a modal no longer competes inside #app with fixed body-level overlays;
   2) modal actions no longer depend on the #app delegated click listener.
   Harvest's once-per-second body refresh is also paused during an active tap so
   the touched button cannot be replaced between pointerdown and activation. */
(function(){
  'use strict';
  if(window.__srModalInteractionV191)return;
  window.__srModalInteractionV191=true;

  var style=document.createElement('style');
  style.id='srModalInteractionV191Style';
  style.textContent=`
#overlay[data-sr-modal-v191="1"]{
  position:fixed!important;
  inset:0!important;
  z-index:2147480000!important;
  pointer-events:auto!important;
  touch-action:manipulation!important;
}
#overlay[data-sr-modal-v191="1"]>.card,
#overlay[data-sr-modal-v191="1"] [data-act]{pointer-events:auto!important}
`;
  document.head.appendChild(style);

  var active=null;
  var refreshHoldUntil=0;
  var syntheticClick=false;
  var suppressUntil=0;
  var suppressAct='';

  function now(){return typeof performance!=='undefined'?performance.now():Date.now();}
  function actionTarget(target){
    var el=target&&target.closest?target.closest('#overlay [data-act]'):null;
    if(!el||el.disabled||el.hasAttribute('disabled')||el.getAttribute('aria-disabled')==='true')return null;
    return el;
  }
  function portal(){
    var ov=document.getElementById('overlay');
    if(!ov)return null;
    if(ov.parentElement!==document.body)document.body.appendChild(ov);
    ov.setAttribute('data-sr-modal-v191','1');
    return ov;
  }
  function invoke(el){
    if(!el)return false;
    var act=el.getAttribute('data-act')||'';
    var fn=(typeof ACT!=='undefined'&&ACT)?ACT[act]:null;
    if(typeof fn!=='function')return false;
    fn(el.dataset?el.dataset.arg:undefined,el.dataset?el.dataset.arg2:undefined);
    return true;
  }

  /* Keep the existing V83 open/close policy, but move the resulting overlay to
     the root stacking context immediately after every open. */
  var baseOpen=typeof window.openModal==='function'?window.openModal:null;
  if(baseOpen){
    window.openModal=function(){
      var out=baseOpen.apply(this,arguments);
      portal();
      requestAnimationFrame(portal);
      return out;
    };
  }

  /* Do not replace the Harvest button while a finger is down on the modal. */
  var baseHarvestRefresh=typeof window.refreshHarvestModal==='function'?window.refreshHarvestModal:null;
  if(baseHarvestRefresh){
    window.refreshHarvestModal=function(){
      if(active||now()<refreshHoldUntil)return;
      return baseHarvestRefresh.apply(this,arguments);
    };
  }

  document.addEventListener('pointerdown',function(e){
    var el=actionTarget(e.target);
    if(!el)return;
    active={id:e.pointerId,el:el,x:e.clientX,y:e.clientY,moved:false};
    refreshHoldUntil=now()+700;
  },true);

  document.addEventListener('pointermove',function(e){
    if(!active||e.pointerId!==active.id)return;
    if(Math.hypot(e.clientX-active.x,e.clientY-active.y)>12)active.moved=true;
  },true);

  document.addEventListener('pointerup',function(e){
    if(!active||e.pointerId!==active.id)return;
    var tap=active;active=null;refreshHoldUntil=now()+500;
    var end=actionTarget(e.target);
    if(tap.moved||end!==tap.el)return;

    /* Generate the click synchronously. V83's capture listener sees it first and
       marks the action as explicit, then our capture click handler below invokes
       the action. This works even when Safari would otherwise drop the delayed
       synthetic click because the DOM changed. */
    suppressAct=tap.el.getAttribute('data-act')||'';
    suppressUntil=Date.now()+850;
    syntheticClick=true;
    try{tap.el.click();}finally{syntheticClick=false;}
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  },{capture:true,passive:false});

  document.addEventListener('pointercancel',function(e){
    if(!active||e.pointerId!==active.id)return;
    active=null;refreshHoldUntil=now()+250;
  },true);

  /* Once portalled, #overlay is no longer inside #app, so it intentionally owns
     modal action delegation here. Keyboard-generated clicks use this same path. */
  document.addEventListener('click',function(e){
    var el=actionTarget(e.target);
    if(!el)return;
    var act=el.getAttribute('data-act')||'';
    if(!syntheticClick&&Date.now()<suppressUntil&&act===suppressAct){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      return;
    }
    if(!invoke(el))return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  },true);

  portal();
  new MutationObserver(function(){portal();}).observe(document.body,{childList:true,subtree:false});
})();
