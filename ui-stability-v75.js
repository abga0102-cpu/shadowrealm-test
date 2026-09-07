// HOME_LAYOUT_AND_MODAL_STABILITY_V75
// Compacte l'accueil sur les écrans mobiles hauts, remonte l'arène sans réduire
// les combattants et protège les fenêtres de récompense contre les rerenders.
(function(){
  'use strict';

  const css=document.createElement('style');
  css.id='homeLayoutModalStabilityV75';
  css.textContent=`
    /* Le contenu ne doit jamais se glisser sous la barre principale. */
    #screen{padding-bottom:max(4px,env(safe-area-inset-bottom));overflow-anchor:none;overscroll-behavior-y:contain}

    /* Accueil : récupérer la hauteur gaspillée au-dessus et réserver la partie
       basse aux contrôles/Forge. La taille interne de #arena n'est pas changée,
       donc les combattants gardent exactement leur échelle. */
    #screen:has(.campaignWorld){scroll-padding-bottom:118px}
    #screen:has(.campaignWorld) .recommendedWrap{margin-bottom:2px}
    #screen:has(.campaignWorld) .campaignWorld{margin-top:-4px}
    #screen:has(.campaignWorld) .campaignWorld #arenaSlot{margin-top:0}
    #screen:has(.campaignWorld) .homeSkillBar{margin-top:2px!important}
    #screen:has(.campaignWorld) .homeForge{margin-top:3px!important;padding:5px 7px!important}
    #screen:has(.campaignWorld) .homeForge .fgRow.mt6{margin-top:3px}
    #screen:has(.campaignWorld) .homeForge .forgeAnim{margin-top:4px!important}

    /* L'animation manuelle de Forge avait une fenêtre trop basse : on lui
       garantit une vraie zone de mouvement et on garde le marteau à l'intérieur. */
    #screen:has(.campaignWorld) .homeForge .forgeAnim:not(.compactAuto){min-height:84px;padding:7px 9px 6px}
    #screen:has(.campaignWorld) .homeForge .forgeScene{height:52px;overflow:visible}
    #screen:has(.campaignWorld) .homeForge .forgeHammerHit{top:-2px}
    #screen:has(.campaignWorld) .homeForge .forgeSpark{bottom:18px}

    /* iPhone / mobiles proches de la capture : compacter le chrome avant de
       toucher à l'arène. Les boutons restent >=44 px dans le décor. */
    @media (max-width:520px) and (max-height:960px){
      #screen:has(.campaignWorld) .campaignWorld{margin-top:-10px}
      #screen:has(.campaignWorld) .worldAction,
      #screen:has(.campaignWorld) .worldMenu>summary{min-width:44px;height:40px;padding:2px 5px}
      #screen:has(.campaignWorld) .homeForge{padding-top:4px!important;padding-bottom:4px!important}
      #screen:has(.campaignWorld) .homeForge .forgeAnim:not(.compactAuto){min-height:78px}
      #screen:has(.campaignWorld) .recommendedWrap{margin-top:-2px}
    }

    @media (max-width:520px) and (max-height:860px){
      #screen:has(.campaignWorld) .campaignWorld{margin-top:-16px}
      #screen:has(.campaignWorld) .worldAction,
      #screen:has(.campaignWorld) .worldMenu>summary{transform:scale(.92);transform-origin:top left}
      #screen:has(.campaignWorld) .worldDev,
      #screen:has(.campaignWorld) .worldDefis{transform-origin:top right}
      #screen:has(.campaignWorld) .homeForge .forgeAnim:not(.compactAuto){min-height:72px}
    }

    /* Une modale ouverte ne doit pas participer aux variations de layout de
       l'écran derrière elle. */
    #overlay[data-sr-persistent='1']{contain:layout style;overscroll-behavior:contain}
    #overlay[data-sr-persistent='1'] .card{max-height:min(82dvh,720px);overflow:hidden}
    #overlay[data-sr-persistent='1'] .mbody{max-height:calc(min(82dvh,720px) - 46px);overflow-y:auto;overscroll-behavior:contain}
  `;
  document.head.appendChild(css);

  // Marquer chaque nouvelle modale et empêcher un rerender de fond de la faire
  // disparaître. Une fermeture explicite reste évidemment autorisée.
  let explicitCloseGeneration=0;
  const originalClose=typeof window.closeModal==='function'?window.closeModal:null;
  if(originalClose){
    window.closeModal=function(){
      explicitCloseGeneration++;
      return originalClose.apply(this,arguments);
    };
  }

  const originalOpen=typeof window.openModal==='function'?window.openModal:null;
  if(originalOpen){
    window.openModal=function(){
      const out=originalOpen.apply(this,arguments);
      const ov=document.getElementById('overlay');
      if(ov) ov.setAttribute('data-sr-persistent','1');
      return out;
    };
  }

  const originalRender=typeof window.render==='function'?window.render:null;
  if(originalRender){
    window.render=function(){
      const ov=document.getElementById('overlay');
      const closeGen=explicitCloseGeneration;
      const parent=ov&&ov.parentNode;
      const out=originalRender.apply(this,arguments);
      // Un rendu normal n'a pas le droit de fermer une fenêtre déjà ouverte.
      // Si closeModal a été demandé explicitement, on respecte la fermeture.
      if(ov && !document.documentElement.contains(ov) && closeGen===explicitCloseGeneration){
        (parent&&document.documentElement.contains(parent)?parent:document.getElementById('app')).appendChild(ov);
      }
      const now=document.getElementById('overlay');
      if(now) now.setAttribute('data-sr-persistent','1');
      return out;
    };
  }

  // Les mutations de l'accueil peuvent arriver après le premier rendu. Cette
  // routine ne réécrit rien : elle ne fait qu'ajouter un marqueur de contexte,
  // évitant les recalculs/flashs provoqués par des modifications DOM inutiles.
  const app=document.getElementById('app');
  if(app){
    const mark=function(){
      const sc=document.getElementById('screen');
      if(!sc)return;
      sc.classList.toggle('srHomeCompact',!!sc.querySelector('.campaignWorld'));
      const ov=document.getElementById('overlay');
      if(ov)ov.setAttribute('data-sr-persistent','1');
    };
    let queued=false;
    const queue=function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;mark();});};
    new MutationObserver(queue).observe(app,{childList:true,subtree:false});
    mark();
  }
})();
