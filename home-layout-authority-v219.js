/* SHADOWREACH · Home layout authority V219 / V262 · Lean consolidation
   Sole Home geometry, render lifecycle and UI compatibility authority.
   V119 compatibility decoration is absorbed here so Home has one runtime owner.
   UI-only: no combat values, economy, progression or save data are changed. */
(function(){
'use strict';
if(window.__srHomeLayoutAuthorityV219)return;
window.__srHomeLayoutAuthorityV219=true;
window.__srHomeFramePhase2B=true;
window.__srHomeLayoutPhase2B=true;
window.__srHomeLayoutCompatV119=true;
var style=document.createElement('style');
style.id='srHomeLayoutAuthorityV219';
style.textContent=`
#app.srHomeFullArena{position:relative!important;overflow:hidden!important;--srHudH:112px;--srSkillH:58px;--srForgeH:250px}
#app.srHomeFullArena>#hud{position:absolute!important;left:0!important;right:0!important;top:0!important;z-index:70!important;height:var(--srHudH)!important;min-height:var(--srHudH)!important;max-height:var(--srHudH)!important;overflow:visible!important;flex:none!important;padding:4px 9px 3px!important;background:linear-gradient(180deg,#07101df2 0%,#0a1422d4 76%,#08101b70 92%,transparent 100%)!important;border:0!important;box-shadow:none!important;pointer-events:auto!important;align-items:flex-start!important}
#app.srHomeFullArena>#hud::after{display:none!important}
#app.srHomeFullArena>#hud>.pbox{align-self:flex-start!important;margin-top:0!important;transform:none!important}
#app.srHomeFullArena>#hud>.col{align-items:flex-end!important;align-self:flex-start!important;margin-top:0!important}
#app.srHomeFullArena>#hud>.col>.row{justify-content:flex-end!important}
#app.srHomeFullArena>#hud .curr[data-arg="minerai"]{display:none!important}
#app.srHomeFullArena>#screen.fixed{flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;padding:0!important;margin:0!important}
#app.srHomeFullArena>#screen.fixed>.recommendedWrap{display:none!important}
#app.srHomeFullArena #screen.fixed>.campaignWorld{position:relative!important;flex:1 1 0!important;min-height:0!important;height:auto!important;margin:0!important;overflow:hidden!important;background:#070b13!important}
#app.srHomeFullArena #screen.fixed #arenaSlot{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;display:block!important}
#app.srHomeFullArena #screen.fixed #arena{height:100%!important;min-height:100%!important;border-top:0!important}
#app.srHomeFullArena #arenaBg{background-position:center center!important}
#app.srHomeFullArena #aLayer .unit{scale:.78!important;transform-origin:50% 100%!important}
#app.srHomeFullArena .worldDev{display:none!important}
#app.srHomeFullArena .worldNavLayer{position:absolute!important;inset:0!important;z-index:32!important;pointer-events:none!important}
#app.srHomeFullArena .worldAction,#app.srHomeFullArena .worldMenu{pointer-events:auto!important}
#app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDefis{left:10px!important;right:auto!important;width:82px!important;height:34px!important;min-width:0!important;padding:2px 5px!important;border-radius:9px!important;box-shadow:0 2px 0 #0A1020,0 3px 7px #0007!important}
#app.srHomeFullArena .worldRebirth{top:calc(var(--srHudH) + 58px)!important;bottom:auto!important}
#app.srHomeFullArena .worldDefis{display:flex!important;top:calc(var(--srHudH) + 108px)!important;bottom:auto!important}
#app.srHomeFullArena .worldRebirth img,#app.srHomeFullArena .worldDefis img{width:18px!important;height:18px!important;object-fit:contain!important}
#app.srHomeFullArena .worldRebirth span,#app.srHomeFullArena .worldDefis span{font-size:8px!important;line-height:1!important;white-space:nowrap!important}
#app.srHomeFullArena .worldRebirth .worldDot,#app.srHomeFullArena .worldDefis .worldDot{width:7px!important;height:7px!important;top:1px!important;right:1px!important}
#app.srHomeFullArena .worldMenu{left:8px!important;top:auto!important;bottom:7px!important;right:auto!important}
#app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 2px)!important;bottom:auto!important;z-index:22!important;gap:3px!important}
#app.srHomeFullArena #arena .floorTxt{font-size:15px!important}
#app.srHomeFullArena #arena .fTrack{transform:scale(.90)!important;transform-origin:center!important}
#app.srHomeFullArena #arena #aSub{gap:5px!important}
#app.srHomeFullArena #screen.fixed>#skillbar{flex:0 0 var(--srSkillH)!important;height:var(--srSkillH)!important;min-height:var(--srSkillH)!important;max-height:var(--srSkillH)!important;margin:0!important;overflow:hidden!important}
#app.srHomeFullArena #screen.fixed>#fxbar{display:none!important}
#app.srHomeFullArena #screen.fixed>.pad.mt4{box-sizing:border-box!important;flex:0 0 var(--srForgeH)!important;height:var(--srForgeH)!important;min-height:var(--srForgeH)!important;max-height:var(--srForgeH)!important;margin:0!important;padding:2px 8px 4px!important;overflow:hidden!important}
#app.srHomeFullArena .homeForge{box-sizing:border-box!important;height:100%!important;max-height:100%!important;overflow:visible!important;padding:5px 7px!important;margin:0!important;display:flex!important;flex-direction:column!important;min-height:0!important}
#app.srHomeFullArena .homeForge .fgFilter{display:flex!important;align-items:center!important}
#app.srHomeFullArena .homeForge .homeCompactEnd{display:block!important}
#app.srHomeFullArena .homeForge .iBtn{box-sizing:border-box!important;width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;max-width:28px!important;max-height:28px!important;flex:0 0 28px!important;padding:0!important;margin:0!important;border-radius:50%!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;line-height:1!important;aspect-ratio:1/1!important;font-family:var(--fd)!important;font-size:13px!important;font-weight:900!important;color:var(--goldLit)!important;background:linear-gradient(180deg,#18253d,#0d1627)!important;border:1px solid var(--goldDim)!important;box-shadow:inset 0 1px 0 #ffffff20,0 1px 3px #0008!important}
#app.srHomeFullArena #rewardFeed{right:8px!important;top:96px!important;width:min(176px,46%)!important;gap:3px!important;z-index:66!important;pointer-events:none!important}
#app.srHomeFullArena #rewardFeed .rewardPop{padding:4px 7px!important;min-height:0!important;border-radius:8px!important;background:linear-gradient(180deg,#17263ee8,#0b1425df)!important;box-shadow:0 2px 6px #0006!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;pointer-events:auto!important}
#app.srHomeFullArena #rewardFeed .rewardPop .rpT{font-size:10px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#app.srHomeFullArena #rewardFeed .rewardPop .rpS{font-size:8.5px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#app.srHomeFullArena #rewardFeed .rewardPop.clickable::after{display:none!important}
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
#app.srHomeFullArena #tutorialCard{bottom:calc(var(--srForgeH) + var(--srSkillH) + 68px + env(safe-area-inset-bottom))!important}
#app.srHomeFullArena:has(#tutorialCard) #toast{bottom:calc(var(--srForgeH) + var(--srSkillH) + 160px + env(safe-area-inset-bottom))!important}
@media(max-width:370px){#app.srHomeFullArena{--srHudH:106px;--srForgeH:240px}#app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDefis{width:76px!important;height:32px!important;left:8px!important}#app.srHomeFullArena .worldRebirth{top:calc(var(--srHudH) + 54px)!important}#app.srHomeFullArena .worldDefis{top:calc(var(--srHudH) + 100px)!important}#app.srHomeFullArena .worldRebirth span,#app.srHomeFullArena .worldDefis span{font-size:7.5px!important}#app.srHomeFullArena #aLayer .unit{scale:.75!important}#app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 1px)!important}#app.srHomeFullArena #arena .fTrack{transform:scale(.84)!important}#screen .settingsStatGridCompat{grid-template-columns:1fr!important}#app.srHomeFullArena #rewardFeed{width:min(164px,48%)!important;right:6px!important}}
@media(max-height:720px){#app.srHomeFullArena{--srHudH:104px;--srSkillH:54px;--srForgeH:225px}#app.srHomeFullArena>#hud{top:0!important;padding-top:3px!important}#app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDefis{height:31px!important}#app.srHomeFullArena .worldRebirth{top:calc(var(--srHudH) + 50px)!important}#app.srHomeFullArena .worldDefis{top:calc(var(--srHudH) + 94px)!important}#app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 1px)!important}}
`;
document.head.appendChild(style);
var app=document.getElementById('app'),screen=document.getElementById('screen');
function important(el,prop,value){if(el)el.style.setProperty(prop,value,'important');}
function decorate(){
  if(!screen)return;
  var info=screen.querySelector('.homeForge .iBtn');
  if(info){
    ['width','height','min-width','min-height','max-width','max-height'].forEach(function(p){important(info,p,'28px');});
    important(info,'flex','0 0 28px');important(info,'padding','0');important(info,'margin','0');important(info,'border-radius','50%');important(info,'display','inline-flex');important(info,'align-items','center');important(info,'justify-content','center');important(info,'line-height','1');
    info.setAttribute('role','button');info.setAttribute('tabindex','0');info.setAttribute('aria-label','Informations sur les raretés');
  }
  var title=screen.querySelector('#topbar h2.title');var label=title&&String(title.textContent||'').trim();
  if(label==='Équipement'){var seg=screen.querySelector('.seg');if(seg)seg.classList.add('equipFiltersCompat');}
  if(label==='Réglages'){
    var card=screen.querySelector('.pad.mt6 > .card.frame');
    if(card){var rows=card.querySelectorAll('.row');for(var i=0;i<rows.length;i++){var row=rows[i];if(row.style&&row.style.flexWrap==='wrap'){row.classList.add('settingsStatGridCompat');for(var j=0;j<row.children.length;j++)row.children[j].classList.add('settingsStatCellCompat');break;}}}
  }
}
function sync(){
  if(!app||!screen)return;
  var home=screen.classList.contains('fixed')&&!!screen.querySelector('.campaignWorld');
  app.classList.toggle('srHomeFullArena',home);
  decorate();
}
var queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sync();});}
window.__srApplyHomeCompatV119=decorate;
window.__srSyncHomeLayoutV219=sync;window.__srSyncHomeFramePhase2B=sync;
window.addEventListener('sr:bottomnavrendered',schedule);
window.addEventListener('resize',schedule,{passive:true});window.addEventListener('orientationchange',schedule,{passive:true});schedule();
})();