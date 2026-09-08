/* SHADOWREACH · Harvest modal interaction V192
   Keep the native modal inside #app and use the native game actions.

   V191 moved #overlay to <body> and recreated activation with synthetic
   pointer/click events. That made the modal dependent on a second interaction
   system, which is especially fragile on Mobile Safari.

   V192 is intentionally smaller:
   - never portal the modal out of #app;
   - stop replacing Harvest .mbody every second while the modal is open;
   - handle only the two Harvest-critical actions (close + claim) directly on
     touchend/click, using the game's real close/update/harvest functions;
   - leave every other modal action on the game's existing #app delegation.
*/
(function(){
  'use strict';
  if(window.__srHarvestModalV192)return;
  window.__srHarvestModalV192=true;

  var nativeRefresh=typeof window.refreshHarvestModal==='function' ? window.refreshHarvestModal : null;
  if(nativeRefresh){
    window.refreshHarvestModal=function(){
      var ov=document.getElementById('overlay');
      if(ov && ov.getAttribute('data-modal')==='harvest') return;
      return nativeRefresh.apply(this,arguments);
    };
  }

  var suppressClickUntil=0;
  var lastClaimAt=0;

  function modalActionTarget(target){
    if(!target || !target.closest) return null;
    var el=target.closest('#overlay [data-act]');
    if(!el || el.disabled || el.hasAttribute('disabled') || el.getAttribute('aria-disabled')==='true') return null;
    var act=el.getAttribute('data-act') || '';
    return (act==='closeModal' || act==='harvestClaim') ? el : null;
  }

  function stopEvent(e){
    if(!e)return;
    if(e.cancelable)e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  }

  function removeHarvestOverlay(){
    var ov=document.getElementById('overlay');
    if(!ov)return true;
    ov.remove();
    return true;
  }

  function closeHarvest(){
    return removeHarvestOverlay();
  }

  function claimHarvest(){
    var now=Date.now();
    if(now-lastClaimAt<500) return true;
    lastClaimAt=now;

    if(typeof window.update!=='function' || typeof window.harvestClaim!=='function') return false;
    var got=null;
    window.update(function(st){ got=window.harvestClaim(st); });
    if(!got) return true;

    var f=typeof window.fmt==='function' ? window.fmt : function(v){return String(Math.floor(Number(v)||0));};
    var bits=[];
    if(got.minerai) bits.push(f(got.minerai)+' Minerai');
    if(got.essence) bits.push(f(got.essence)+' Essence');
    if(got.eclat) bits.push(f(got.eclat)+' Compét.');
    if(got.gold) bits.push(f(got.gold)+' Or');

    if(typeof window.toast==='function'){
      window.toast(bits.length ? '+'+bits.join(' · ') : 'Rien à réclamer', bits.length>0);
    }
    removeHarvestOverlay();
    return true;
  }

  function activate(el,e){
    if(!el)return false;
    var act=el.getAttribute('data-act') || '';
    var handled=act==='closeModal' ? closeHarvest() : act==='harvestClaim' ? claimHarvest() : false;
    if(handled) stopEvent(e);
    return handled;
  }

  /* iOS Safari always emits touchend for a completed finger tap. Handle that
     directly instead of manufacturing a synthetic click from pointerup. */
  document.addEventListener('touchend',function(e){
    var el=modalActionTarget(e.target);
    if(!el)return;
    if(activate(el,e)) suppressClickUntil=Date.now()+900;
  },{capture:true,passive:false});

  /* Keyboard, mouse and browsers without Touch Events use the normal click.
     The short suppression window prevents Safari's compatibility click from
     activating whatever happens to be underneath after the modal closes. */
  document.addEventListener('click',function(e){
    if(Date.now()<suppressClickUntil){
      stopEvent(e);
      return;
    }
    activate(modalActionTarget(e.target),e);
  },true);
})();
