/* SHADOWREACH HOME FRAME LAYOUT V7
   Full-height arena stays dimensionally stable during combat.
   World actions are aligned in one dedicated row below the HUD using the HUD's
   measured height. Chat is absolute inside the arena and never changes layout. */
(() => {
"use strict";
const STORE="shadowreach.social.v1.messages";
function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}}
function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
function installStyle(){
  let s=document.getElementById("srForgeLayoutStyle");
  if(!s){s=document.createElement("style");s.id="srForgeLayoutStyle";document.head.appendChild(s)}
  s.textContent=`
#app.srHomeFullArena{position:relative!important;overflow:hidden!important;--srHudH:132px;--srChatH:46px}
#app.srHomeFullArena>#hud{
  position:absolute!important;left:0!important;right:0!important;top:0!important;z-index:70!important;
  flex:none!important;padding:calc(8px + env(safe-area-inset-top)) 10px 7px!important;
  background:linear-gradient(180deg,#07101df2 0%,#0a1422d6 74%,#08101b72 91%,transparent 100%)!important;
  border-bottom:0!important;box-shadow:none!important;pointer-events:auto!important;
}
#app.srHomeFullArena>#hud::after{display:none!important}
#app.srHomeFullArena>#screen.fixed{
  flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;display:flex!important;
  flex-direction:column!important;padding:0!important;margin:0!important;
}
#app.srHomeFullArena>#screen.fixed>.recommendedWrap{display:none!important}

/* Arena is one immutable flex item: no chat node is ever inserted after it. */
#app.srHomeFullArena #screen.fixed>.campaignWorld{
  position:relative!important;flex:1 1 0!important;min-height:0!important;height:auto!important;
  margin:0!important;overflow:hidden!important;background:#070b13!important;
}
#app.srHomeFullArena #screen.fixed #arenaSlot{
  position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
  min-height:0!important;max-height:none!important;display:block!important;
}
#app.srHomeFullArena #screen.fixed #arena{height:100%!important;min-height:100%!important;border-top:0!important}
#app.srHomeFullArena #arenaBg{background-position:center center!important}

/* Clean action row below the real HUD height. */
#app.srHomeFullArena .worldNavLayer{position:absolute!important;inset:0!important;z-index:32!important;pointer-events:none!important}
#app.srHomeFullArena .worldAction,#app.srHomeFullArena .worldMenu{pointer-events:auto!important}
#app.srHomeFullArena .worldRebirth,
#app.srHomeFullArena .worldDev,
#app.srHomeFullArena .worldDefis{
  top:calc(var(--srHudH) + 4px)!important;bottom:auto!important;height:40px!important;
  min-width:0!important;padding:3px 7px!important;border-radius:10px!important;
}
#app.srHomeFullArena .worldRebirth{left:8px!important;right:auto!important;width:94px!important}
#app.srHomeFullArena .worldDev{left:50%!important;right:auto!important;width:116px!important;transform:translateX(-50%)!important}
#app.srHomeFullArena .worldDefis{right:8px!important;left:auto!important;width:86px!important}
#app.srHomeFullArena .worldAction img{width:23px!important;height:23px!important;object-fit:contain!important}
#app.srHomeFullArena .worldAction span{font-size:9px!important;white-space:nowrap!important}
#app.srHomeFullArena .worldMenu{left:8px!important;top:auto!important;bottom:calc(var(--srChatH) + 8px)!important;right:auto!important}

/* Stage information gets its own line below the action row. */
#app.srHomeFullArena #arena .floorTag{
  top:calc(var(--srHudH) + 50px)!important;bottom:auto!important;z-index:22!important;
}

/* Chat overlays only the bottom background strip. It never participates in flex
   sizing. The combat/decor layers are translated up by exactly the same reserve
   so feet, health bars and names stay above the chat without changing scale. */
#app.srHomeFullArena #arena #aLayer,
#app.srHomeFullArena #arena #aDecor{
  inset:0!important;height:100%!important;bottom:0!important;
  transform:translateY(calc(-1 * var(--srChatH)))!important;
}
#arena #srChatBtn{
  position:absolute!important;left:9px!important;right:auto!important;bottom:5px!important;
  width:38px!important;height:38px!important;border-radius:10px!important;z-index:86!important;
  box-shadow:0 2px 0 #060b13,0 3px 8px #0008!important;
}
#arena #srChatPreview{
  position:absolute!important;left:54px!important;right:9px!important;bottom:5px!important;z-index:82!important;
  height:38px!important;min-height:38px!important;max-height:38px!important;padding:4px 8px!important;
  border-radius:9px!important;background:linear-gradient(90deg,#101a2cf5,#0c1423e8)!important;
  border:1px solid #34486e!important;pointer-events:none!important;overflow:hidden!important;box-shadow:none!important;
}
#arena #srChatPreview .p{font-size:10px!important;line-height:1.45!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#d9e4f7!important}
#arena #srChatPreview .n{font-weight:900!important;color:#93c6ff!important;margin-right:4px!important}

/* Lower controls are stable flex siblings. */
#app.srHomeFullArena #screen.fixed>#skillbar{flex:0 0 auto!important;margin:0!important;min-height:0!important}
#app.srHomeFullArena #screen.fixed>#fxbar{display:none!important}
#app.srHomeFullArena #screen.fixed>.pad.mt4{flex:0 0 auto!important;margin:0!important;padding:2px 8px 4px!important}
#app.srHomeFullArena .homeForge{padding:5px 7px!important;margin:0!important}
#app.srHomeFullArena .homeForge .fgFilter,#app.srHomeFullArena .homeForge .compactAuto,#app.srHomeFullArena .homeCompactEnd{display:none!important}

#srSocial{inset:auto 8px calc(65px + env(safe-area-inset-bottom)) 8px!important;height:min(48vh,430px)!important;max-height:430px!important;border-radius:16px!important;border:1px solid #3A4E74!important;background:#08101bf2!important;overflow:hidden!important;box-shadow:0 -8px 28px #000b,0 0 0 1px #ffffff08 inset!important}
#srSocial .head{padding:8px 10px!important;min-height:43px!important}#srSocial .srTabs{margin:5px 8px 3px!important}#srSocial .srMessages{padding:6px 8px 60px!important}#srSocial .srMsg{padding:5px 7px!important;margin-bottom:4px!important;border-radius:8px!important}#srSocial .srText{font-size:11.5px!important;line-height:1.25!important}#srSocial .srMeta{font-size:8px!important}#srSocial .srCompose{padding:6px!important}#srSocial .srCompose input{padding:8px 9px!important;font-size:12px!important}#srSocial .srCompose button{padding:8px 10px!important;font-size:11px!important}

#app:not(.srHomeFullArena)>#srChatBtn{left:10px!important;right:auto!important;bottom:calc(68px + env(safe-area-inset-bottom))!important;width:44px!important;height:44px!important;z-index:86!important}
#app:not(.srHomeFullArena)>#srChatPreview{position:absolute;left:60px;right:12px;bottom:calc(69px + env(safe-area-inset-bottom));z-index:82;min-height:38px;max-height:52px;padding:6px 9px;border-radius:9px;background:#09101be6;border:1px solid #2E426980;pointer-events:none;overflow:hidden}

@media(max-width:370px){
  #app.srHomeFullArena .worldRebirth{width:82px!important}
  #app.srHomeFullArena .worldDev{width:104px!important}
  #app.srHomeFullArena .worldDefis{width:76px!important}
  #app.srHomeFullArena .worldAction span{font-size:8.4px!important}
}
@media(max-height:720px){
  #app.srHomeFullArena{--srChatH:42px}
  #app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDev,#app.srHomeFullArena .worldDefis{height:36px!important}
  #arena #srChatBtn{width:34px!important;height:34px!important}
  #arena #srChatPreview{left:50px!important;height:34px!important;min-height:34px!important;max-height:34px!important}
  #app.srHomeFullArena .homeForge{padding:3px 6px!important}
}
`;
}
function ensurePreview(){let p=document.getElementById("srChatPreview");if(!p){p=document.createElement("div");p.id="srChatPreview"}return p}
function updatePreview(p){const root=document.getElementById("srSocial");p.style.display=root?"none":"block";if(root)return;const msgs=read().filter(m=>m&&m.channel!=="announcements").slice(-2);p.innerHTML=msgs.map(m=>'<div class="p"><span class="n">'+esc(m.author||"?")+'</span>'+esc(m.text||"")+'</div>').join("")}
let lastHudH=0;
function measureHud(){
  const app=document.getElementById("app"),hud=document.getElementById("hud");
  if(!app||!hud||!app.classList.contains("srHomeFullArena"))return;
  const h=Math.round(hud.getBoundingClientRect().height);
  if(h>0&&Math.abs(h-lastHudH)>1){lastHudH=h;app.style.setProperty("--srHudH",h+"px")}
}
let scheduled=false;
function sync(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    const app=document.getElementById("app"),screen=document.getElementById("screen");if(!app||!screen)return;
    const home=screen.classList.contains("fixed")&&!!screen.querySelector(".campaignWorld");
    app.classList.toggle("srHomeFullArena",home);
    measureHud();
    const btn=document.getElementById("srChatBtn"),p=ensurePreview();
    if(home){
      const arena=screen.querySelector("#arena");
      if(arena&&btn&&btn.parentElement!==arena)arena.appendChild(btn);
      if(arena&&p.parentElement!==arena)arena.appendChild(p);
    }else{
      if(btn&&btn.parentElement!==app)app.appendChild(btn);
      if(p.parentElement!==app)app.appendChild(p);
    }
    updatePreview(p);
  });
}
installStyle();
const screen=document.getElementById("screen");if(screen)new MutationObserver(sync).observe(screen,{childList:true});
const hud=document.getElementById("hud");if(hud&&window.ResizeObserver)new ResizeObserver(measureHud).observe(hud);
window.addEventListener("storage",sync);window.addEventListener("resize",()=>{measureHud();sync()});sync();
})();