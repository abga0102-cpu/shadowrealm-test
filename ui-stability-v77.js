// HOME_LAYOUT_AND_MODAL_STABILITY_V77
// Garde le moteur de modale natif et distingue exactement les actions faites
// dans une fenêtre des notifications asynchrones qui arrivent en arrière-plan.
(function(){
  'use strict';

  const css=document.createElement('style');
  css.id='homeLayoutModalStabilityV77';
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
  let modalActionDepth=0;
  let draining=false;

  function overlay(){return document.getElementById('overlay');}
  function markOverlay(){const ov=overlay();if(ov)ov.setAttribute('data-sr-persistent','1');}
  function keyOf(args){return String(args[1]||'')+'\n'+String(args[0]||'');}
  function enqueue(args){
    const key=keyOf(args);
    if(queue.some(function(x){return x.key===key;}))return;
    queue.push({args:Array.from(args),key:key,at:Date.now()});
    if(queue.length>8)queue.shift();
  }
  function drain(){
    if(draining||overlay()||!queue.length)return;
    draining=true;
    requestAnimationFrame(function(){
      draining=false;
      if(overlay())return;
      while(queue.length&&Date.now()-queue[0].at>30000)queue.shift();
      const next=queue.shift();
      if(!next)return;
      nativeOpen.apply(window,next.args);
      markOverlay();
    });
  }

  // Important : cette information ne vit que pendant LE même événement JS.
  // Un setTimeout, une fin de recherche, un oeuf, etc. arrivent après la microtask
  // et sont donc forcément traités comme des popups asynchrones.
  document.addEventListener('click',function(e){
    if(!e.target||!e.target.closest)return;
    const ov=e.target.closest('#overlay');
    if(!ov)return;
    modalActionDepth++;
    queueMicrotask(function(){modalActionDepth=Math.max(0,modalActionDepth-1);});
  },true);

  window.openModal=function(){
    if(!overlay()){
      const out=nativeOpen.apply(this,arguments);
      markOverlay();
      return out;
    }
    if(modalActionDepth>0){
      const out=nativeOpen.apply(this,arguments);
      markOverlay();
      return out;
    }
    enqueue(arguments);
  };

  window.closeModal=function(){
    const out=nativeClose.apply(this,arguments);
    drain();
    return out;
  };

  const app=document.getElementById('app');
  if(app){
    let queued=false;
    const mark=function(){
      const sc=document.getElementById('screen');
      if(sc)sc.classList.toggle('srHomeCompact',!!sc.querySelector('.campaignWorld'));
      markOverlay();
    };
    const schedule=function(){
      if(queued)return;
      queued=true;
      requestAnimationFrame(function(){queued=false;mark();if(!overlay())drain();});
    };
    new MutationObserver(schedule).observe(app,{childList:true,subtree:false});
    mark();
  }
})();
