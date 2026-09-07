// MODAL_AND_MOBILE_STABILITY_V81
// Stabilisation après V80 : conserve la protection iOS de V47, évite les pertes de
// notifications et ne considère comme action utilisateur que les vraies commandes UI.
(function(){
  'use strict';

  const css=document.createElement('style');
  css.id='modalMobileStabilityV81';
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

  // V47 reste propriétaire du comportement de rendu pendant l'inertie iOS.
  // V80 le court-circuitait pendant les clics, ce qui pouvait réintroduire les sauts
  // que V47 avait précisément été ajouté pour éliminer. V81 ne touche plus à render().

  const nativeOpen=typeof window.openModal==='function'?window.openModal:null;
  const nativeClose=typeof window.closeModal==='function'?window.closeModal:null;
  if(!nativeOpen||!nativeClose)return;

  const queue=[];
  let modalActionDepth=0;
  let nativeTransitionDepth=0;
  let draining=false;

  function overlay(){return document.getElementById('overlay');}
  function markOverlay(){const ov=overlay();if(ov)ov.setAttribute('data-sr-persistent','1');}
  function fullKey(args){return String(args[1]||'')+'\n'+String(args[0]||'');}

  function enqueue(args){
    const arr=Array.from(args),key=fullKey(arr);
    // On déduplique uniquement une notification strictement identique. Deux événements
    // différents portant le même titre doivent tous les deux pouvoir être vus.
    if(queue.some(function(x){return x.key===key;}))return;
    queue.push({args:arr,key:key});
    // Garde-fou mémoire uniquement. Aucun TTL : une récompense importante ne disparaît
    // pas parce que le joueur a laissé une fenêtre ouverte plus de quelques secondes.
    while(queue.length>12)queue.shift();
  }

  function nativeOpenSafe(ctx,args){
    nativeTransitionDepth++;
    try{return nativeOpen.apply(ctx,args);}finally{
      nativeTransitionDepth=Math.max(0,nativeTransitionDepth-1);
      markOverlay();
    }
  }
  function nativeCloseSafe(ctx,args){
    nativeTransitionDepth++;
    try{return nativeClose.apply(ctx,args);}finally{
      nativeTransitionDepth=Math.max(0,nativeTransitionDepth-1);
    }
  }

  function drain(){
    if(draining||overlay()||!queue.length)return;
    draining=true;
    requestAnimationFrame(function(){
      draining=false;
      if(overlay()||!queue.length)return;
      const next=queue.shift();
      if(next)nativeOpenSafe(window,next.args);
    });
  }

  const microtask=window.queueMicrotask||function(fn){Promise.resolve().then(fn);};
  function beginUserModalAction(){
    modalActionDepth++;
    microtask(function(){modalActionDepth=Math.max(0,modalActionDepth-1);});
  }

  // Seulement une vraie commande dans la modale compte comme interaction volontaire.
  // Un clic décoratif dans l'overlay ne donne plus le droit à un callback concurrent
  // de remplacer ou fermer la fenêtre active.
  document.addEventListener('click',function(e){
    if(!e.target||!e.target.closest)return;
    const action=e.target.closest('#overlay [data-act], #overlay button');
    if(action)beginUserModalAction();
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
    // Une fermeture asynchrone ne peut pas supprimer la fenêtre que le joueur consulte.
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
