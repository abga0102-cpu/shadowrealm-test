// HOME_LAYOUT_AND_MODAL_STABILITY_V78
// Protège aussi les fermetures asynchrones et garde une file courte/actualisée.
(function(){
  'use strict';

  const css=document.createElement('style');
  css.id='homeLayoutModalStabilityV78';
  css.textContent=`
    #screen{padding-bottom:max(4px,env(safe-area-inset-bottom));overflow-anchor:none;overscroll-behavior-y:contain}

    #app:has(#screen .campaignWorld) #hud{padding:4px 8px 4px;gap:5px}
    #app:has(#screen .campaignWorld) #hud .pbox{padding:3px 6px 3px 4px}
    #app:has(#screen .campaignWorld) #hud .avatar{width:36px;height:36px}
    #app:has(#screen .campaignWorld) #hud .iconBtn{width:38px;height:38px;min-width:38px}

    #screen:has(.campaignWorld){scroll-padding-bottom:118px}
    #screen:has(.campaignWorld) .recommendedWrap{margin-top:-2px;margin-bottom:1px}
    #screen:has(.campaignWorld) .campaignWorld{margin-top:-10px}
    #screen:has(.campaignWorld) .campaignWorld #arenaSlot{margin-top:0}
    #screen:has(.campaignWorld) .homeSkillBar{margin-top:1px!important}
    #screen:has(.campaignWorld) .homeForge{margin-top:2px!important;padding:4px 7px!important}
    #screen:has(.campaignWorld) .homeForge .fgRow.mt6{margin-top:2px}
    #screen:has(.campaignWorld) .homeForge .forgeAnim{margin-top:3px!important}
    #screen:has(.campaignWorld) .homeForge .forgeAnim:not(.compactAuto){min-height:70px;padding:5px 8px 5px}
    #screen:has(.campaignWorld) .homeForge .forgeScene{height:46px;overflow:visible}
    #screen:has(.campaignWorld) .homeForge .forgeHammerHit{top:-7px}
    #screen:has(.campaignWorld) .homeForge .forgeSpark{bottom:13px}

    #screen:has(.campaignWorld) .worldAction,
    #screen:has(.campaignWorld) .worldMenu>summary{min-width:44px;min-height:44px;height:44px}

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
    for(let i=queue.length-1;i>=0;i--) if(now-queue[i].at>QUEUE_TTL) queue.splice(i,1);
  }
  function enqueue(args){
    prune();
    const arr=Array.from(args), title=titleKey(arr), key=fullKey(arr);
    // Même notification : conserver la version la plus récente au lieu d'empiler
    // un vieux snapshot HTML derrière un nouveau.
    const idx=queue.findIndex(function(x){return title ? x.title===title : x.key===key;});
    const entry={args:arr,title:title,key:key,at:Date.now()};
    if(idx>=0) queue[idx]=entry;
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

  // Le contexte joueur ne vaut que pendant l'événement exact déclenché dans la modale.
  document.addEventListener('click',function(e){
    if(!e.target||!e.target.closest||!e.target.closest('#overlay'))return;
    modalActionDepth++;
    queueMicrotask(function(){modalActionDepth=Math.max(0,modalActionDepth-1);});
  },true);

  window.openModal=function(){
    if(!overlay()||modalActionDepth>0||nativeTransitionDepth>0){
      return nativeOpenSafe(this,arguments);
    }
    enqueue(arguments);
  };

  window.closeModal=function(){
    // Sans fenêtre, laisser le moteur natif nettoyer ce qu'il veut.
    if(!overlay()){
      const out=nativeCloseSafe(this,arguments);
      drain();
      return out;
    }
    // Fermeture réellement liée à l'action du joueur, ou transition interne
    // du moteur de modale : autorisée immédiatement.
    if(modalActionDepth>0||nativeTransitionDepth>0){
      const out=nativeCloseSafe(this,arguments);
      drain();
      return out;
    }
    // Une fermeture asynchrone ne peut plus tuer la récompense/panneau actif.
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
