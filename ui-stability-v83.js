// RELIABLE_ACTIONS_AND_MODAL_STABILITY_V83 · Phase 2C modal lifecycle owner
// Priorité: aucun bouton volontaire du joueur ne doit être bloqué par la couche de stabilité.
(function(){
  'use strict';
  if(window.__srModalLifecyclePhase2C)return;
  window.__srModalLifecyclePhase2C=true;

  const css=document.createElement('style');
  css.id='reliableActionsModalStabilityV83';
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
    .recommendedActionCard .recommendedClose{width:44px;height:44px;min-width:44px!important;min-height:44px!important;right:4px;top:4px}
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
    #app [data-act]:active,#overlay [data-act]:active{filter:brightness(1.14)}
  `;
  document.head.appendChild(css);

  // Un vrai tap peut rendre immédiatement. Le bypass ne reste actif que jusqu'au clic.
  let tap=null;
  let bypassArmed=false;
  function actionTarget(t){return t&&t.closest?t.closest('#app [data-act]'):null;}
  function clearBypass(){
    if(!bypassArmed)return;
    bypassArmed=false;
    if(typeof scrollBypassV47!=='undefined')scrollBypassV47=false;
  }
  document.addEventListener('pointerdown',function(e){
    const a=actionTarget(e.target);
    tap=a?{id:e.pointerId,x:e.clientX,y:e.clientY,target:a,moved:false}:null;
  },true);
  document.addEventListener('pointermove',function(e){
    if(!tap||e.pointerId!==tap.id)return;
    if(Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>10)tap.moved=true;
  },true);
  document.addEventListener('pointerup',function(e){
    if(!tap||e.pointerId!==tap.id){tap=null;return;}
    const valid=!tap.moved&&actionTarget(e.target)===tap.target;
    tap=null;
    if(!valid||typeof scrollBypassV47==='undefined')return;
    if(typeof scrollDeferredV47!=='undefined')scrollDeferredV47=false;
    if(typeof scrollRenderTimerV47!=='undefined'&&scrollRenderTimerV47){clearTimeout(scrollRenderTimerV47);scrollRenderTimerV47=0;}
    scrollBypassV47=true;
    bypassArmed=true;
    setTimeout(clearBypass,80);
  },true);
  document.addEventListener('click',function(){setTimeout(clearBypass,0);},true);
  document.addEventListener('pointercancel',function(){tap=null;clearBypass();},true);

  // Récolte met à jour ses chiffres toutes les secondes. Le moteur remplaçait
  // auparavant toute la .mbody, y compris RÉCLAMER, ce qui pouvait supprimer le
  // bouton entre pointerdown et pointerup sur Safari/WebKit. On rafraîchit tout
  // le contenu informatif mais on conserve le même nœud d'action jusqu'à la fermeture.
  const nativeHarvestRefresh=typeof window.refreshHarvestModal==='function'?window.refreshHarvestModal:null;
  if(nativeHarvestRefresh&&typeof window.harvestModalHTML==='function'){
    window.refreshHarvestModal=function(){
      const ov=document.getElementById('overlay');
      if(!ov||ov.getAttribute('data-modal')!=='harvest')return nativeHarvestRefresh.apply(this,arguments);
      const body=ov.querySelector('.mbody');
      if(!body)return;
      const action=body.lastElementChild;
      const liveBtn=action&&action.querySelector? action.querySelector('[data-act="harvestClaim"]'):null;
      if(!action||!liveBtn)return nativeHarvestRefresh.apply(this,arguments);

      const fresh=document.createElement('div');
      fresh.innerHTML=window.harvestModalHTML();
      const freshAction=fresh.lastElementChild;
      const freshBtn=freshAction&&freshAction.querySelector?freshAction.querySelector('[data-act="harvestClaim"]'):null;
      if(!freshAction||!freshBtn)return nativeHarvestRefresh.apply(this,arguments);

      // Keep the live action node attached throughout the refresh. Only mirror
      // whether the current state makes the claim available.
      if(freshBtn.hasAttribute('disabled')) liveBtn.setAttribute('disabled','');
      else liveBtn.removeAttribute('disabled');
      liveBtn.disabled=!!freshBtn.disabled;

      while(body.firstChild&&body.firstChild!==action)body.removeChild(body.firstChild);
      while(fresh.firstChild&&fresh.firstChild!==freshAction)body.insertBefore(fresh.firstChild,action);
      if(typeof queueDecisionHierarchyV30==='function')queueDecisionHierarchyV30();
    };
    window.__srHarvestStableActionPhase2C=true;
  }

  const nativeOpen=typeof window.openModal==='function'?window.openModal:null;
  const nativeClose=typeof window.closeModal==='function'?window.closeModal:null;
  if(!nativeOpen||!nativeClose)return;

  const queue=[];
  let draining=false;
  let explicitUntil=0;
  let nativeTransitionDepth=0;
  let lastModalState=null;
  function now(){return typeof performance!=='undefined'?performance.now():Date.now();}
  function overlay(){return document.getElementById('overlay');}
  function markOverlay(){const ov=overlay();if(ov)ov.setAttribute('data-sr-persistent','1');}
  function publishModalState(force,openOverride){
    const open=typeof openOverride==='boolean'?openOverride:!!overlay();
    markOverlay();
    if(!force&&lastModalState===open)return;
    lastModalState=open;
    try{window.dispatchEvent(new CustomEvent('sr:modal-state',{detail:{open:open}}));}catch(_){}
  }
  window.__srGetModalStatePhase2C=function(){return !!overlay();};
  function fullKey(args){return String(args[1]||'')+'\n'+String(args[0]||'');}
  function enqueue(args){
    const arr=Array.from(args),key=fullKey(arr);
    if(queue.some(function(x){return x.key===key;}))return;
    queue.push({args:arr,key:key});
  }
  function nativeOpenSafe(ctx,args){
    nativeTransitionDepth++;
    publishModalState(false,true);
    try{return nativeOpen.apply(ctx,args);}finally{
      nativeTransitionDepth=Math.max(0,nativeTransitionDepth-1);
      markOverlay();
      publishModalState();
    }
  }
  function nativeCloseSafe(ctx,args){
    nativeTransitionDepth++;
    try{return nativeClose.apply(ctx,args);}finally{
      nativeTransitionDepth=Math.max(0,nativeTransitionDepth-1);
      publishModalState();
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

  // Les actions de modale peuvent contenir un setTimeout / Promise avant de fermer.
  // V81/V82 n'autorisaient la fermeture que pendant la microtask du clic, ce qui
  // rendait certaines commandes visuellement mortes. On conserve ici une courte
  // fenêtre d'intention utilisateur, et le clic sur le fond natif est aussi reconnu.
  document.addEventListener('click',function(e){
    if(!e.target||!e.target.closest)return;
    const ov=e.target.closest('#overlay');
    if(!ov)return;
    if(e.target===ov||e.target.closest('[data-act]'))explicitUntil=now()+1500;
  },true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&overlay())explicitUntil=now()+1500;},true);

  window.openModal=function(){
    if(!overlay()||explicitUntil>now()||nativeTransitionDepth>0)return nativeOpenSafe(this,arguments);
    enqueue(arguments);
  };

  window.closeModal=function(){
    if(!overlay()){
      const out=nativeCloseSafe(this,arguments);drain();return out;
    }
    // Une fermeture explicitement déclenchée par le joueur ne doit jamais être bloquée.
    if(explicitUntil>now()||nativeTransitionDepth>0){
      const out=nativeCloseSafe(this,arguments);drain();return out;
    }
    // S'il existe une ouverture asynchrone mise en attente, on protège la modale
    // actuelle contre la fermeture sœur de ce callback. Sinon on laisse le moteur
    // natif fermer: le précédent blocage global était la cause des boutons morts.
    if(queue.length)return undefined;
    const out=nativeCloseSafe(this,arguments);drain();return out;
  };

  const app=document.getElementById('app');
  if(app){
    let queued=false;
    const mark=function(){const sc=document.getElementById('screen');if(sc)sc.classList.toggle('srHomeCompact',!!sc.querySelector('.campaignWorld'));markOverlay();publishModalState();if(!overlay())drain();};
    const schedule=function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;mark();});};
    new MutationObserver(schedule).observe(app,{childList:true,subtree:false});
    mark();
  }
  publishModalState(true);
})();
