/* SHADOWREACH · Bottom navigation layout V185
   One geometry for all four tabs. The older home-layout compatibility layer
   still writes inline styles during renders, so this final nav owner reapplies
   the same inline geometry synchronously in the same mutation cycle. */
(function(){
  'use strict';
  if(window.__srBottomNavLayoutV185)return;
  window.__srBottomNavLayoutV185=true;

  var style=document.createElement('style');
  style.id='srBottomNavLayoutV185';
  style.textContent=`
#app.srHomeFullArena>#tabs{
  box-sizing:border-box!important;
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  grid-template-rows:58px!important;
  align-items:start!important;
  flex:0 0 calc(58px + env(safe-area-inset-bottom))!important;
  height:calc(58px + env(safe-area-inset-bottom))!important;
  min-height:calc(58px + env(safe-area-inset-bottom))!important;
  max-height:calc(58px + env(safe-area-inset-bottom))!important;
  padding:0 4px env(safe-area-inset-bottom)!important;
  overflow:hidden!important;
}
#app.srHomeFullArena>#tabs>.tab{
  box-sizing:border-box!important;
  position:relative!important;
  display:block!important;
  width:100%!important;
  height:58px!important;
  min-width:0!important;
  min-height:58px!important;
  max-height:58px!important;
  padding:0!important;
  margin:0!important;
  overflow:hidden!important;
  transform:none!important;
}
#app.srHomeFullArena>#tabs>.tab>.ico{
  position:absolute!important;
  left:50%!important;
  top:3px!important;
  width:34px!important;height:34px!important;
  min-width:34px!important;min-height:34px!important;
  max-width:34px!important;max-height:34px!important;
  margin:0!important;padding:0!important;
  transform:translateX(-50%)!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  line-height:0!important;
}
#app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon{
  position:static!important;
  display:block!important;
  width:34px!important;height:34px!important;
  min-width:34px!important;min-height:34px!important;
  max-width:34px!important;max-height:34px!important;
  margin:0!important;
  transform:none!important;
}
#app.srHomeFullArena>#tabs>.tab>span:not(.ico){
  position:absolute!important;
  left:0!important;right:0!important;top:40px!important;
  display:block!important;
  width:100%!important;height:14px!important;
  margin:0!important;padding:0!important;
  transform:none!important;
  line-height:14px!important;
  font-size:10px!important;
  letter-spacing:.2px!important;
  text-align:center!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:clip!important;
}
#app.srHomeFullArena>#tabs>.tab>.dot{top:3px!important;right:22%!important}
#app.srHomeFullArena>#tabs>.tab .fantasyNavIcon{transition:filter .18s,opacity .18s!important}
#app.srHomeFullArena>#tabs>.tab.on .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.active .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab[aria-current="page"] .fantasyNavIcon{transform:none!important}
@media(max-width:370px),(max-height:720px){
  #app.srHomeFullArena>#tabs{
    grid-template-rows:54px!important;
    flex-basis:calc(54px + env(safe-area-inset-bottom))!important;
    height:calc(54px + env(safe-area-inset-bottom))!important;
    min-height:calc(54px + env(safe-area-inset-bottom))!important;
    max-height:calc(54px + env(safe-area-inset-bottom))!important;
  }
  #app.srHomeFullArena>#tabs>.tab{height:54px!important;min-height:54px!important;max-height:54px!important}
  #app.srHomeFullArena>#tabs>.tab>.ico{top:2px!important;width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;max-width:31px!important;max-height:31px!important}
  #app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon{width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;max-width:31px!important;max-height:31px!important}
  #app.srHomeFullArena>#tabs>.tab>span:not(.ico){top:36px!important;height:14px!important;line-height:14px!important;font-size:9.5px!important}
}
`;
  document.head.appendChild(style);

  function imp(el,p,v){if(el)el.style.setProperty(p,v,'important');}
  function apply(){
    var app=document.getElementById('app');
    var tabs=document.getElementById('tabs');
    if(!app||!tabs||!app.classList.contains('srHomeFullArena'))return;

    imp(tabs,'display','grid');
    imp(tabs,'grid-template-columns','repeat(4,minmax(0,1fr))');
    imp(tabs,'grid-template-rows','58px');
    imp(tabs,'height','calc(58px + env(safe-area-inset-bottom))');
    imp(tabs,'min-height','calc(58px + env(safe-area-inset-bottom))');
    imp(tabs,'max-height','calc(58px + env(safe-area-inset-bottom))');
    imp(tabs,'flex','0 0 calc(58px + env(safe-area-inset-bottom))');
    imp(tabs,'padding','0 4px env(safe-area-inset-bottom)');
    imp(tabs,'overflow','hidden');

    Array.prototype.forEach.call(tabs.querySelectorAll(':scope > .tab'),function(tab){
      imp(tab,'position','relative');imp(tab,'display','block');
      imp(tab,'width','100%');imp(tab,'height','58px');imp(tab,'min-height','58px');imp(tab,'max-height','58px');
      imp(tab,'padding','0');imp(tab,'margin','0');imp(tab,'overflow','hidden');imp(tab,'transform','none');

      var ico=tab.querySelector(':scope > .ico');
      if(ico){
        imp(ico,'position','absolute');imp(ico,'left','50%');imp(ico,'top','3px');
        imp(ico,'width','34px');imp(ico,'height','34px');imp(ico,'min-width','34px');imp(ico,'min-height','34px');
        imp(ico,'max-width','34px');imp(ico,'max-height','34px');imp(ico,'margin','0');imp(ico,'padding','0');
        imp(ico,'transform','translateX(-50%)');imp(ico,'display','flex');imp(ico,'align-items','center');imp(ico,'justify-content','center');
      }
      var fantasy=tab.querySelector('.fantasyNavIcon');
      if(fantasy){
        imp(fantasy,'width','34px');imp(fantasy,'height','34px');imp(fantasy,'min-width','34px');imp(fantasy,'min-height','34px');
        imp(fantasy,'max-width','34px');imp(fantasy,'max-height','34px');imp(fantasy,'margin','0');imp(fantasy,'transform','none');
      }
      var label=tab.querySelector(':scope > span:not(.ico)');
      if(label){
        imp(label,'position','absolute');imp(label,'left','0');imp(label,'right','0');imp(label,'top','40px');
        imp(label,'display','block');imp(label,'width','100%');imp(label,'height','14px');imp(label,'margin','0');imp(label,'padding','0');
        imp(label,'transform','none');imp(label,'line-height','14px');imp(label,'font-size','10px');imp(label,'letter-spacing','.2px');
        imp(label,'text-align','center');imp(label,'white-space','nowrap');imp(label,'overflow','hidden');
      }
    });
  }

  var tabs=document.getElementById('tabs');
  if(tabs)new MutationObserver(apply).observe(tabs,{childList:true,subtree:true});
  var app=document.getElementById('app');
  if(app)new MutationObserver(apply).observe(app,{attributes:true,attributeFilter:['class']});
  apply();
})();