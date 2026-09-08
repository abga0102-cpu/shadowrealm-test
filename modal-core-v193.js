/* SHADOWREACH · Modal input authority V193
   One fail-safe interaction path for mobile dialogs.

   The Harvest sheet exposed two separate failure modes on iOS Safari:
   - its body is rebuilt every second, so an action node can disappear during a tap;
   - modal hit-testing has competed with app-level HUD/Forge/chat layers.

   V193 handles the completed decision at touch START for the two critical
   Harvest actions, before either of those things can invalidate the gesture.
   It also roots the modal under <body> and gives every modal its own click
   dispatcher, so modal actions no longer depend on bubbling through #app.
*/
(function(){
  'use strict';
  if(window.__srModalCoreV193)return;
  window.__srModalCoreV193=true;

  var ghostUntil=0;
  function overlay(){return document.getElementById('overlay');}
  function disabled(el){return !el||el.disabled||el.hasAttribute('disabled')||el.getAttribute('aria-disabled')==='true';}
  function criticalTarget(target){
    var el=target&&target.closest?target.closest('#overlay [data-act]'):null;
    if(disabled(el))return null;
    var act=el.getAttribute('data-act')||'';
    return act==='closeModal'||act==='harvestClaim'?el:null;
  }
  function stop(e){
    if(!e)return;
    if(e.cancelable)e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  }
  function closeDirect(){
    var ov=overlay();
    if(ov)ov.remove();
    return true;
  }
  function claimDirect(){
    if(typeof update!=='function'||typeof harvestClaim!=='function')return false;
    var got=null;
    update(function(st){got=harvestClaim(st);});
    if(got){
      var bits=[];
      if(got.minerai)bits.push(fmt(got.minerai)+' Minerai');
      if(got.essence)bits.push(fmt(got.essence)+' Essence');
      if(got.eclat)bits.push(fmt(got.eclat)+' Compét.');
      if(got.gold)bits.push(fmt(got.gold)+' Or');
      if(typeof toast==='function')toast(bits.length?'+'+bits.join(' · '):'Rien à réclamer',bits.length>0);
    }
    closeDirect();
    return true;
  }
  function activateCritical(el,e){
    if(!el)return false;
    var act=el.getAttribute('data-act')||'';
    var ok=act==='closeModal'?closeDirect():act==='harvestClaim'?claimDirect():false;
    if(ok){ghostUntil=Date.now()+900;stop(e);}
    return ok;
  }
  function bind(ov){
    if(!ov)return null;
    // Escape all app-local stacking contexts. The modal is visually and
    // interactively the top-level surface while it exists.
    if(ov.parentElement!==document.body)document.body.appendChild(ov);
    ov.style.setProperty('position','fixed','important');
    ov.style.setProperty('inset','0','important');
    ov.style.setProperty('z-index','2147480000','important');
    ov.style.setProperty('pointer-events','auto','important');
    ov.setAttribute('data-sr-modal-v193','1');
    if(ov.__srBoundV193)return ov;
    ov.__srBoundV193=true;

    // Mouse, keyboard and non-touch activation. Because the modal lives under
    // body, it intentionally owns [data-act] delegation instead of #app.
    ov.addEventListener('click',function(e){
      if(Date.now()<ghostUntil){stop(e);return;}
      var el=e.target&&e.target.closest?e.target.closest('[data-act]'):null;
      if(el&&ov.contains(el)&&!disabled(el)){
        if(activateCritical(el,e))return;
        var fn=(typeof ACT!=='undefined'&&ACT)?ACT[el.dataset.act]:null;
        if(typeof fn==='function'){
          stop(e);
          fn(el.dataset.arg,el.dataset.arg2);
          return;
        }
      }
      if(e.target===ov){stop(e);closeDirect();}
    },true);
    return ov;
  }

  // Safari fail-safe: claim/close on finger-down, not on delayed click/touchend.
  // The action therefore completes before the one-second Harvest refresh can
  // replace any DOM node. This listener is capture-phase and independent of
  // where the overlay is mounted.
  document.addEventListener('touchstart',function(e){
    var el=criticalTarget(e.target);
    if(!el)return;
    bind(overlay());
    activateCritical(el,e);
  },{capture:true,passive:false});

  // Suppress Safari's compatibility click after a touch-start action; otherwise
  // the click can land on a newly exposed control after the modal has closed.
  document.addEventListener('click',function(e){
    if(Date.now()>=ghostUntil)return;
    stop(e);
  },true);

  // Future modals are rooted and bound immediately after the native renderer.
  var nativeOpen=typeof window.openModal==='function'?window.openModal:null;
  if(nativeOpen){
    window.openModal=function(){
      var out=nativeOpen.apply(this,arguments);
      bind(overlay());
      return out;
    };
  }

  // The live Harvest numbers do not need to rebuild the decision controls.
  // Freeze that cosmetic refresh while the sheet is open; state continues to
  // accumulate in the engine and claimDirect reads the current state.
  var nativeRefresh=typeof window.refreshHarvestModal==='function'?window.refreshHarvestModal:null;
  if(nativeRefresh){
    window.refreshHarvestModal=function(){
      var ov=overlay();
      if(ov&&ov.getAttribute('data-modal')==='harvest')return;
      return nativeRefresh.apply(this,arguments);
    };
  }

  // Handle a Harvest sheet that opened during boot before this late layer loaded.
  bind(overlay());
  new MutationObserver(function(){bind(overlay());}).observe(document.body,{childList:true,subtree:false});
})();
