/* SHADOWREACH · Modal interaction contract V194
   Restore the application's native interaction ownership.

   V193 moved #overlay out of #app and added document-level touch/click
   interception. That broke two existing contracts:
   - ui-stability-v83 treats #app [data-act] as the reliable action surface;
   - tutorial-auto-v100 watches #app for modal insertion/removal so tutorials
     never coexist with a blocking modal.

   V194 deliberately does less:
   - keep every modal inside #app;
   - let the existing #app action delegation handle modal buttons;
   - remove any tutorial UI when a modal is present (without marking it seen);
   - freeze Harvest's destructive one-second body rebuild while its modal is
     open, so RÉCLAMER/X nodes remain stable for the whole tap;
   - never install global touch/click blockers.
*/
(function(){
  'use strict';
  if(window.__srModalCoreV194)return;
  window.__srModalCoreV194=true;

  function app(){return document.getElementById('app');}
  function overlay(){return document.getElementById('overlay');}

  function clearTutorialForModal(){
    var ov=overlay();
    if(!ov)return;
    try{
      if(typeof clearTutorialGuide==='function')clearTutorialGuide();
    }catch(_){}
    var guide=document.getElementById('tutorialGuide');
    if(guide)guide.remove();
    var card=document.getElementById('tutorialCard');
    if(card)card.remove();
    // Do not mark the step as seen. tutorial-auto-v100 will propose it again
    // after the modal closes.
    try{
      if(typeof tutorialCurrentKey!=='undefined')tutorialCurrentKey=null;
    }catch(_){}
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
    clearTutorialForModal();
    return ov;
  }

  // Preserve the already-wrapped ui-stability openModal function, then enforce
  // the native DOM location after each open. No custom action dispatcher.
  var nativeOpen=typeof window.openModal==='function'?window.openModal:null;
  if(nativeOpen){
    window.openModal=function(){
      var out=nativeOpen.apply(this,arguments);
      normalizeModal();
      return out;
    };
  }

  // Harvest state keeps accumulating in the engine. Only the cosmetic modal
  // HTML refresh is frozen so the button being touched cannot disappear.
  var nativeRefresh=typeof window.refreshHarvestModal==='function'?window.refreshHarvestModal:null;
  if(nativeRefresh){
    window.refreshHarvestModal=function(){
      var ov=overlay();
      if(ov&&ov.getAttribute('data-modal')==='harvest')return;
      return nativeRefresh.apply(this,arguments);
    };
  }

  // Repair a modal that was already open while the late layer loaded.
  normalizeModal();

  // Defensive observer: if any later module tries to portal #overlay back to
  // body, move it immediately into #app and re-establish the single-modal rule.
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
