/* SHADOWREACH HOME FRAME LAYOUT V6
   Stable full-height arena. The arena begins at the very top behind the HUD,
   but gameplay controls stay in their original DOM. Only the chat preview/button
   are mounted into a dedicated lane. This avoids render-time node reparenting bugs. */
(() => {
"use strict";
const STORE="shadowreach.social.v1.messages";
function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}}
function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
function installStyle(){
  let s=document.getElementById("srForgeLayoutStyle");
  if(!s){s=document.createElement("style");s.id="srForgeLayoutStyle";document.head.appendChild(s)}
  s.textContent=`
#app.srHomeFullArena{position:relative!important;overflow:hidden!important}
#app.srHomeFullArena>#hud{
  position:absolute!important;left:0!important;right:0!important;top:0!important;z-index:70!important;
  flex:none!important;padding:calc(8px + env(safe-area-inset-top)) 10px 7px!important;
  background:linear-gradient(180deg,#07101df2 0%,#0a1422d6 72%,#08101b80 90%,transparent 100%)!important;
  border-bottom:0!important;box-shadow:none!important;pointer-events:auto!important;
}
#app.srHomeFullArena>#hud::after{display:none!important}
#app.srHomeFullArena>#screen.fixed{
  flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;display:flex!important;
  flex-direction:column!important;padding:0!important;margin:0!important;
}
#app.srHomeFullArena>#screen.fixed>.recommendedWrap{display:none!important}

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

/* Keep original controls in original DOM. Only position them. */
#app.srHomeFullArena .worldNavLayer{position:absolute!important;inset:0!important;z-index:30!important;pointer-events:none!important}
#app.srHomeFullArena .worldAction,#app.srHomeFullArena .worldMenu{pointer-events:auto!important}
#app.srHomeFullArena .worldRebirth{left:8px!important;top:calc(92px + env(safe-area-inset-top))!important;right:auto!important;bottom:auto!important}
#app.srHomeFullArena .worldDev{right:78px!important;top:calc(92px + env(safe-area-inset-top))!important;left:auto!important;bottom:auto!important}
#app.srHomeFullArena .worldDefis{right:8px!important;top:calc(92px + env(safe-area-inset-top))!important;left:auto!important;bottom:auto!important}
#app.srHomeFullArena .worldMenu{left:8px!important;top:auto!important;bottom:8px!important;right:auto!important}
#app.srHomeFullArena .worldAction{height:42px!important;min-width:62px!important;padding:3px 6px!important}
#app.srHomeFullArena .worldAction img{width:25px!important;height:25px!important;object-fit:contain!important}
#app.srHomeFullArena .worldAction span{font-size:9px!important}

#app.srHomeFullArena #arena .floorTag{top:calc(142px + env(safe-area-inset-top))!important;bottom:auto!important;z-index:22!important}

/* Combat layer uses full arena. Chat is outside, so feet remain visible. */
#app.srHomeFullArena #arena #aLayer,
#app.srHomeFullArena #arena #aDecor{inset:0!important;height:100%!important;bottom:0!important}

#srChatDock{
  flex:0 0 48px!important;height:48px!important;display:flex!important;align-items:center!important;gap:7px!important;
  padding:4px 9px!important;background:linear-gradient(180deg,#111b2c,#0a111d)!important;
  border-top:1px solid #34486e!important;border-bottom:1px solid #050912!important;
  position:relative!important;z-index:60!important;overflow:hidden!important
}
#srChatDock #srChatBtn{position:relative!important;inset:auto!important;flex:0 0 40px!important;width:40px!important;height:40px!important;border-radius:10px!important;z-index:2!important;box-shadow:0 2px 0 #060b13,0 3px 8px #0008!important}
#srChatDock #srChatPreview{position:relative!important;inset:auto!important;flex:1 1 auto!important;min-width:0!important;height:38px!important;min-height:38px!important;max-height:38px!important;padding:4px 8px!important;border-radius:9px!important;background:#101a2ce8!important;border:1px solid #34486e!important;pointer-events:none!important;overflow:hidden!important;box-shadow:none!important}
#srChatDock #srChatPreview .p{font-size:10px!important;line-height:1.45!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#d9e4f7!important}
#srChatDock #srChatPreview .n{font-weight:900!important;color:#93c6ff!important;margin-right:4px!important}

#app.srHomeFullArena #screen.fixed>#skillbar{flex:0 0 auto!important;margin:0!important;min-height:0!important}
#app.srHomeFullArena #screen.fixed>#fxbar{display:none!important}
#app.srHomeFullArena #screen.fixed>.pad.mt4{flex:0 0 auto!important;margin:0!important;padding:2px 8px 4px!important}
#app.srHomeFullArena .homeForge{padding:5px 7px!important;margin:0!important}
#app.srHomeFullArena .homeForge .fgFilter,#app.srHomeFullArena .homeForge .compactAuto,#app.srHomeFullArena .homeCompactEnd{display:none!important}

#srSocial{inset:auto 8px calc(65px + env(safe-area-inset-bottom)) 8px!important;height:min(48vh,430px)!important;max-height:430px!important;border-radius:16px!important;border:1px solid #3A4E74!important;background:#08101bf2!important;overflow:hidden!important;box-shadow:0 -8px 28px #000b,0 0 0 1px #ffffff08 inset!important}
#srSocial .head{padding:8px 10px!important;min-height:43px!important}#srSocial .srTabs{margin:5px 8px 3px!important}#srSocial .srMessages{padding:6px 8px 60px!important}#srSocial .srMsg{padding:5px 7px!important;margin-bottom:4px!important;border-radius:8px!important}#srSocial .srText{font-size:11.5px!important;line-height:1.25!important}#srSocial .srMeta{font-size:8px!important}#srSocial .srCompose{padding:6px!important}#srSocial .srCompose input{padding:8px 9px!important;font-size:12px!important}#srSocial .srCompose button{padding:8px 10px!important;font-size:11px!important}

#app:not(.srHomeFullArena)>#srChatBtn{left:10px!important;right:auto!important;bottom:calc(68px + env(safe-area-inset-bottom))!important;width:44px!important;height:44px!important;z-index:86!important}
#app:not(.srHomeFullArena)>#srChatPreview{position:absolute;left:60px;right:12px;bottom:calc(69px + env(safe-area-inset-bottom));z-index:82;min-height:38px;max-height:52px;padding:6px 9px;border-radius:9px;background:#09101be6;border:1px solid #2E426980;pointer-events:none;overflow:hidden}

@media(max-height:720px){
  #app.srHomeFullArena .worldRebirth,#app.srHomeFullArena .worldDev,#app.srHomeFullArena .worldDefis{top:calc(82px + env(safe-area-inset-top))!important;height:37px!important}
  #app.srHomeFullArena #arena .floorTag{top:calc(124px + env(safe-area-inset-top))!important}
  #srChatDock{height:44px!important;flex-basis:44px!important}
  #srChatDock #srChatBtn{width:36px!important;height:36px!important;flex-basis:36px!important}
  #srChatDock #srChatPreview{height:34px!important;min-height:34px!important;max-height:34px!important}
  #app.srHomeFullArena .homeForge{padding:3px 6px!important}
}
`;
}
function ensurePreview(){let p=document.getElementById("srChatPreview");if(!p){p=document.createElement("div");p.id="srChatPreview"}return p}
function updatePreview(p){const root=document.getElementById("srSocial");p.style.display=root?"none":"block";if(root)return;const msgs=read().filter(m=>m&&m.channel!=="announcements").slice(-2);p.innerHTML=msgs.map(m=>'<div class="p"><span class="n">'+esc(m.author||"?")+'</span>'+esc(m.text||"")+'</div>').join("")}
let scheduled=false;
function sync(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    const app=document.getElementById("app"),screen=document.getElementById("screen");if(!app||!screen)return;
    const home=screen.classList.contains("fixed")&&!!screen.querySelector(".campaignWorld");
    app.classList.toggle("srHomeFullArena",home);
    const btn=document.getElementById("srChatBtn"),p=ensurePreview();
    if(home){
      let dock=document.getElementById("srChatDock");if(!dock){dock=document.createElement("div");dock.id="srChatDock"}
      const world=screen.querySelector(".campaignWorld");if(world&&dock.previousElementSibling!==world)world.insertAdjacentElement("afterend",dock);
      if(btn&&btn.parentElement!==dock)dock.appendChild(btn);if(p.parentElement!==dock)dock.appendChild(p);
    }else{
      const dock=document.getElementById("srChatDock");if(dock)dock.remove();
      if(btn&&btn.parentElement!==app)app.appendChild(btn);if(p.parentElement!==app)app.appendChild(p);
    }
    updatePreview(p);
  });
}
installStyle();
const screen=document.getElementById("screen");if(screen)new MutationObserver(sync).observe(screen,{childList:true});
window.addEventListener("storage",sync);window.addEventListener("resize",sync);sync();
})();