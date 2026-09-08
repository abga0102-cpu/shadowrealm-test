/* SHADOWREACH · Home layout fix v119
   Mobile-safe compatibility layer.
   V182: restore full HUD visibility and compact bottom navigation while
   preserving Forge, reward, Equipment and Settings polish. UI only. */
(function(){
  'use strict';
  if(window.__srHomeLayoutFixV119)return;
  window.__srHomeLayoutFixV119=true;

  var s=document.createElement('style');
  s.id='srHomeLayoutFixV119';
  s.textContent=`
#app.srHomeFullArena{--srForgeH:216px!important}

/* Keep the home HUD fully inside the viewport. social-forge-layout-v1 pulls it
   upward by 8px; that clips the Hero plate on iPhone. */
#app.srHomeFullArena>#hud{
  top:0!important;
  align-items:flex-start!important;
  padding-top:6px!important;
}
#app.srHomeFullArena>#hud>.pbox{
  align-self:flex-start!important;
  margin-top:0!important;
  transform:none!important;
}
#app.srHomeFullArena>#hud>.col{
  align-items:flex-end!important;
  align-self:flex-start!important;
  margin-top:0!important;
}
#app.srHomeFullArena>#hud>.col>.row{justify-content:flex-end!important}

#app.srHomeFullArena #screen.fixed>.pad.mt4{
  flex:0 0 var(--srForgeH)!important;
  height:var(--srForgeH)!important;
  min-height:var(--srForgeH)!important;
  max-height:var(--srForgeH)!important;
  padding:2px 8px 6px!important;
  overflow:hidden!important;
}
#app.srHomeFullArena .homeForge{
  height:100%!important;
  max-height:100%!important;
  overflow:hidden!important;
  padding:5px 7px 7px!important;
}
#app.srHomeFullArena .homeForge>.fgRow:first-child{
  min-height:30px!important;
  align-items:center!important;
  gap:6px!important;
}
#app.srHomeFullArena .homeForge>.fgRow:first-child .gt{line-height:28px!important}
#app.srHomeFullArena .homeForge .compactAuto{
  flex:0 0 auto!important;
  min-height:34px!important;
  max-height:38px!important;
  margin-top:4px!important;
  padding:4px 7px!important;
}
#app.srHomeFullArena .homeForge .fgFilter{
  flex:0 0 auto!important;
  min-height:28px!important;
  margin-top:4px!important;
  padding:4px 7px!important;
  overflow:hidden!important;
}
#app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto){
  flex:0 0 auto!important;
  min-height:42px!important;
  max-height:54px!important;
}

/* Bottom navigation: one compact row. The old 72px + safe-area rule plus the
   third tab's inherited icon wrapper made Développement consume a second row. */
#app.srHomeFullArena>#tabs{
  box-sizing:border-box!important;
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  align-items:start!important;
  flex:0 0 calc(58px + env(safe-area-inset-bottom))!important;
  height:calc(58px + env(safe-area-inset-bottom))!important;
  min-height:calc(58px + env(safe-area-inset-bottom))!important;
  max-height:calc(58px + env(safe-area-inset-bottom))!important;
  padding:2px 4px env(safe-area-inset-bottom)!important;
  overflow:hidden!important;
}
#app.srHomeFullArena>#tabs .tab{
  box-sizing:border-box!important;
  width:100%!important;
  height:56px!important;
  min-height:56px!important;
  max-height:56px!important;
  min-width:0!important;
  padding:2px 1px 1px!important;
  margin:0!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:1px!important;
  overflow:visible!important;
  line-height:1!important;
  font-size:10px!important;
  color:#AAB8D0!important;
  white-space:nowrap!important;
  position:relative!important;
  transform:none!important;
}
#app.srHomeFullArena>#tabs .tab>.ico{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:32px!important;
  height:32px!important;
  min-width:32px!important;
  min-height:32px!important;
  flex:0 0 32px!important;
  margin:0 auto!important;
  padding:0!important;
  line-height:1!important;
  position:static!important;
  transform:none!important;
}
#app.srHomeFullArena>#tabs .fantasyNavIcon{
  width:32px!important;
  height:32px!important;
  min-width:32px!important;
  min-height:32px!important;
  margin:0!important;
  display:block!important;
  position:static!important;
  transform:none!important;
}
#app.srHomeFullArena>#tabs .tab>span:not(.fantasyNavIcon){
  display:block!important;
  position:static!important;
  width:auto!important;
  height:auto!important;
  margin:1px 0 0!important;
  padding:0!important;
  transform:none!important;
  line-height:11px!important;
  font-size:10px!important;
  white-space:nowrap!important;
  overflow:visible!important;
  text-overflow:clip!important;
}
#app.srHomeFullArena>#tabs .tab:nth-child(3),
#app.srHomeFullArena>#tabs .tab:nth-child(3)>span:not(.fantasyNavIcon){font-size:9px!important}
#app.srHomeFullArena>#tabs .fantasyNavV65:not(.on):not(.active):not([aria-current="page"]) .fantasyNavIcon{
  opacity:.74!important;
  filter:saturate(.78) brightness(.9) drop-shadow(0 2px 3px #0009)!important;
}

/* True circular Forge information control. */
#app.srHomeFullArena .homeForge .iBtn{
  box-sizing:border-box!important;
  width:28px!important;height:28px!important;
  min-width:28px!important;min-height:28px!important;
  max-width:28px!important;max-height:28px!important;
  flex:0 0 28px!important;
  padding:0!important;margin:0!important;
  border-radius:50%!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  line-height:1!important;aspect-ratio:1/1!important;
  font-family:var(--fd)!important;font-size:13px!important;font-weight:900!important;
  color:var(--goldLit)!important;background:linear-gradient(180deg,#18253d,#0d1627)!important;
  border:1px solid var(--goldDim)!important;
  box-shadow:inset 0 1px 0 #ffffff20,0 1px 3px #0008!important;
}

/* Compact reward/egg notices. */
#app.srHomeFullArena #rewardFeed{
  right:8px!important;top:96px!important;width:min(176px,46%)!important;gap:3px!important;
  z-index:66!important;pointer-events:none!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop{
  padding:4px 7px!important;min-height:0!important;border-radius:8px!important;
  background:linear-gradient(180deg,#17263ee8,#0b1425df)!important;
  box-shadow:0 2px 6px #0006!important;backdrop-filter:blur(3px)!important;
  -webkit-backdrop-filter:blur(3px)!important;pointer-events:auto!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop .rpT{
  font-size:10px!important;line-height:1.15!important;white-space:nowrap!important;
  overflow:hidden!important;text-overflow:ellipsis!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop .rpS{
  font-size:8.5px!important;line-height:1.15!important;white-space:nowrap!important;
  overflow:hidden!important;text-overflow:ellipsis!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop.clickable::after{display:none!important}

/* Equipment filter readability. */
#screen .equipFiltersCompat{
  display:flex!important;gap:5px!important;overflow-x:auto!important;overflow-y:hidden!important;
  border:0!important;box-shadow:none!important;border-radius:0!important;
  padding:2px 1px 5px!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch;
}
#screen .equipFiltersCompat::-webkit-scrollbar{display:none!important}
#screen .equipFiltersCompat>span{
  flex:0 0 auto!important;min-width:max-content!important;width:auto!important;
  padding:7px 10px!important;border:1px solid var(--border)!important;border-radius:10px!important;
  white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;
  background:linear-gradient(180deg,#2A3752,#161F32)!important;
}
#screen .equipFiltersCompat>span.on{
  background:linear-gradient(180deg,#5FB4F5,#1E72C8)!important;border-color:#5FB4F5!important;color:#fff!important;
}
#screen .equipFiltersCompat + .row{flex-wrap:wrap!important;align-items:stretch!important}
#screen .equipFiltersCompat + .row>.btn{flex:1 1 145px!important}

/* Settings statistics cards. */
#screen .settingsStatGridCompat{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
#screen .settingsStatGridCompat>.settingsStatCellCompat{width:auto!important;min-width:0!important}
#screen .settingsStatGridCompat .kv{
  min-height:50px!important;padding:7px 8px!important;border:1px solid var(--borderSoft)!important;
  border-radius:9px!important;background:#0E1728!important;
  display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:2px!important;
}
#screen .settingsStatGridCompat .kv>span,#screen .settingsStatGridCompat .kv>b{
  display:block!important;max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.25!important;
}
#screen .settingsStatGridCompat .kv>span{font-size:11px!important;color:#AAB8D0!important}
#screen .settingsStatGridCompat .kv>b{font-size:13px!important}

#toast{max-width:calc(100% - 24px)!important;left:12px!important;right:12px!important;margin:0 auto!important}
#app.srHomeFullArena #tutorialCard{bottom:calc(var(--srForgeH) + var(--srSkillH) + 68px + env(safe-area-inset-bottom))!important}
#app.srHomeFullArena:has(#tutorialCard) #toast{bottom:calc(var(--srForgeH) + var(--srSkillH) + 160px + env(safe-area-inset-bottom))!important}

@media(max-width:370px){
  #app.srHomeFullArena{--srForgeH:204px!important}
  #app.srHomeFullArena>#tabs{
    flex-basis:calc(56px + env(safe-area-inset-bottom))!important;
    height:calc(56px + env(safe-area-inset-bottom))!important;
    min-height:calc(56px + env(safe-area-inset-bottom))!important;
    max-height:calc(56px + env(safe-area-inset-bottom))!important;
  }
  #app.srHomeFullArena>#tabs .tab{height:54px!important;min-height:54px!important;max-height:54px!important}
  #app.srHomeFullArena>#tabs .tab>.ico,#app.srHomeFullArena>#tabs .fantasyNavIcon{width:30px!important;height:30px!important;min-width:30px!important;min-height:30px!important;flex-basis:30px!important}
  #screen .settingsStatGridCompat{grid-template-columns:1fr!important}
  #app.srHomeFullArena #rewardFeed{width:min(164px,48%)!important;right:6px!important}
}
@media(max-height:720px){
  #app.srHomeFullArena{--srForgeH:184px!important}
  #app.srHomeFullArena .homeForge .compactAuto{min-height:31px!important;max-height:34px!important}
  #app.srHomeFullArena .homeForge .fgFilter{min-height:24px!important}
  #app.srHomeFullArena>#tabs{
    flex-basis:calc(54px + env(safe-area-inset-bottom))!important;
    height:calc(54px + env(safe-area-inset-bottom))!important;
    min-height:calc(54px + env(safe-area-inset-bottom))!important;
    max-height:calc(54px + env(safe-area-inset-bottom))!important;
  }
  #app.srHomeFullArena>#tabs .tab{height:52px!important;min-height:52px!important;max-height:52px!important;padding-top:1px!important}
}
`;
  document.head.appendChild(s);

  function important(el,prop,value){if(el)el.style.setProperty(prop,value,'important');}

  function fixForgeInfo(screen){
    var info=screen&&screen.querySelector('.homeForge .iBtn');
    if(!info)return;
    ['width','height','min-width','min-height','max-width','max-height'].forEach(function(p){important(info,p,'28px');});
    important(info,'flex','0 0 28px'); important(info,'padding','0'); important(info,'margin','0');
    important(info,'border-radius','50%'); important(info,'display','inline-flex');
    important(info,'align-items','center'); important(info,'justify-content','center'); important(info,'line-height','1');
    info.setAttribute('role','button'); info.setAttribute('tabindex','0');
    info.setAttribute('aria-label','Informations sur les raretés');
  }

  function normalizeHomeFrame(){
    var app=document.getElementById('app');
    if(!app||!app.classList.contains('srHomeFullArena'))return;
    var hud=document.getElementById('hud');
    if(hud){important(hud,'top','0px');important(hud,'align-items','flex-start');}
    var hero=hud&&hud.querySelector(':scope > .pbox');
    var actions=hud&&hud.querySelector(':scope > .col');
    if(hero){important(hero,'margin-top','0');important(hero,'transform','none');important(hero,'align-self','flex-start');}
    if(actions){important(actions,'margin-top','0');important(actions,'align-self','flex-start');important(actions,'align-items','flex-end');}

    var tabs=document.getElementById('tabs');
    if(tabs){
      important(tabs,'display','grid');important(tabs,'grid-template-columns','repeat(4,minmax(0,1fr))');
      tabs.querySelectorAll('.tab').forEach(function(tab){
        important(tab,'display','flex');important(tab,'flex-direction','column');important(tab,'align-items','center');
        important(tab,'justify-content','center');important(tab,'transform','none');important(tab,'margin','0');
        var ico=tab.querySelector(':scope > .ico');
        if(ico){important(ico,'position','static');important(ico,'transform','none');important(ico,'margin','0 auto');}
        var label=tab.querySelector(':scope > span:not(.fantasyNavIcon)');
        if(label){important(label,'position','static');important(label,'transform','none');important(label,'margin','1px 0 0');important(label,'white-space','nowrap');}
      });
    }
  }

  function decorate(){
    var screen=document.getElementById('screen');if(!screen)return;
    fixForgeInfo(screen);normalizeHomeFrame();
    var title=screen.querySelector('#topbar h2.title');
    var label=title&&String(title.textContent||'').trim();
    if(label==='Équipement'){
      var seg=screen.querySelector('.seg');if(seg)seg.classList.add('equipFiltersCompat');
    }
    if(label==='Réglages'){
      var card=screen.querySelector('.pad.mt6 > .card.frame');
      if(card){
        var rows=card.querySelectorAll('.row');
        for(var i=0;i<rows.length;i++){
          var row=rows[i];
          if(row.style&&row.style.flexWrap==='wrap'){
            row.classList.add('settingsStatGridCompat');
            for(var j=0;j<row.children.length;j++)row.children[j].classList.add('settingsStatCellCompat');
            break;
          }
        }
      }
    }
  }

  var pending=false;
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;decorate();});}
  var app=document.getElementById('app');
  if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',schedule);
  schedule();
})();