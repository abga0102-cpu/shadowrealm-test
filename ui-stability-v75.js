// HOME_LAYOUT_AND_MODAL_STABILITY_V76
// Corrige les fermetures de fenêtres concurrentes, les sursauts de rendu et
// récupère de la hauteur réelle sur l'accueil sans réduire les combattants.
(function(){
  'use strict';

  const css=document.createElement('style');
  css.id='homeLayoutModalStabilityV76';
  css.textContent=`
    #screen{padding-bottom:max(4px,env(safe-area-inset-bottom));overflow-anchor:none;overscroll-behavior-y:contain}

    /* Accueil : compacter d'abord le chrome supérieur. L'arène et les sprites
       gardent leur taille; on récupère l'espace autour d'eux. */
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

    /* Animation Forge entièrement visible sans gonfler inutilement le panneau. */
    #screen:has(.campaignWorld) .homeForge .forgeAnim:not(.compactAuto){min-height:70px;padding:5px 8px 5px}
    #screen:has(.campaignWorld) .homeForge .forgeScene{height:46px;overflow:visible}
    #screen:has(.campaignWorld) .homeForge .forgeHammerHit{top:-7px}
    #screen:has(.campaignWorld) .homeForge .forgeSpark{bottom:13px}

    /* Les accès flottants restent tactiles : jamais de scale qui réduise la cible. */
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

    /* Seule la carte RACINE de la fenêtre est contrainte. Les cartes internes
       gardent leur propre hauteur et ne sont plus coupées. */
    #overlay[data-sr-persistent='1']{contain:layout style;overscroll-behavior:contain}
    #overlay[data-sr-persistent='1'] > .card{max-height:min(82dvh,720px);overflow:hidden}
    #overlay[data-sr-persistent='1'] > .card > .mbody{max-height:calc(min(82dvh,720px) - 46px);overflow-y:auto;overscroll-behavior:contain}
  `;
  document.head.appendChild(css);

  /* -----------------------------------------------------------------------
     MODALES V76
     Une notification automatique n'a plus le droit d'écraser une récompense
     ou un panneau que le joueur est en train d'utiliser. Elle attend son tour.
     En revanche, une action faite DANS la fenêtre peut la remplacer immédiatement
     (ex. détail d'objet -> détail mis à jour).
     ----------------------------------------------------------------------- */
  const modalQueue=[];
  let lastOverlayInteraction=-1e9;
  let draining=false;

  function nowMs(){return (typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();}
  function currentOverlay(){return document.getElementById('overlay');}
  function removeOverlay(){const ov=currentOverlay();if(ov)ov.remove();}

  function mountModal(html,title){
    const app=document.getElementById('app');
    if(!app)return;
    const ov=document.createElement('div');
    ov.id='overlay';
    ov.setAttribute('data-sr-persistent','1');
    ov.innerHTML='<div class="card frame">'+
      (title?'<div class="mhead"><span class="mt">'+title+'</span><div class="mx" data-act="closeModal">'+
        (typeof ic==='function'?ic('cross',10):'×')+'</div></div>':'')+
      '<div class="mbody">'+html+'</div></div>';
    ov.addEventListener('pointerdown',function(){lastOverlayInteraction=nowMs();},{capture:true,passive:true});
    ov.addEventListener('click',function(e){
      lastOverlayInteraction=nowMs();
      if(e.target===ov&&typeof closeModal==='function')closeModal();
    });
    app.appendChild(ov);
  }

  function enqueueModal(html,title){
    const key=String(title||'')+'\n'+String(html||'');
    if(modalQueue.some(function(x){return x.key===key;}))return;
    modalQueue.push({html:html,title:title,key:key,at:Date.now()});
    if(modalQueue.length>8)modalQueue.shift();
  }

  function drainModalQueue(){
    if(draining||currentOverlay()||!modalQueue.length)return;
    draining=true;
    requestAnimationFrame(function(){
      draining=false;
      if(currentOverlay())return;
      while(modalQueue.length&&Date.now()-modalQueue[0].at>30000)modalQueue.shift();
      const next=modalQueue.shift();
      if(next)mountModal(next.html,next.title);
    });
  }

  window.openModal=function(html,title){
    const ov=currentOverlay();
    if(!ov){mountModal(html,title);return;}

    // Une action effectuée à l'intérieur d'une fenêtre peut légitimement la
    // remplacer. Tout autre popup est considéré comme concurrent et mis en file.
    if(nowMs()-lastOverlayInteraction<650){
      removeOverlay();
      mountModal(html,title);
      return;
    }
    enqueueModal(html,title);
  };

  window.closeModal=function(){
    removeOverlay();
    drainModalQueue();
  };

  // Une navigation explicite vide les notifications trop anciennes mais ne
  // ferme jamais de force la fenêtre active. Le rendu de fond reste indépendant.
  const originalNav=typeof window.nav==='function'?window.nav:null;
  if(originalNav){
    window.nav=function(){
      while(modalQueue.length&&Date.now()-modalQueue[0].at>15000)modalQueue.shift();
      return originalNav.apply(this,arguments);
    };
  }

  // Marquage léger uniquement; aucun wrapper supplémentaire autour de render().
  // Cela évite d'empiler deux systèmes de stabilisation du rendu.
  const app=document.getElementById('app');
  if(app){
    const mark=function(){
      const sc=document.getElementById('screen');
      if(sc)sc.classList.toggle('srHomeCompact',!!sc.querySelector('.campaignWorld'));
      const ov=currentOverlay();
      if(ov)ov.setAttribute('data-sr-persistent','1');
    };
    let queued=false;
    const queue=function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;mark();});};
    new MutationObserver(queue).observe(app,{childList:true,subtree:false});
    mark();
  }
})();
