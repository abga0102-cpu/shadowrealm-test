/* SHADOWREACH · Canonical bottom navigation owner V188
   Single source of truth for bottom-nav geometry and visual state.
   Older compatibility layers may still exist for now, but this module loads last
   and reapplies one identical contract to all four primary tabs. */
(function(){
  'use strict';
  if(window.__srBottomNavCanonicalV188)return;
  window.__srBottomNavCanonicalV188=true;

  var STYLE_ID='srBottomNavCanonicalV188';
  var existing=document.getElementById(STYLE_ID);
  if(existing)existing.remove();

  var style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
#app.srHomeFullArena>#tabs{
  box-sizing:border-box!important;
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  grid-template-rows:58px!important;
  align-items:start!important;
  width:100%!important;
  flex:0 0 calc(58px + env(safe-area-inset-bottom))!important;
  height:calc(58px + env(safe-area-inset-bottom))!important;
  min-height:calc(58px + env(safe-area-inset-bottom))!important;
  max-height:calc(58px + env(safe-area-inset-bottom))!important;
  padding:0 4px env(safe-area-inset-bottom)!important;
  margin:0!important;
  overflow:hidden!important;
}
#app.srHomeFullArena>#tabs>.tab{
  box-sizing:border-box!important;
  position:relative!important;
  display:block!important;
  width:100%!important;
  min-width:0!important;
  height:58px!important;
  min-height:58px!important;
  max-height:58px!important;
  padding:0!important;
  margin:0!important;
  overflow:hidden!important;
  transform:none!important;
  line-height:1!important;
}
#app.srHomeFullArena>#tabs>.tab>.ico{
  box-sizing:border-box!important;
  position:absolute!important;
  left:50%!important;
  top:3px!important;
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  min-height:34px!important;
  max-width:34px!important;
  max-height:34px!important;
  margin:0!important;
  padding:0!important;
  transform:translateX(-50%)!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  line-height:0!important;
  overflow:visible!important;
}
#app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon{
  box-sizing:border-box!important;
  position:static!important;
  display:block!important;
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  min-height:34px!important;
  max-width:34px!important;
  max-height:34px!important;
  margin:0!important;
  padding:0!important;
  transform:none!important;
  line-height:0!important;
  transition:filter .18s,opacity .18s!important;
}
#app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon{
  position:absolute!important;
  left:50%!important;
  top:3px!important;
  transform:translateX(-50%)!important;
}
#app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon){
  box-sizing:border-box!important;
  position:absolute!important;
  left:0!important;
  right:0!important;
  top:40px!important;
  display:block!important;
  width:100%!important;
  height:14px!important;
  margin:0!important;
  padding:0!important;
  transform:none!important;
  line-height:14px!important;
  font-size:10px!important;
  letter-spacing:.2px!important;
  text-align:center!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:clip!important;
}
#app.srHomeFullArena>#tabs>.tab>.dot{
  top:3px!important;
  right:22%!important;
}
/* Active state may glow, but geometry never changes. */
#app.srHomeFullArena>#tabs>.tab.on .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.active .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab[aria-current="page"] .fantasyNavIcon{
  transform:none!important;
}
#app.srHomeFullArena>#tabs>.tab.on>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.active>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab[aria-current="page"]>.fantasyNavIcon{
  transform:translateX(-50%)!important;
}
@media(max-width:370px),(max-height:720px){
  #app.srHomeFullArena>#tabs{
    grid-template-rows:54px!important;
    flex-basis:calc(54px + env(safe-area-inset-bottom))!important;
    height:calc(54px + env(safe-area-inset-bottom))!important;
    min-height:calc(54px + env(safe-area-inset-bottom))!important;
    max-height:calc(54px + env(safe-area-inset-bottom))!important;
  }
  #app.srHomeFullArena>#tabs>.tab{
    height:54px!important;
    min-height:54px!important;
    max-height:54px!important;
  }
  #app.srHomeFullArena>#tabs>.tab>.ico{
    top:2px!important;
    width:31px!important;height:31px!important;
    min-width:31px!important;min-height:31px!important;
    max-width:31px!important;max-height:31px!important;
  }
  #app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon{
    width:31px!important;height:31px!important;
    min-width:31px!important;min-height:31px!important;
    max-width:31px!important;max-height:31px!important;
  }
  #app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon{top:2px!important}
  #app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon){
    top:36px!important;
    height:14px!important;
    line-height:14px!important;
    font-size:9.5px!important;
  }
}
`;
  document.head.appendChild(style);

  function imp(el,p,v){if(el)el.style.setProperty(p,v,'important');}

  function compact(){
    try{return matchMedia('(max-width:370px),(max-height:720px)').matches;}catch(_){return false;}
  }

  function normalizeTab(tab,isCompact){
    var tabH=isCompact?'54px':'58px';
    var iconS=isCompact?'31px':'34px';
    var iconTop=isCompact?'2px':'3px';
    var labelTop=isCompact?'36px':'40px';
    var labelSize=isCompact?'9.5px':'10px';

    imp(tab,'position','relative');imp(tab,'display','block');
    imp(tab,'width','100%');imp(tab,'min-width','0');
    imp(tab,'height',tabH);imp(tab,'min-height',tabH);imp(tab,'max-height',tabH);
    imp(tab,'padding','0');imp(tab,'margin','0');imp(tab,'overflow','hidden');imp(tab,'transform','none');

    var ico=tab.querySelector(':scope > .ico');
    if(ico){
      imp(ico,'position','absolute');imp(ico,'left','50%');imp(ico,'top',iconTop);
      ['width','height','min-width','min-height','max-width','max-height'].forEach(function(p){imp(ico,p,iconS);});
      imp(ico,'margin','0');imp(ico,'padding','0');imp(ico,'transform','translateX(-50%)');
      imp(ico,'display','flex');imp(ico,'align-items','center');imp(ico,'justify-content','center');imp(ico,'line-height','0');
    }

    var icons=tab.querySelectorAll('.fantasyNavIcon');
    Array.prototype.forEach.call(icons,function(icon){
      ['width','height','min-width','min-height','max-width','max-height'].forEach(function(p){imp(icon,p,iconS);});
      imp(icon,'margin','0');imp(icon,'padding','0');imp(icon,'display','block');imp(icon,'line-height','0');
      if(icon.parentElement===tab){
        imp(icon,'position','absolute');imp(icon,'left','50%');imp(icon,'top',iconTop);imp(icon,'transform','translateX(-50%)');
      }else{
        imp(icon,'position','static');imp(icon,'transform','none');
      }
    });

    var label=tab.querySelector(':scope > span:not(.ico):not(.fantasyNavIcon)');
    if(label){
      imp(label,'position','absolute');imp(label,'left','0');imp(label,'right','0');imp(label,'top',labelTop);
      imp(label,'display','block');imp(label,'width','100%');imp(label,'height','14px');
      imp(label,'margin','0');imp(label,'padding','0');imp(label,'transform','none');
      imp(label,'line-height','14px');imp(label,'font-size',labelSize);imp(label,'letter-spacing','.2px');
      imp(label,'text-align','center');imp(label,'white-space','nowrap');imp(label,'overflow','hidden');imp(label,'text-overflow','clip');
    }
  }

  function apply(){
    var app=document.getElementById('app');
    var tabs=document.getElementById('tabs');
    if(!app||!tabs||!app.classList.contains('srHomeFullArena'))return;

    var isCompact=compact();
    var navH=isCompact?'54px':'58px';
    imp(tabs,'display','grid');imp(tabs,'grid-template-columns','repeat(4,minmax(0,1fr))');imp(tabs,'grid-template-rows',navH);
    imp(tabs,'width','100%');imp(tabs,'height','calc('+navH+' + env(safe-area-inset-bottom))');
    imp(tabs,'min-height','calc('+navH+' + env(safe-area-inset-bottom))');imp(tabs,'max-height','calc('+navH+' + env(safe-area-inset-bottom))');
    imp(tabs,'flex','0 0 calc('+navH+' + env(safe-area-inset-bottom))');
    imp(tabs,'padding','0 4px env(safe-area-inset-bottom)');imp(tabs,'margin','0');imp(tabs,'overflow','hidden');

    Array.prototype.forEach.call(tabs.querySelectorAll(':scope > .tab'),function(tab){normalizeTab(tab,isCompact);});
  }

  var scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;apply();});
  }

  var tabs=document.getElementById('tabs');
  if(tabs)new MutationObserver(schedule).observe(tabs,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','aria-current']});
  var app=document.getElementById('app');
  if(app)new MutationObserver(schedule).observe(app,{attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});

  apply();
})();
