/* SHADOWREACH · Bottom nav active icon normalization V187
   Compatibility layer retained only until V188 removes the legacy load chain.
   V188: make runtime writes idempotent and match the compact breakpoint so this
   observer cannot fight the canonical navigation owner. */
(function(){
  'use strict';
  if(window.__srBottomNavActiveNormalizeV187)return;
  window.__srBottomNavActiveNormalizeV187=true;

  var style=document.createElement('style');
  style.id='srBottomNavActiveNormalizeV187';
  style.textContent=`
#app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.on .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.active .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab[aria-current="page"] .fantasyNavIcon{
  transform:none!important;
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  min-height:34px!important;
  max-width:34px!important;
  max-height:34px!important;
}

@media(max-width:370px),(max-height:720px){
  #app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab.on .fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab.active .fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab[aria-current="page"] .fantasyNavIcon{
    width:31px!important;
    height:31px!important;
    min-width:31px!important;
    min-height:31px!important;
    max-width:31px!important;
    max-height:31px!important;
    transform:none!important;
  }
}
`;
  document.head.appendChild(style);

  function imp(el,p,v){
    if(!el)return;
    if(el.style.getPropertyValue(p)!==v||el.style.getPropertyPriority(p)!=='important'){
      el.style.setProperty(p,v,'important');
    }
  }

  function compact(){
    try{return matchMedia('(max-width:370px),(max-height:720px)').matches;}catch(_){return false;}
  }

  function apply(){
    var app=document.getElementById('app');
    var tabs=document.getElementById('tabs');
    if(!app || !tabs || !app.classList.contains('srHomeFullArena')) return;

    var size=compact()?'31px':'34px';
    Array.prototype.forEach.call(
      tabs.querySelectorAll(':scope > .tab .fantasyNavIcon'),
      function(icon){
        imp(icon,'transform','none');
        imp(icon,'width',size);
        imp(icon,'height',size);
        imp(icon,'min-width',size);
        imp(icon,'min-height',size);
        imp(icon,'max-width',size);
        imp(icon,'max-height',size);
      }
    );
  }

  var tabs=document.getElementById('tabs');
  if(tabs)new MutationObserver(apply).observe(tabs,{childList:true,subtree:true,attributes:true});
  var app=document.getElementById('app');
  if(app)new MutationObserver(apply).observe(app,{attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',apply,{passive:true});
  window.addEventListener('orientationchange',apply,{passive:true});

  apply();
})();
