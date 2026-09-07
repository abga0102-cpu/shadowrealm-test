// HOME_LAYOUT_MODAL_AND_RENDER_STABILITY_V80
// Conserve les protections V79 et permet aux actions explicites du joueur de rendre
// immédiatement l'interface, même pendant l'inertie de scroll, sans réintroduire les
// reconstructions DOM de fond qui faisaient sauter la page sur iOS.
(function(){
  'use strict';

  const css=document.createElement('style');
  css.id='homeLayoutModalRenderStabilityV80';
  css.textContent=`
    #screen{padding-bottom:max(4px,env(safe-area-inset-bottom));overflow-anchor:none;overscroll-behavior-y:contain}

    #app:has(#screen .campaignWorld) #hud{padding:4px 8px 4px;gap:5px}
    #app:has(#screen .campaignWorld) #hud .pbox{padding:3px 6px 3px 4px}
    #app:has(#screen .campaignWorld) #hud .avatar{width:36px;height:36px}
    #app:has(#screen .campaignWorld) #hud .iconBtn{width:44px;height:44px;min-width:44px;min-height:44px}

    #screen:has(.campaignWorld){scroll-padding-bottom:118px}
    #screen:has(.campaignWorld) .recommendedWrap{margin-top:-2px;margin-bottom:1px}
    #screen:has(.campaignWorld) .campaignWorld{margin-top:-10px}
    #screen:has(.campaignWorld) .campaignWorld #arenaSlot{margin-top:0}
    #screen:has(.campaignWorld) .homeForge{margin-top:2px!important;padding:4px 7px!important}
    #screen:has(.campaignWorld) .homeForge .fgRow.mt6{margin-top:2px}
    #screen:has(.campaignWorld) .homeForge .forgeAnim{margin-top:3px!important}
    #screen:has(.campaignWorld) .homeForge .forgeAnim:not(.compactAuto){min-height:70px;padding:5px 8px 5px}
    #screen:has(.campaignWorld) .homeForge .forgeScene{height:46px;overflow:visible}
    #screen:has(.campaignWorld) .homeForge .forgeHammerHit{top:-7px}
    #screen:has(.campaignWorld) .homeForge .forgeSpark{bottom:13px}

    #screen:has(.campaignWorld) .worldAction,
    #screen:has(.campaignWorld) .worldMenu>summary{min-width:44px;min-height:44px;height:44px}

    @media(max-height:700px){
      #screen:has(.campaignWorld) .worldAction,
      #screen:has(.campaignWorld) .worldMenu>summary{transform:none}
    }

    .recommendedActionCard{padding-right:52px}
    .recommendedActionCard .recommendedClose{
      width:44px;height:44px;min-width:44px!important;min-height:44px!important;
      right:4px;top:4px;
    }

    @media (max-width:520px) and (max-height:960px){
      #app:has(#screen .campaignWorld) #hud{padding-top:3px;padding-bottom:3px}
      #app:has(#screen .campaignWorld) #hud .avatar{width:34px;height:34px}
      #screen:has(.campaignWorld) .campaignWorld{margin-top:-16px}
      #screen:has(.campaignWorld) .homeForge{padding-top:3px!important;padding-bottom:3px!important}
      #screen:has(.campaignWorld) .homeForge .forgeAnim:not(.compactAuto){min-height:66px}
    }

    @media (max-width:520px) and (max-height:860px){
      #app:has(#screen .campaignWorld) #hud{padding:2px 7px 2px;gap:4px}
      #app:has(#screen .campaignWorld) #hud .pbox{padding-top:2px;padding-bottom:2px}
      #screen:has(.campaignWorld) .campaignWorld{margin-top:-20px}
      #screen:has(.campaignWorld) .homeForge .forgeAnim:not(.compactAuto){min-height:62px}
    }

    #overlay[data-sr-persistent='1']{contain:layout style;overscroll-behavior:contain}
    #overlay[data-sr-persistent='1'] > .card{max-height:min(82dvh,720px);overflow:hidden}
    #overlay[data-sr-persistent='1'] > .card > .mbody{max-height:calc(min(82dvh,720px) - 46px);overflow-y:auto;overscroll-behavior:contain}
  `;
  document.head.appendChild(css);

  /* ---------------------------------------------------------------------
     RENDER V80
     SCROLL_STABILITY_V47 reste utile pour les rafraîchissements de fond : il
     évite de reconstruire #screen pendant l'inertie iOS. Son défaut était de
     retarder aussi les actions volontaires du joueur de ~180 ms.

     Lors d'une vraie action UI, on ouvre uniquement pour la durée de l'événement
     une fenêtre de rendu immédiat. Le rendu demandé reflète déjà tout l'état
     courant, donc un ancien rendu différé devient redondant et est annulé.
     --------------------------------------------------------------------- */
  let userRenderDepth=0;
  let previousScrollBypass=false;

  function beginImmediateUserRender(){
    if(typeof scrollBypassV47==='undefined')return;
    if(userRenderDepth===0){
      previousScrollBypass=!!scrollBypassV47;
      if(typeof scrollDeferredV47!=='undefined')scrollDeferredV47=false;
      if(typeof scrollRenderTimerV47!=='undefined'&&scrollRenderTimerV47){
        clearTimeout(scrollRenderTimerV47);
        scrollRenderTimerV47=0;
      }
      scrollBypassV47=true;
    }
    userRenderDepth++;
    queueMicrotask(function(){
      userRenderDepth=Math.max(0,userRenderDepth-1);
      if(userRenderDepth===0&&typeof scrollBypassV47!=='undefined'){
        scrollBypassV47=previousScrollBypass;
      }
    });
  }

  function isGameActionTarget(e){
    const t=e&&e.target;
    if(!t||!t.closest)return false;
    return !!t.closest('#app [data-act], #app button, #app input, #app select, #app textarea, #overlay [data-act], #overlay button');
  }

  document.addEventListener('click',function(e){
    if(isGameActionTarget(e))beginImmediateUserRender();
  },true);
  document.addEventListener('change',function(e){
    if(isGameActionTarget(e))beginImmediateUserRender();
  },true);
  document.addEventListener('drop',function(e){
    if(e.target&&e.target.closest&&e.target.closest('#app'))beginImmediateUserRender();
  },true);
  document.addEventListener('keydown',function(e){
    if((e.key==='Enter'||e.key===' '||e.key==='Escape')&&isGameActionTarget(e))beginImmediateUserRender();
  },true);

  const nativeOpen=typeof window.openModal==='function'?window.openModal:null;
  const nativeClose=typeof window.closeModal==='function'?window.closeModal:null;
  if(!nativeOpen||!nativeClose)return;

  const queue=[];
  const QUEUE_TTL=8000;
  let modalActionDepth=0;
  let nativeTransitionDepth=0;
  let draining=false;

  function overlay(){return document.getElementById('overlay');}
  function markOverlay(){const ov=overlay();if(ov)ov.setAttribute('data-sr-persistent','1');}
  function titleKey(args){return String(args[1]||'');}
  function fullKey(args){return titleKey(args)+'\n'+String(args[0]||'');}
  function prune(){
    const now=Date.now();
    for(let i=queue.length-1;i>=0;i--)if(now-queue[i].at>QUEUE_TTL)queue.splice(i,1);
  }
  function enqueue(args){
    prune();
    const arr=Array.from(args),title=titleKey(arr),key=fullKey(arr);
    const idx=queue.findIndex(function(x){return title?x.title===title:x.key===key;});
    const entry={args:arr,title:title,key:key,at:Date.now()};
    if(idx>=0)queue[idx]=entry;
    else queue.push(entry);
    while(queue.length>6)queue.shift();
  }
  function nativeOpenSafe(ctx,args){
    nativeTransitionDepth++;
    try{return nativeOpen.apply(ctx,args);}finally{nativeTransitionDepth=Math.max(0,nativeTransitionDepth-1);markOverlay();}
  }
  function nativeCloseSafe(ctx,args){
    nativeTransitionDepth++;
    try{return nativeClose.apply(ctx,args);}finally{nativeTransitionDepth=Math.max(0,nativeTransitionDepth-1);}
  }
  function drain(){
    prune();
    if(draining||overlay()||!queue.length)return;
    draining=true;
    requestAnimationFrame(function(){
      draining=false;
      prune();
      if(overlay()||!queue.length)return;
      const next=queue.shift();
      if(next)nativeOpenSafe(window,next.args);
    });
  }

  function beginUserModalAction(){
    modalActionDepth++;
    queueMicrotask(function(){modalActionDepth=Math.max(0,modalActionDepth-1);});
  }

  document.addEventListener('click',function(e){
    if(!e.target||!e.target.closest||!e.target.closest('#overlay'))return;
    beginUserModalAction();
  },true);

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&overlay())beginUserModalAction();
  },true);

  window.openModal=function(){
    if(!overlay()||modalActionDepth>0||nativeTransitionDepth>0){
      return nativeOpenSafe(this,arguments);
    }
    enqueue(arguments);
  };

  window.closeModal=function(){
    if(!overlay()){
      const out=nativeCloseSafe(this,arguments);
      drain();
      return out;
    }
    if(modalActionDepth>0||nativeTransitionDepth>0){
      const out=nativeCloseSafe(this,arguments);
      drain();
      return out;
    }
    return undefined;
  };

  const app=document.getElementById('app');
  if(app){
    let queued=false;
    const mark=function(){
      const sc=document.getElementById('screen');
      if(sc)sc.classList.toggle('srHomeCompact',!!sc.querySelector('.campaignWorld'));
      markOverlay();
      if(!overlay())drain();
    };
    const schedule=function(){
      if(queued)return;
      queued=true;
      requestAnimationFrame(function(){queued=false;mark();});
    };
    new MutationObserver(schedule).observe(app,{childList:true,subtree:false});
    mark();
  }
})();
