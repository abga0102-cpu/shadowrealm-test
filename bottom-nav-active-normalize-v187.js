/* SHADOWREACH · Bottom nav active icon normalization V187
   Prevent the selected bottom-nav icon from growing on active screens.
   Applies to both .ico-contained icons and direct fantasyNavIcon nodes. */
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

  function imp(el,p,v){ if(el) el.style.setProperty(p,v,'important'); }

  function apply(){
    var app=document.getElementById('app');
    var tabs=document.getElementById('tabs');
    if(!app || !tabs || !app.classList.contains('srHomeFullArena')) return;

    Array.prototype.forEach.call(
      tabs.querySelectorAll(':scope > .tab .fantasyNavIcon'),
      function(icon){
        imp(icon,'transform','none');
        imp(icon,'width','34px');
        imp(icon,'height','34px');
        imp(icon,'min-width','34px');
        imp(icon,'min-height','34px');
        imp(icon,'max-width','34px');
        imp(icon,'max-height','34px');
      }
    );
  }

  var tabs=document.getElementById('tabs');
  if(tabs)new MutationObserver(apply).observe(tabs,{childList:true,subtree:true,attributes:true});
  var app=document.getElementById('app');
  if(app)new MutationObserver(apply).observe(app,{attributes:true,attributeFilter:['class']});

  apply();
})();
