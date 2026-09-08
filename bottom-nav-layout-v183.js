/* SHADOWREACH · Bottom navigation layout V183
   Locks every bottom-nav icon and label to the same two vertical anchors.
   This prevents the long Développement label / nested fantasy icon markup from
   changing the row height on iOS Safari. UI only. */
(function(){
  'use strict';
  if(window.__srBottomNavLayoutV183)return;
  window.__srBottomNavLayoutV183=true;

  function imp(el,p,v){if(el)el.style.setProperty(p,v,'important');}
  function apply(){
    var app=document.getElementById('app');
    var tabs=document.getElementById('tabs');
    if(!app||!tabs||!app.classList.contains('srHomeFullArena'))return;

    imp(tabs,'display','grid');
    imp(tabs,'grid-template-columns','repeat(4,minmax(0,1fr))');
    imp(tabs,'grid-template-rows','58px');
    imp(tabs,'align-items','start');
    imp(tabs,'flex','0 0 calc(58px + env(safe-area-inset-bottom))');
    imp(tabs,'height','calc(58px + env(safe-area-inset-bottom))');
    imp(tabs,'min-height','calc(58px + env(safe-area-inset-bottom))');
    imp(tabs,'max-height','calc(58px + env(safe-area-inset-bottom))');
    imp(tabs,'padding','0 4px env(safe-area-inset-bottom)');
    imp(tabs,'overflow','hidden');

    Array.prototype.forEach.call(tabs.querySelectorAll(':scope > .tab'),function(tab){
      imp(tab,'position','relative');
      imp(tab,'display','block');
      imp(tab,'height','58px');
      imp(tab,'min-height','58px');
      imp(tab,'max-height','58px');
      imp(tab,'padding','0');
      imp(tab,'margin','0');
      imp(tab,'overflow','visible');
      imp(tab,'transform','none');

      var ico=tab.querySelector(':scope > .ico');
      if(ico){
        imp(ico,'position','absolute');imp(ico,'left','50%');imp(ico,'top','3px');
        imp(ico,'width','34px');imp(ico,'height','34px');
        imp(ico,'min-width','34px');imp(ico,'min-height','34px');
        imp(ico,'margin','0');imp(ico,'padding','0');
        imp(ico,'transform','translateX(-50%)');
        imp(ico,'display','flex');imp(ico,'align-items','center');imp(ico,'justify-content','center');
      }
      var fantasy=tab.querySelector('.fantasyNavIcon');
      if(fantasy){
        imp(fantasy,'width','34px');imp(fantasy,'height','34px');
        imp(fantasy,'min-width','34px');imp(fantasy,'min-height','34px');
        imp(fantasy,'margin','0');imp(fantasy,'transform','none');
      }

      /* renderTabs() creates the visible label as a direct span sibling of .ico. */
      var label=tab.querySelector(':scope > span:not(.ico):not(.fantasyNavIcon)');
      if(label){
        imp(label,'position','absolute');imp(label,'left','0');imp(label,'right','0');imp(label,'top','40px');
        imp(label,'display','block');imp(label,'width','100%');imp(label,'height','14px');
        imp(label,'margin','0');imp(label,'padding','0');imp(label,'transform','none');
        imp(label,'font-size',tab.getAttribute('data-arg')==='developpement'?'9px':'10px');
        imp(label,'line-height','14px');imp(label,'text-align','center');
        imp(label,'white-space','nowrap');imp(label,'overflow','visible');
      }
    });
  }

  var tabs=document.getElementById('tabs');
  if(tabs)new MutationObserver(function(){requestAnimationFrame(apply);}).observe(tabs,{childList:true,subtree:true});
  var app=document.getElementById('app');
  if(app)new MutationObserver(function(){requestAnimationFrame(apply);}).observe(app,{attributes:true,attributeFilter:['class']});
  requestAnimationFrame(apply);
  setTimeout(apply,250);
  setTimeout(apply,1000);
})();