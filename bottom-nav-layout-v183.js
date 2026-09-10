/* SHADOWREACH · Bottom navigation authority V209
   All four tabs use one DOM shape, one geometry owner, and one render lifecycle.
   V209 is also the sole BottomNav renderTabs lifecycle owner: it invokes the
   fantasy decorator exported by bottom-nav-v53.js, then applies canonical geometry. */
(function(){
  'use strict';
  if(window.__srBottomNavGeometryV209)return;
  window.__srBottomNavGeometryV209=true;

  var style=document.createElement('style');
  style.id='srBottomNavGeometryV209';
  style.textContent=`
#tabs{
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
#tabs>.tab{
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
#tabs>.tab>.ico{
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
  background:none!important;
  -webkit-mask:none!important;mask:none!important;
}
#tabs>.tab>.ico>.fantasyNavIcon{
  position:static!important;
  display:block!important;
  width:34px!important;height:34px!important;
  min-width:34px!important;min-height:34px!important;
  max-width:34px!important;max-height:34px!important;
  margin:0!important;padding:0!important;
  transform:none!important;
}
#tabs>.tab>span:not(.fantasyNavIcon):not(.dot){
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
#tabs>.tab>.dot{top:3px!important;right:22%!important}
#tabs>.tab .fantasyNavIcon{transition:filter .2s ease,opacity .2s ease!important}
#tabs>.tab.on>.ico>.fantasyNavIcon,
#tabs>.tab.active>.ico>.fantasyNavIcon,
#tabs>.tab[aria-current="page"]>.ico>.fantasyNavIcon{transform:none!important}
@media(max-width:370px),(max-height:720px){
  #tabs{
    grid-template-rows:54px!important;
    flex-basis:calc(54px + env(safe-area-inset-bottom))!important;
    height:calc(54px + env(safe-area-inset-bottom))!important;
    min-height:calc(54px + env(safe-area-inset-bottom))!important;
    max-height:calc(54px + env(safe-area-inset-bottom))!important;
  }
  #tabs>.tab{height:54px!important;min-height:54px!important;max-height:54px!important}
  #tabs>.tab>.ico{top:2px!important;width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;max-width:31px!important;max-height:31px!important}
  #tabs>.tab>.ico>.fantasyNavIcon{width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;max-width:31px!important;max-height:31px!important}
  #tabs>.tab>span:not(.fantasyNavIcon):not(.dot){top:36px!important;height:14px!important;line-height:14px!important;font-size:9.5px!important}
}
`;
  document.head.appendChild(style);

  function imp(el,p,v){if(el)el.style.setProperty(p,v,'important');}
  function compact(){try{return matchMedia('(max-width:370px),(max-height:720px)').matches;}catch(_){return false;}}

  function normalizeIconSlot(tab){
    if(!tab)return null;
    var slot=tab.querySelector(':scope > .ico');
    var direct=tab.querySelector(':scope > .fantasyNavIcon');
    var nested=slot&&slot.querySelector('.fantasyNavIcon');

    if(direct){
      if(!slot){
        slot=document.createElement('i');
        slot.className='ico';
        tab.insertBefore(slot,direct);
      }
      slot.removeAttribute('style');
      slot.classList.add('fantasyNavSlot');
      while(slot.firstChild)slot.removeChild(slot.firstChild);
      slot.appendChild(direct);
      nested=direct;
    }else if(nested){
      slot.removeAttribute('style');
      slot.classList.add('fantasyNavSlot');
    }
    return nested||null;
  }

  function apply(){
    var tabs=document.getElementById('tabs');
    if(!tabs)return;
    var small=compact();
    var row=small?'54px':'58px';
    var icon=small?'31px':'34px';
    var iconTop=small?'2px':'3px';
    var labelTop=small?'36px':'40px';
    var labelSize=small?'9.5px':'10px';

    imp(tabs,'box-sizing','border-box');
    imp(tabs,'display','grid');
    imp(tabs,'grid-template-columns','repeat(4,minmax(0,1fr))');
    imp(tabs,'grid-template-rows',row);
    imp(tabs,'align-items','start');
    imp(tabs,'height','calc('+row+' + env(safe-area-inset-bottom))');
    imp(tabs,'min-height','calc('+row+' + env(safe-area-inset-bottom))');
    imp(tabs,'max-height','calc('+row+' + env(safe-area-inset-bottom))');
    imp(tabs,'flex','0 0 calc('+row+' + env(safe-area-inset-bottom))');
    imp(tabs,'padding','0 4px env(safe-area-inset-bottom)');
    imp(tabs,'overflow','hidden');

    Array.prototype.forEach.call(tabs.querySelectorAll(':scope > .tab'),function(tab){
      normalizeIconSlot(tab);
      imp(tab,'box-sizing','border-box');imp(tab,'position','relative');imp(tab,'display','block');
      imp(tab,'width','100%');imp(tab,'height',row);imp(tab,'min-width','0');imp(tab,'min-height',row);imp(tab,'max-height',row);
      imp(tab,'padding','0');imp(tab,'margin','0');imp(tab,'overflow','hidden');imp(tab,'transform','none');

      var ico=tab.querySelector(':scope > .ico');
      if(ico){
        imp(ico,'position','absolute');imp(ico,'left','50%');imp(ico,'top',iconTop);
        imp(ico,'width',icon);imp(ico,'height',icon);imp(ico,'min-width',icon);imp(ico,'min-height',icon);imp(ico,'max-width',icon);imp(ico,'max-height',icon);
        imp(ico,'margin','0');imp(ico,'padding','0');imp(ico,'transform','translateX(-50%)');
        imp(ico,'display','flex');imp(ico,'align-items','center');imp(ico,'justify-content','center');imp(ico,'line-height','0');
        imp(ico,'background','none');ico.style.setProperty('-webkit-mask','none','important');imp(ico,'mask','none');
      }
      var fantasy=tab.querySelector(':scope > .ico > .fantasyNavIcon');
      if(fantasy){
        imp(fantasy,'position','static');imp(fantasy,'display','block');
        imp(fantasy,'width',icon);imp(fantasy,'height',icon);imp(fantasy,'min-width',icon);imp(fantasy,'min-height',icon);imp(fantasy,'max-width',icon);imp(fantasy,'max-height',icon);
        imp(fantasy,'margin','0');imp(fantasy,'padding','0');imp(fantasy,'transform','none');
      }
      var label=tab.querySelector(':scope > span:not(.fantasyNavIcon):not(.dot)');
      if(label){
        imp(label,'position','absolute');imp(label,'left','0');imp(label,'right','0');imp(label,'top',labelTop);
        imp(label,'display','block');imp(label,'width','100%');imp(label,'height','14px');imp(label,'margin','0');imp(label,'padding','0');
        imp(label,'transform','none');imp(label,'line-height','14px');imp(label,'font-size',labelSize);imp(label,'letter-spacing','.2px');
        imp(label,'text-align','center');imp(label,'white-space','nowrap');imp(label,'overflow','hidden');imp(label,'text-overflow','clip');
      }
      var dot=tab.querySelector(':scope > .dot');if(dot){imp(dot,'top',iconTop);imp(dot,'right','22%');}
    });
  }

  function decorateAndApply(){
    if(typeof window.__srDecorateBottomNavPhase2A==='function')window.__srDecorateBottomNavPhase2A();
    apply();
  }

  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;decorateAndApply();});}
  window.__srApplyBottomNavGeometryV209=apply;
  window.__srRefreshBottomNavV209=decorateAndApply;

  var nativeRenderTabs=typeof window.renderTabs==='function'?window.renderTabs:null;
  if(nativeRenderTabs){
    window.renderTabs=function(){
      var out=nativeRenderTabs.apply(this,arguments);
      decorateAndApply();
      return out;
    };
  }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  decorateAndApply();
})();