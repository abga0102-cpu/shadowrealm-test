/* SHADOWREACH HOME FRAME LAYOUT V13
   The arena has a clear lower combat boundary. Everything below it belongs to
   chat/skills/Forge/navigation. Forge controls stay visible in a compact fixed
   frame, and world actions are spaced lower on the left rail. */
(()=>{
"use strict";
const STORE="shadowreach.social.v1.messages";
function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}}
function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
function installStyle(){
 let s=document.getElementById("srForgeLayoutStyle");if(!s){s=document.createElement("style");s.id="srForgeLayoutStyle";document.head.appendChild(s)}
 s.textContent=`
#app.srHomeFullArena{position:relative!important;overflow:hidden!important;--srHudH:118px;--srChatH:44px;--srSkillH:58px;--srForgeH:184px}
#app.srHomeFullArena>#hud{position:absolute!important;left:0!important;right:0!important;top:-8px!important;z-index:70!important;height:var(--srHudH)!important;min-height:var(--srHudH)!important;max-height:var(--srHudH)!important;overflow:visible!important;flex:none!important;padding:4px 9px 3px!important;background:linear-gradient(180deg,#07101df2 0%,#0a1422d4 76%,#08101b70 92%,transparent 100%)!important;border:0!important;box-shadow:none!important;pointer-events:auto!important}
#app.srHomeFullArena>#hud::after{display:none!important}
#app.srHomeFullArena>#screen.fixed{flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;padding:0!important;margin:0!important}
#app.srHomeFullArena>#screen.fixed>.recommendedWrap{display:none!important}

/* Combat owns only the remaining top area. The lower controls have fixed heights,
   so their state can change without moving the combat boundary after render. */
#app.srHomeFullArena #screen.fixed>.campaignWorld{position:relative!important;flex:1 1 0!important;min-height:0!important;height:auto!important;margin:0!important;overflow:hidden!important;background:#070b13!important}
#app.srHomeFullArena #screen.fixed #arenaSlot{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;display:block!important}
#app.srHomeFullArena #screen.fixed #arena{height:100%!important;min-height:100%!important;border-top:0!important}
#app.srHomeFullArena #arenaBg{background-position:center center!important}

/* Smaller fighters only at draw time; simulation coordinates/statistics stay intact. */
#app.srHomeFullArena #aLayer .unit{scale:.78!important;transform-origin:50% 100%!important}

/* Left rail: lower than before, with breathing room between Rebirth and Challenges. */
#app.srHomeFullArena .worldNavLayer{position:absolute!important;inset:0!important;z-index:32!important;pointer-events:none!important}
#app.srHomeFullArena .worldAction,#app.srHomeFullArena .worldMenu{pointer-events:auto!important}
#app.srHomeFullArena .worldDev{display:none!important}
#app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDefis{left:10px!important;right:auto!important;width:82px!important;height:34px!important;min-width:0!important;padding:2px 5px!important;border-radius:9px!important;box-shadow:0 2px 0 #0A1020,0 3px 7px #0007!important}
#app.srHomeFullArena .worldRebirth{top:calc(var(--srHudH) + 22px)!important;bottom:auto!important}
#app.srHomeFullArena .worldDefis{display:flex!important;top:calc(var(--srHudH) + 70px)!important;bottom:auto!important}
#app.srHomeFullArena .worldRebirth img,#app.srHomeFullArena .worldDefis img{width:18px!important;height:18px!important;object-fit:contain!important}
#app.srHomeFullArena .worldRebirth span,#app.srHomeFullArena .worldDefis span{font-size:8px!important;line-height:1!important;white-space:nowrap!important}
#app.srHomeFullArena .worldRebirth .worldDot,#app.srHomeFullArena .worldDefis .worldDot{width:7px!important;height:7px!important;top:1px!important;right:1px!important}
#app.srHomeFullArena .worldMenu{left:8px!important;top:auto!important;bottom:calc(var(--srChatH) + 7px)!important;right:auto!important}

/* Floor/wave info stays high and centred, clear of the left action rail. */
#app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 18px)!important;bottom:auto!important;z-index:22!important;gap:3px!important}
#app.srHomeFullArena #arena .floorTxt{font-size:15px!important}
#app.srHomeFullArena #arena .fTrack{transform:scale(.90)!important;transform-origin:center!important}
#app.srHomeFullArena #arena #aSub{gap:5px!important}

/* Home owns chat preview: root-level copies are never visible. */
#app.srHomeFullArena>#srChatBtn,#app.srHomeFullArena>#srChatPreview{display:none!important}

/* The fighters are lifted above the chat lane, making the bottom of combat a
   consistent visual boundary rather than letting feet drift into controls. */
#app.srHomeFullArena #arena #aLayer,#app.srHomeFullArena #arena #aDecor{inset:0!important;height:100%!important;bottom:0!important;transform:translateY(calc(-1 * var(--srChatH)))!important}
#arena #srChatBtn{display:block!important;position:absolute!important;left:9px!important;right:auto!important;top:auto!important;bottom:5px!important;width:36px!important;height:36px!important;border-radius:9px!important;z-index:86!important;box-shadow:0 2px 0 #060b13,0 3px 8px #0008!important}
#arena #srChatPreview{display:block!important;position:absolute!important;left:51px!important;right:9px!important;top:auto!important;bottom:5px!important;z-index:82!important;height:36px!important;min-height:36px!important;max-height:36px!important;padding:4px 8px!important;border-radius:9px!important;background:linear-gradient(90deg,#101a2cf5,#0c1423e8)!important;border:1px solid #34486e!important;pointer-events:none!important;overflow:hidden!important;box-shadow:none!important;font-size:10px!important;line-height:1.3!important}
#arena #srChatPreview .p{font-size:9.5px!important;line-height:1.42!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#d9e4f7!important}
#arena #srChatPreview .n{font-weight:900!important;color:#93c6ff!important;margin-right:4px!important}

/* ===== LOWER FUNCTION ZONE ===== */
#app.srHomeFullArena #screen.fixed>#skillbar{flex:0 0 var(--srSkillH)!important;height:var(--srSkillH)!important;min-height:var(--srSkillH)!important;max-height:var(--srSkillH)!important;margin:0!important;overflow:hidden!important}
#app.srHomeFullArena #screen.fixed>#fxbar{display:none!important}
#app.srHomeFullArena #screen.fixed>.pad.mt4{flex:0 0 var(--srForgeH)!important;height:var(--srForgeH)!important;min-height:var(--srForgeH)!important;max-height:var(--srForgeH)!important;margin:0!important;padding:2px 8px 4px!important;overflow:hidden!important}
#app.srHomeFullArena .homeForge{height:100%!important;max-height:100%!important;overflow:hidden!important;padding:5px 7px!important;margin:0!important;display:flex!important;flex-direction:column!important}

/* Restore the real Forge features that V12 was hiding. Keep them compact so they
   fit inside the reserved lower zone instead of increasing page height. */
#app.srHomeFullArena .homeForge .fgFilter{display:flex!important;min-height:26px!important;margin-top:4px!important;padding:4px 7px!important;align-items:center!important}
#app.srHomeFullArena .homeForge .compactAuto{display:flex!important;min-height:36px!important;margin-top:4px!important;padding:5px 7px!important}
#app.srHomeFullArena .homeForge .forgeAnim{display:block!important;margin-top:4px!important;padding:6px 8px!important;min-height:44px!important;max-height:64px!important;overflow:hidden!important}
#app.srHomeFullArena .homeForge .forgeAnim.compactAuto{display:flex!important;min-height:36px!important;max-height:42px!important}
#app.srHomeFullArena .homeForge .forgeAutoText .tiny{display:none!important}
#app.srHomeFullArena .homeForge .forgeAutoIcon{width:24px!important;height:24px!important;flex-basis:24px!important}
#app.srHomeFullArena .homeForge .fgRow.mt6,#app.srHomeFullArena .homeForge .mt6{margin-top:4px!important}
#app.srHomeFullArena .homeForge .homeCompactEnd{display:block!important}

#app.srHomeFullArena>#tabs{flex:0 0 66px!important;height:66px!important;min-height:66px!important;max-height:66px!important;overflow:hidden!important}
#app.srHomeFullArena>#tabs .tab{min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}

#srSocial{inset:auto 8px calc(65px + env(safe-area-inset-bottom)) 8px!important;height:min(48vh,430px)!important;max-height:430px!important;border-radius:16px!important;border:1px solid #3A4E74!important;background:#08101bf2!important;overflow:hidden!important;box-shadow:0 -8px 28px #000b,0 0 0 1px #ffffff08 inset!important}
#srSocial .head{padding:8px 10px!important;min-height:43px!important}#srSocial .srTabs{margin:5px 8px 3px!important}#srSocial .srMessages{padding:6px 8px 60px!important}#srSocial .srMsg{padding:5px 7px!important;margin-bottom:4px!important;border-radius:8px!important}#srSocial .srText{font-size:11.5px!important;line-height:1.25!important}#srSocial .srMeta{font-size:8px!important}#srSocial .srCompose{padding:6px!important}#srSocial .srCompose input{padding:8px 9px!important;font-size:12px!important}#srSocial .srCompose button{padding:8px 10px!important;font-size:11px!important}
#app:not(.srHomeFullArena)>#srChatBtn{left:10px!important;right:auto!important;bottom:calc(68px + env(safe-area-inset-bottom))!important;width:44px!important;height:44px!important;z-index:86!important}

@media(max-width:370px){
 #app.srHomeFullArena{--srHudH:112px;--srForgeH:174px}
 #app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDefis{width:76px!important;height:32px!important;left:8px!important}
 #app.srHomeFullArena .worldRebirth{top:calc(var(--srHudH) + 20px)!important}
 #app.srHomeFullArena .worldDefis{top:calc(var(--srHudH) + 65px)!important}
 #app.srHomeFullArena .worldRebirth span,#app.srHomeFullArena .worldDefis span{font-size:7.5px!important}
 #app.srHomeFullArena #aLayer .unit{scale:.75!important}
 #app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 16px)!important}
 #app.srHomeFullArena #arena .fTrack{transform:scale(.84)!important}
}
@media(max-height:720px){
 #app.srHomeFullArena{--srHudH:108px;--srChatH:40px;--srSkillH:54px;--srForgeH:158px}
 #app.srHomeFullArena>#hud{top:-10px!important;padding-top:3px!important}
 #app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDefis{height:31px!important}
 #app.srHomeFullArena .worldRebirth{top:calc(var(--srHudH) + 18px)!important}
 #app.srHomeFullArena .worldDefis{top:calc(var(--srHudH) + 61px)!important}
 #app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 15px)!important}
 #arena #srChatBtn{width:32px!important;height:32px!important}
 #arena #srChatPreview{left:47px!important;height:32px!important;min-height:32px!important;max-height:32px!important}
 #app.srHomeFullArena .homeForge .fgFilter{min-height:23px!important}
 #app.srHomeFullArena .homeForge .forgeAnim{min-height:38px!important;max-height:50px!important}
 #app.srHomeFullArena>#tabs{height:60px!important;min-height:60px!important;max-height:60px!important;flex-basis:60px!important}
}
`;
}
function makePreview(){const p=document.createElement("div");p.id="srChatPreview";return p}
function updatePreview(p){const root=document.getElementById("srSocial");p.style.display=root?"none":"block";if(root)return;const msgs=read().filter(m=>m&&m.channel!=="announcements").slice(-2);p.innerHTML=msgs.map(m=>'<div class="p"><span class="n">'+esc(m.author||"?")+'</span>'+esc(m.text||"")+'</div>').join("")}
let scheduled=false;
function sync(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{
  scheduled=false;
  const app=document.getElementById("app"),screen=document.getElementById("screen");if(!app||!screen)return;
  const home=screen.classList.contains("fixed")&&!!screen.querySelector(".campaignWorld");
  app.classList.toggle("srHomeFullArena",home);
  const btn=document.getElementById("srChatBtn");let p=document.getElementById("srChatPreview");
  if(home){
   const arena=screen.querySelector("#arena");
   if(!arena){if(p&&p.parentElement===app)p.remove();return;}
   if(btn&&btn.parentElement!==arena)arena.appendChild(btn);
   if(!p)p=makePreview();if(p.parentElement!==arena)arena.appendChild(p);updatePreview(p);
  }else{
   if(p)p.remove();
   if(btn&&btn.parentElement!==app)app.appendChild(btn);
  }
 });
}
installStyle();
const screen=document.getElementById("screen");if(screen)new MutationObserver(sync).observe(screen,{childList:true});
window.addEventListener("storage",sync);window.addEventListener("resize",sync);sync();
})();