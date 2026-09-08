/* SHADOWREACH · Bottom navigation interaction contract V188
   Keeps all four primary tabs as one reliable click/touch target.
   It never performs navigation itself: the game already owns navigation through
   its delegated data-act="go" click handler. This layer only guarantees that the
   four tabs keep the correct attributes and that decorative children cannot
   steal pointer events. */
(function(){
  'use strict';
  if(window.__srBottomNavInteractionV188)return;
  window.__srBottomNavInteractionV188=true;

  var TARGET={
    accueil:'accueil',
    equipement:'equipement',
    developpement:'developpement',
    reglages:'parametres',
    parametres:'parametres'
  };
  var LABEL={
    accueil:'Accueil',
    equipement:'Équipement',
    developpement:'Développement',
    reglages:'Réglages',
    parametres:'Réglages'
  };

  var style=document.createElement('style');
  style.id='srBottomNavInteractionV188';
  style.textContent=`
#tabs>.tab{
  cursor:pointer!important;
  touch-action:manipulation!important;
  -webkit-tap-highlight-color:transparent!important;
  -webkit-user-select:none!important;
  user-select:none!important;
}
#tabs>.tab>.ico,
#tabs>.tab>.fantasyNavIcon,
#tabs>.tab>.navLabel,
#tabs>.tab>span:not(.ico):not(.fantasyNavIcon),
#tabs>.tab>.dot,
#tabs>.tab svg,
#tabs>.tab img{
  pointer-events:none!important;
}
#tabs>.tab:focus-visible{
  outline:2px solid #FBDD8C!important;
  outline-offset:-3px!important;
}
`;
  document.head.appendChild(style);

  function normalizeText(v){
    return String(v||'').trim().toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
  }

  function setAttr(el,name,value){
    if(el.getAttribute(name)!==String(value))el.setAttribute(name,String(value));
  }

  function keyFor(tab){
    var raw=normalizeText(tab.getAttribute('data-nav-key')||tab.getAttribute('data-arg')||'');
    if(raw==='parametres')return'parametres';
    if(raw==='reglages')return'reglages';
    if(raw==='accueil'||raw==='equipement'||raw==='developpement')return raw;

    var text=normalizeText(tab.textContent);
    if(text.indexOf('accueil')!==-1)return'accueil';
    if(text.indexOf('equipement')!==-1)return'equipement';
    if(text.indexOf('developpement')!==-1)return'developpement';
    if(text.indexOf('reglages')!==-1)return'reglages';
    return'';
  }

  function harden(tab){
    if(!tab||tab.parentElement!==document.getElementById('tabs'))return false;
    var key=keyFor(tab);
    var target=TARGET[key];
    if(!target)return false;

    setAttr(tab,'data-act','go');
    setAttr(tab,'data-arg',target);
    setAttr(tab,'data-nav-target',target);
    setAttr(tab,'role','button');
    setAttr(tab,'tabindex','0');
    setAttr(tab,'aria-label',LABEL[key]||LABEL[target]||target);
    setAttr(tab,'draggable','false');
    if(tab.tagName==='BUTTON'&&!tab.getAttribute('type'))tab.setAttribute('type','button');
    return true;
  }

  function apply(){
    var tabs=document.getElementById('tabs');
    if(!tabs)return;
    Array.prototype.forEach.call(tabs.querySelectorAll(':scope > .tab'),harden);
  }

  function directTab(target,tabs){
    if(!target||!target.closest)return null;
    var tab=target.closest('#tabs > .tab');
    return tab&&tab.parentElement===tabs?tab:null;
  }

  var tabs=document.getElementById('tabs');
  if(tabs){
    /* Repair the contract in capture phase so the game's existing delegated
       bubble-phase click handler always receives data-act="go" + the right route. */
    tabs.addEventListener('click',function(e){
      var tab=directTab(e.target,tabs);
      if(tab)harden(tab);
    },true);

    tabs.addEventListener('dragstart',function(e){
      if(directTab(e.target,tabs))e.preventDefault();
    });

    new MutationObserver(apply).observe(tabs,{
      childList:true,subtree:true,attributes:true,
      attributeFilter:['data-act','data-arg','data-nav-key','class']
    });
  }

  /* Lightweight diagnostic for regression checks from DevTools/smoke harnesses. */
  window.__srBottomNavV188Audit=function(){
    var root=document.getElementById('tabs');
    var expected=['accueil','equipement','developpement','parametres'];
    if(!root)return{ok:false,count:0,targets:[]};
    var targets=Array.prototype.map.call(root.querySelectorAll(':scope > .tab'),function(tab){
      return tab.getAttribute('data-nav-target')||tab.getAttribute('data-arg')||'';
    });
    return{
      ok:targets.length===4&&expected.every(function(v,i){return targets[i]===v;}),
      count:targets.length,
      targets:targets
    };
  };

  apply();
})();