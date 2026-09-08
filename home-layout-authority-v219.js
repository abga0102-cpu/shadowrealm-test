/* SHADOWREACH · Home layout authority V219
   Restores the previously validated Home geometry that was accidentally coupled
   to social-forge-layout-v1.js. Social/P2P remains disabled unless explicitly enabled.
   UI-only: no combat values, economy, progression or save data are changed. */
(function(){
'use strict';
if(window.__srHomeLayoutAuthorityV219)return;
window.__srHomeLayoutAuthorityV219=true;

var style=document.createElement('style');
style.id='srHomeLayoutAuthorityV219';
style.textContent=`
#app.srHomeFullArena{position:relative!important;overflow:hidden!important;--srHudH:112px;--srSkillH:58px;--srForgeH:184px}
#app.srHomeFullArena>#hud{position:absolute!important;left:0!important;right:0!important;top:-8px!important;z-index:70!important;height:var(--srHudH)!important;min-height:var(--srHudH)!important;max-height:var(--srHudH)!important;overflow:visible!important;flex:none!important;padding:4px 9px 3px!important;background:linear-gradient(180deg,#07101df2 0%,#0a1422d4 76%,#08101b70 92%,transparent 100%)!important;border:0!important;box-shadow:none!important;pointer-events:auto!important}
#app.srHomeFullArena>#hud::after{display:none!important}
#app.srHomeFullArena>#hud .curr[data-arg="minerai"]{display:none!important}

#app.srHomeFullArena>#screen.fixed{flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;padding:0!important;margin:0!important}
#app.srHomeFullArena>#screen.fixed>.recommendedWrap{display:none!important}
#app.srHomeFullArena #screen.fixed>.campaignWorld{position:relative!important;flex:1 1 0!important;min-height:0!important;height:auto!important;margin:0!important;overflow:hidden!important;background:#070b13!important}
#app.srHomeFullArena #screen.fixed #arenaSlot{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;display:block!important}
#app.srHomeFullArena #screen.fixed #arena{height:100%!important;min-height:100%!important;border-top:0!important}
#app.srHomeFullArena #arenaBg{background-position:center center!important}

/* Validated combat scale from the previous Home layout. */
#app.srHomeFullArena #aLayer .unit{scale:.78!important;transform-origin:50% 100%!important}

/* Development is already available in the bottom navigation. */
#app.srHomeFullArena .worldDev{display:none!important}

/* Rebirth + Defis stay on the left rail, with Defis directly below Rebirth. */
#app.srHomeFullArena .worldNavLayer{position:absolute!important;inset:0!important;z-index:32!important;pointer-events:none!important}
#app.srHomeFullArena .worldAction,#app.srHomeFullArena .worldMenu{pointer-events:auto!important}
#app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDefis{left:10px!important;right:auto!important;width:82px!important;height:34px!important;min-width:0!important;padding:2px 5px!important;border-radius:9px!important;box-shadow:0 2px 0 #0A1020,0 3px 7px #0007!important}
#app.srHomeFullArena .worldRebirth{top:calc(var(--srHudH) + 58px)!important;bottom:auto!important}
#app.srHomeFullArena .worldDefis{display:flex!important;top:calc(var(--srHudH) + 108px)!important;bottom:auto!important}
#app.srHomeFullArena .worldRebirth img,#app.srHomeFullArena .worldDefis img{width:18px!important;height:18px!important;object-fit:contain!important}
#app.srHomeFullArena .worldRebirth span,#app.srHomeFullArena .worldDefis span{font-size:8px!important;line-height:1!important;white-space:nowrap!important}
#app.srHomeFullArena .worldRebirth .worldDot,#app.srHomeFullArena .worldDefis .worldDot{width:7px!important;height:7px!important;top:1px!important;right:1px!important}
#app.srHomeFullArena .worldMenu{left:8px!important;top:auto!important;bottom:7px!important;right:auto!important}

/* Keep floor label/track fully visible below the HUD. */
#app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 2px)!important;bottom:auto!important;z-index:22!important;gap:3px!important}
#app.srHomeFullArena #arena .floorTxt{font-size:15px!important}
#app.srHomeFullArena #arena .fTrack{transform:scale(.90)!important;transform-origin:center!important}
#app.srHomeFullArena #arena #aSub{gap:5px!important}

#app.srHomeFullArena #screen.fixed>#skillbar{flex:0 0 var(--srSkillH)!important;height:var(--srSkillH)!important;min-height:var(--srSkillH)!important;max-height:var(--srSkillH)!important;margin:0!important;overflow:hidden!important}
#app.srHomeFullArena #screen.fixed>#fxbar{display:none!important}
#app.srHomeFullArena #screen.fixed>.pad.mt4{flex:0 0 var(--srForgeH)!important;height:var(--srForgeH)!important;min-height:var(--srForgeH)!important;max-height:var(--srForgeH)!important;margin:0!important;padding:2px 8px 4px!important;overflow:hidden!important}
#app.srHomeFullArena .homeForge{height:100%!important;max-height:100%!important;overflow:hidden!important;padding:5px 7px!important;margin:0!important;display:flex!important;flex-direction:column!important}
#app.srHomeFullArena .homeForge .fgFilter{display:flex!important;min-height:26px!important;margin-top:4px!important;padding:4px 7px!important;align-items:center!important}
#app.srHomeFullArena .homeForge .compactAuto{display:flex!important;min-height:36px!important;margin-top:4px!important;padding:5px 7px!important}
#app.srHomeFullArena .homeForge .forgeAnim{display:block!important;margin-top:4px!important;padding:6px 8px!important;min-height:44px!important;max-height:64px!important;overflow:hidden!important}
#app.srHomeFullArena .homeForge .forgeAnim.compactAuto{display:flex!important;min-height:36px!important;max-height:42px!important}
#app.srHomeFullArena .homeForge .forgeAutoText .tiny{display:none!important}
#app.srHomeFullArena .homeForge .forgeAutoIcon{width:24px!important;height:24px!important;flex-basis:24px!important}
#app.srHomeFullArena .homeForge .fgRow.mt6,#app.srHomeFullArena .homeForge .mt6{margin-top:4px!important}
#app.srHomeFullArena .homeForge .homeCompactEnd{display:block!important}

@media(max-width:370px){
 #app.srHomeFullArena{--srHudH:106px;--srForgeH:174px}
 #app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDefis{width:76px!important;height:32px!important;left:8px!important}
 #app.srHomeFullArena .worldRebirth{top:calc(var(--srHudH) + 54px)!important}
 #app.srHomeFullArena .worldDefis{top:calc(var(--srHudH) + 100px)!important}
 #app.srHomeFullArena .worldRebirth span,#app.srHomeFullArena .worldDefis span{font-size:7.5px!important}
 #app.srHomeFullArena #aLayer .unit{scale:.75!important}
 #app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 1px)!important}
 #app.srHomeFullArena #arena .fTrack{transform:scale(.84)!important}
}
@media(max-height:720px){
 #app.srHomeFullArena{--srHudH:104px;--srSkillH:54px;--srForgeH:158px}
 #app.srHomeFullArena>#hud{top:-10px!important;padding-top:3px!important}
 #app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDefis{height:31px!important}
 #app.srHomeFullArena .worldRebirth{top:calc(var(--srHudH) + 50px)!important}
 #app.srHomeFullArena .worldDefis{top:calc(var(--srHudH) + 94px)!important}
 #app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 1px)!important}
 #app.srHomeFullArena .homeForge .fgFilter{min-height:23px!important}
 #app.srHomeFullArena .homeForge .forgeAnim{min-height:38px!important;max-height:50px!important}
}
`;
document.head.appendChild(style);

var app=document.getElementById('app');
var screen=document.getElementById('screen');
function sync(){
 if(!app||!screen)return;
 var home=screen.classList.contains('fixed')&&!!screen.querySelector('.campaignWorld');
 app.classList.toggle('srHomeFullArena',home);
}
var queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sync();});}
window.__srSyncHomeLayoutV219=sync;

/* Follow the existing render lifecycle, without a global MutationObserver. */
if(typeof window.renderTabs==='function'){
 var baseRenderTabs=window.renderTabs;
 window.renderTabs=function(){var out=baseRenderTabs.apply(this,arguments);schedule();return out;};
 try{renderTabs=window.renderTabs;}catch(_){}
}
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',schedule,{passive:true});
schedule();
})();