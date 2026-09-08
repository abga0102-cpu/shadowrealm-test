/* SHADOWREACH · Home layout runtime V200
   Phase 2 ownership consolidation.
   Owns Home-frame classification plus HUD/Forge/reward/Equipment/Settings
   compatibility. Bottom navigation belongs solely to bottom-nav-runtime-v200.js. */
(function(){
  'use strict';
  if(window.__srHomeLayoutRuntimeV200)return;
  window.__srHomeLayoutRuntimeV200=true;

  var s=document.createElement('style');
  s.id='srHomeLayoutRuntimeV200';
  s.textContent=`
html #app.srHomeFullArena{--srForgeH:216px!important}
html #app.srHomeFullArena>#hud{top:0!important;align-items:flex-start!important;padding-top:6px!important}
html #app.srHomeFullArena>#hud>.pbox{align-self:flex-start!important;margin-top:0!important;transform:none!important}
html #app.srHomeFullArena>#hud>.col{align-items:flex-end!important;align-self:flex-start!important;margin-top:0!important}
html #app.srHomeFullArena>#hud>.col>.row{justify-content:flex-end!important}

html #app.srHomeFullArena #screen.fixed>.pad.mt4{
  flex:0 0 var(--srForgeH)!important;height:var(--srForgeH)!important;
  min-height:var(--srForgeH)!important;max-height:var(--srForgeH)!important;
  padding:2px 8px 6px!important;overflow:hidden!important;
}
html #app.srHomeFullArena .homeForge{height:100%!important;max-height:100%!important;overflow:hidden!important;padding:5px 7px 7px!important}
html #app.srHomeFullArena .homeForge>.fgRow:first-child{min-height:30px!important;align-items:center!important;gap:6px!important}
html #app.srHomeFullArena .homeForge>.fgRow:first-child .gt{line-height:28px!important}
html #app.srHomeFullArena .homeForge .compactAuto{flex:0 0 auto!important;min-height:34px!important;max-height:38px!important;margin-top:4px!important;padding:4px 7px!important}
html #app.srHomeFullArena .homeForge .fgFilter{flex:0 0 auto!important;min-height:28px!important;margin-top:4px!important;padding:4px 7px!important;overflow:hidden!important}
html #app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto){flex:0 0 auto!important;min-height:42px!important;max-height:54px!important}

html #app.srHomeFullArena .homeForge .iBtn{
  box-sizing:border-box!important;width:28px!important;height:28px!important;
  min-width:28px!important;min-height:28px!important;max-width:28px!important;max-height:28px!important;
  flex:0 0 28px!important;padding:0!important;margin:0!important;border-radius:50%!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  line-height:1!important;aspect-ratio:1/1!important;font-family:var(--fd)!important;
  font-size:13px!important;font-weight:900!important;color:var(--goldLit)!important;
  background:linear-gradient(180deg,#18253d,#0d1627)!important;border:1px solid var(--goldDim)!important;
  box-shadow:inset 0 1px 0 #ffffff20,0 1px 3px #0008!important;
}

html #app.srHomeFullArena #rewardFeed{right:8px!important;top:96px!important;width:min(176px,46%)!important;gap:3px!important;z-index:66!important;pointer-events:none!important}
html #app.srHomeFullArena #rewardFeed .rewardPop{padding:4px 7px!important;min-height:0!important;border-radius:8px!important;background:linear-gradient(180deg,#17263ee8,#0b1425df)!important;box-shadow:0 2px 6px #0006!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;pointer-events:auto!important}
html #app.srHomeFullArena #rewardFeed .rewardPop .rpT{font-size:10px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
html #app.srHomeFullArena #rewardFeed .rewardPop .rpS{font-size:8.5px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
html #app.srHomeFullArena #rewardFeed .rewardPop.clickable::after{display:none!important}

#screen .equipFiltersCompat{display:flex!important;gap:5px!important;overflow-x:auto!important;overflow-y:hidden!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:2px 1px 5px!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch}
#screen .equipFiltersCompat::-webkit-scrollbar{display:none!important}
#screen .equipFiltersCompat>span{flex:0 0 auto!important;min-width:max-content!important;width:auto!important;padding:7px 10px!important;border:1px solid var(--border)!important;border-radius:10px!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;background:linear-gradient(180deg,#2A3752,#161F32)!important}
#screen .equipFiltersCompat>span.on{background:linear-gradient(180deg,#5FB4F5,#1E72C8)!important;border-color:#5FB4F5!important;color:#fff!important}
#screen .equipFiltersCompat + .row{flex-wrap:wrap!important;align-items:stretch!important}
#screen .equipFiltersCompat + .row>.btn{flex:1 1 145px!important}

#screen .settingsStatGridCompat{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
#screen .settingsStatGridCompat>.settingsStatCellCompat{width:auto!important;min-width:0!important}
#screen .settingsStatGridCompat .kv{min-height:50px!important;padding:7px 8px!important;border:1px solid var(--borderSoft)!important;border-radius:9px!important;background:#0E1728!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:2px!important}
#screen .settingsStatGridCompat .kv>span,#screen .settingsStatGridCompat .kv>b{display:block!important;max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.25!important}
#screen .settingsStatGridCompat .kv>span{font-size:11px!important;color:#AAB8D0!important}
#screen .settingsStatGridCompat .kv>b{font-size:13px!important}

#toast{max-width:calc(100% - 24px)!important;left:12px!important;right:12px!important;margin:0 auto!important}
html #app.srHomeFullArena #tutorialCard{bottom:calc(var(--srForgeH) + var(--srSkillH) + 68px + env(safe-area-inset-bottom))!important}
html #app.srHomeFullArena:has(#tutorialCard) #toast{bottom:calc(var(--srForgeH) + var(--srSkillH) + 160px + env(safe-area-inset-bottom))!important}

@media(max-width:370px){
  html #app.srHomeFullArena{--srForgeH:204px!important}
  #screen .settingsStatGridCompat{grid-template-columns:1fr!important}
  html #app.srHomeFullArena #rewardFeed{width:min(164px,48%)!important;right:6px!important}
}
@media(max-height:720px){
  html #app.srHomeFullArena{--srForgeH:184px!important}
  html #app.srHomeFullArena .homeForge .compactAuto{min-height:31px!important;max-height:34px!important}
  html #app.srHomeFullArena .homeForge .fgFilter{min-height:24px!important}
}
`;
  document.head.appendChild(s);

  function important(el,prop,value){if(el)el.style.setProperty(prop,value,'important');}

  function syncHomeState(){
    var app=document.getElementById('app');
    var screen=document.getElementById('screen');
    if(!app||!screen)return false;
    var home=screen.classList.contains('fixed')&&!!screen.querySelector('.campaignWorld');
    app.classList.toggle('srHomeFullArena',home);
    return home;
  }

  function fixForgeInfo(screen){
    var info=screen&&screen.querySelector('.homeForge .iBtn');
    if(!info)return;
    ['width','height','min-width','min-height','max-width','max-height'].forEach(function(p){important(info,p,'28px');});
    important(info,'flex','0 0 28px');important(info,'padding','0');important(info,'margin','0');
    important(info,'border-radius','50%');important(info,'display','inline-flex');
    important(info,'align-items','center');important(info,'justify-content','center');important(info,'line-height','1');
    info.setAttribute('role','button');info.setAttribute('tabindex','0');
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
  }

  function decorate(){
    var screen=document.getElementById('screen');if(!screen)return;
    syncHomeState();
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
  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(function(){pending=false;decorate();});
  }
  var screen=document.getElementById('screen');
  if(screen)new MutationObserver(schedule).observe(screen,{childList:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',schedule);
  schedule();
})();
