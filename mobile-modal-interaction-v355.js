/* SHADOWREACH V356 · Mobile modal interaction hotfix
   - Treats every real interactive control inside an open modal as an explicit user action.
   - Replaces Accomplishments tab content in-place instead of reopening the modal.
   - Keeps the existing modal lifecycle fallback for other user-triggered modal transitions.
   - Fixes Accomplissements > Défis / Étages on iOS/mobile without touching gameplay. */
(function(){
  'use strict';
  if(window.__srMobileModalInteractionV356)return;
  window.__srMobileModalInteractionV356=true;

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

  function replaceAccomplishmentsInPlace(content){
    if(typeof content!=='string'||content.indexOf('data-ach-canonical-v139')===-1)return false;
    var ov=document.getElementById('overlay');
    if(!ov)return false;
    var current=ov.querySelector('[data-ach-canonical-v139]');
    if(!current)return false;
    try{
      var holder=document.createElement('div');
      holder.innerHTML=content;
      var next=holder.querySelector('[data-ach-canonical-v139]');
      if(!next)return false;
      current.replaceWith(next);
      var body=ov.querySelector('.mbody');
      if(body)body.scrollTop=0;
      return true;
    }catch(_){return false;}
  }

  window.openModal=function(){
    var ov=document.getElementById('overlay');
    var content=arguments[0];

    /* Accomplishments tabs are not a new modal. Render the requested tab directly
       inside the already-open modal so no modal queue/lifecycle layer can swallow it. */
    if(ov&&replaceAccomplishmentsInPlace(content))return ov;

    if(ov&&interactiveUntil>now()){
      try{previousClose.call(this);}catch(_){}
      return previousOpen.apply(this,arguments);
    }
    return previousOpen.apply(this,arguments);
  };

  try{
    var style=document.createElement('style');
    style.id='srMobileModalInteractionV356Style';
    style.textContent='#overlay button,#overlay a,#overlay [role="button"],#overlay [data-act],#overlay [data-ach-tab],#overlay [data-ach],#overlay [data-ach-premium],#overlay [data-ach-premium-info],#overlay [data-ach-title]{touch-action:manipulation;-webkit-tap-highlight-color:transparent;}';
    document.head.appendChild(style);
  }catch(_){}
})();
