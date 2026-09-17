/* SHADOWREACH V355 · Mobile modal interaction hotfix
   - Treats every real interactive control inside an open modal as an explicit user action.
   - Replaces an already-open modal immediately when that user action opens another modal.
   - Fixes Accomplissements > Défis and similar custom modal controls on iOS/mobile. */
(function(){
  'use strict';
  if(window.__srMobileModalInteractionV355)return;
  window.__srMobileModalInteractionV355=true;

  if(typeof window.openModal!=='function'||typeof window.closeModal!=='function')return;

  var previousOpen=window.openModal;
  var previousClose=window.closeModal;
  var interactiveUntil=0;

  function now(){return typeof performance!=='undefined'?performance.now():Date.now();}
  function interactiveTarget(t){
    if(!t||!t.closest)return null;
    return t.closest('#overlay button,#overlay a[href],#overlay input,#overlay select,#overlay textarea,#overlay summary,#overlay [role="button"],#overlay [tabindex],#overlay [data-act],#overlay [data-ach-tab],#overlay [data-ach],#overlay [data-ach-premium],#overlay [data-ach-premium-info],#overlay [data-ach-title]');
  }
  function arm(e){
    if(interactiveTarget(e&&e.target))interactiveUntil=now()+1800;
  }

  document.addEventListener('pointerdown',arm,true);
  document.addEventListener('touchstart',arm,{capture:true,passive:true});
  document.addEventListener('click',arm,true);

  window.openModal=function(){
    var ov=document.getElementById('overlay');
    if(ov&&interactiveUntil>now()){
      try{previousClose.call(this);}catch(_){}
      return previousOpen.apply(this,arguments);
    }
    return previousOpen.apply(this,arguments);
  };

  try{
    var style=document.createElement('style');
    style.id='srMobileModalInteractionV355Style';
    style.textContent='#overlay button,#overlay a,#overlay [role="button"],#overlay [data-act],#overlay [data-ach-tab],#overlay [data-ach],#overlay [data-ach-premium],#overlay [data-ach-premium-info],#overlay [data-ach-title]{touch-action:manipulation;-webkit-tap-highlight-color:transparent;}';
    document.head.appendChild(style);
  }catch(_){}
})();
