/* SHADOWREACH · Home compatibility V119 · Phase 4E
   Unique mobile/UI compatibility only. Home frame geometry and render lifecycle
   are owned by home-layout-authority-v219.js; BottomNav geometry is owned by V209. */
(function(){
  'use strict';
  if(window.__srHomeLayoutFixV119)return;
  window.__srHomeLayoutFixV119=true;
  window.__srHomeLayoutCompatV119=true;
  /* Phase 2B compatibility markers retained for older source checks.
     __srSyncHomeFramePhase2B and nativeRenderTabs ownership now live in V219. */
  if(typeof window.__srHomeLayoutPhase2B==='undefined')window.__srHomeLayoutPhase2B=true;

  var s=document.createElement('style');
  s.id='srHomeLayoutFixV119';
  s.textContent=`
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
  #screen .settingsStatGridCompat{grid-template-columns:1fr!important}
  #app.srHomeFullArena #rewardFeed{width:min(164px,48%)!important;right:6px!important}
}
`;
  document.head.appendChild(s);

  function important(el,prop,value){if(el)el.style.setProperty(prop,value,'important');}

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

  function decorate(){
    var screen=document.getElementById('screen');if(!screen)return;
    fixForgeInfo(screen);
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

  window.__srApplyHomeCompatV119=decorate;
  decorate();
})();
