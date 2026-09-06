/* SHADOWREACH HOME FRAME LAYOUT V5
   Arena starts at the very top of the phone, behind the HUD, Forge-Master style.
   HUD is an overlay, not a block that consumes arena height. Chat has its own
   lane outside the combat ground. Home never scrolls. */
(() => {
"use strict";
const STORE="shadowreach.social.v1.messages";
function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}}
function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
function installStyle(){
  let s=document.getElementById("srForgeLayoutStyle");
  if(!s){s=document.createElement("style");s.id="srForgeLayoutStyle";document.head.appendChild(s)}
  s.textContent=`
/* ===== HOME ROOT =====
   On Home only, HUD leaves normal document flow. Screen therefore begins at
   y=0 and the arena artwork is visible behind the HUD all the way to the top. */
#app.srHomeFullArena{position:relative!important;overflow:hidden!important}
#app.srHomeFullArena>#hud{
  position:absolute!important;left:0!important;right:0!important;top:0!important;z-index:70!important;
  flex:none!important;padding:calc(9px + env(safe-area-inset-top)) 12px 7px!important;
  background:linear-gradient(180deg,#07101de8 0%,#0a1422c9 72%,#08101b75 90%,transparent 100%)!important;
  border-bottom:0!important;box-shadow:none!important;pointer-events:auto!important;
}
#app.srHomeFullArena>#hud::after{display:none!important}
#app.srHomeFullArena>#screen.fixed{
  flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;
  display:flex!important;flex-direction:column!important;padding:0!important;
}
#app.srHomeFullArena>#screen.fixed>.recommendedWrap{display:none!important}

/* ===== ARENA ===== */
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

/* HUD actions sit over the art. They do not steal height from the arena. */
#srWorldTopDock{
  order:99;flex:0 0 100%;display:flex;justify-content:center;align-items:center;gap:7px;
  height:44px;padding:0 2px;position:relative;z-index:95
}
#srWorldTopDock .worldAction{
  position:relative!important;inset:auto!important;min-width:86px!important;width:auto!important;height:39px!important;
  padding:3px 7px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;
  border-radius:10px!important;pointer-events:auto!important
}
#srWorldTopDock .worldAction img{width:24px!important;height:24px!important;object-fit:contain!important}
#srWorldTopDock .worldAction span{font-size:9px!important;white-space:nowrap!important}
#srWorldTopDock .worldDot{top:1px!important;right:1px!important}

/* Original arena copies are hidden after being moved to HUD. Menu stays small. */
#app.srHomeFullArena .worldNavLayer>.worldRebirth,
#app.srHomeFullArena .worldNavLayer>.worldDev,
#app.srHomeFullArena .worldNavLayer>.worldDefis{display:none!important}
#app.srHomeFullArena .worldNavLayer{position:absolute!important;inset:0!important;z-index:28!important;pointer-events:none!important}
#app.srHomeFullArena .worldMenu{left:8px!important;top:auto!important;bottom:8px!important;right:auto!important;pointer-events:auto!important}

/* The level/wave strip starts below the overlaid HUD. Arena itself still starts at 0. */
#app.srHomeFullArena #arena .floorTag{
  top:calc(128px + env(safe-area-inset-top))!important;bottom:auto!important;z-index:22!important;
}

/* ===== TRUE COMBAT GROUND =====
   Nothing overlays the combat layer anymore. The renderer gets the full arena;
   the separate chat dock is outside campaignWorld, so feet can never be hidden. */
#app.srHomeFullArena #arena #aLayer,
#app.srHomeFullArena #arena #aDecor{inset:0!important;height:100%!important;bottom:0!important}

/* ===== CHAT LANE ===== */
#srChatDock{
  flex:0 0 48px!important;height:48px!important;display:flex!important;align-items:center!important;gap:7px!important;
  padding:4px 9px!important;background:linear-gradient(180deg,#111b2c,#0a111d)!important;
  border-top:1px solid #34486e!important;border-bottom:1px solid #050912!important;
  position:relative!important;z-index:60!important;overflow:hidden!important
}
#srChatDock #srChatBtn{
  position:relative!important;inset:auto!important;flex:0 0 40px!important;width:40px!important;height:40px!important;
  border-radius:10px!important;z-index:2!important;box-shadow:0 2px 0 #060b13,0 3px 8px #0008!important
}
#srChatDock #srChatPreview{
  position:relative!important;inset:auto!important;flex:1 1 auto!important;min-width:0!important;
  height:38px!important;min-height:38px!important;max-height:38px!important;padding:4px 8px!important;
  border-radius:9px!important;background:#101a2ce8!important;border:1px solid #34486e!important;
  pointer-events:none!important;overflow:hidden!important;box-shadow:none!important
}
#srChatDock #srChatPreview .p{font-size:10px!important;line-height:1.45!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#d9e4f7!important}
#srChatDock #srChatPreview .n{font-weight:900!important;color:#93c6ff!important;margin-right:4px!important}

/* ===== LOWER HOME CONTROLS ===== */
#app.srHomeFullArena #screen.fixed>#skillbar{flex:0 0 auto!important;margin:0!important;min-height:0!important}
#app.srHomeFullArena #screen.fixed>#fxbar{display:none!important}
#app.srHomeFullArena #screen.fixed>.pad.mt4{flex:0 0 auto!important;margin:0!important;padding:2px 8px 4px!important}
#app.srHomeFullArena .homeForge{padding:5px 7px!important;margin:0!important}
#app.srHomeFullArena .homeForge .fgFilter,
#app.srHomeFullArena .homeForge .compactAuto,
#app.srHomeFullArena .homeCompactEnd{display:none!important}

/* Open chat is a drawer; it never changes arena measurements. */
#srSocial{
  inset:auto 8px calc(65px + env(safe-area-inset-bottom)) 8px!important;height:min(48vh,430px)!important;
  max-height:430px!important;border-radius:16px!important;border:1px solid #3A4E74!important;
  background:#08101bf2!important;overflow:hidden!important;box-shadow:0 -8px 28px #000b,0 0 0 1px #ffffff08 inset!important
}
#srSocial .head{padding:8px 10px!important;min-height:43px!important}
#srSocial .srTabs{margin:5px 8px 3px!important}
#srSocial .srMessages{padding:6px 8px 60px!important}
#srSocial .srMsg{padding:5px 7px!important;margin-bottom:4px!important;border-radius:8px!important}
#srSocial .srText{font-size:11.5px!important;line-height:1.25!important}
#srSocial .srMeta{font-size:8px!important}
#srSocial .srCompose{padding:6px!important}
#srSocial .srCompose input{padding:8px 9px!important;font-size:12px!important}
#srSocial .srCompose button{padding:8px 10px!important;font-size:11px!important}

/* Non-home screens keep their normal document flow and floating chat. */
#app:not(.srHomeFullArena)>#srChatBtn{left:10px!important;right:auto!important;bottom:calc(68px + env(safe-area-inset-bottom))!important;width:44px!important;height:44px!important;z-index:86!important}
#app:not(.srHomeFullArena)>#srChatPreview{position:absolute;left:60px;right:12px;bottom:calc(69px + env(safe-area-inset-bottom));z-index:82;min-height:38px;max-height:52px;padding:6px 9px;border-radius:9px;background:#09101be6;border:1px solid #2E426980;pointer-events:none;overflow:hidden}

@media(max-width:370px){
  #srWorldTopDock{gap:4px!important}
  #srWorldTopDock .worldAction{min-width:78px!important;padding:3px 5px!important}
  #srWorldTopDock .worldAction span{font-size:8.5px!important}
}
@media(max-height:720px){
  #app.srHomeFullArena #arena .floorTag{top:calc(116px + env(safe-area-inset-top))!important}
  #srWorldTopDock{height:39px!important}
  #srWorldTopDock .worldAction{height:35px!important}
  #srWorldTopDock .worldAction img{width:21px!important;height:21px!important}
  #srChatDock{height:44px!important;flex-basis:44px!important}
  #srChatDock #srChatBtn{width:36px!important;height:36px!important;flex-basis:36px!important}
  #srChatDock #srChatPreview{height:34px!important;min-height:34px!important;max-height:34px!important}
  #app.srHomeFullArena .homeForge{padding:3px 6px!important}
}
`;
}
function ensurePreview(){let p=document.getElementById("srChatPreview");if(!p){p=document.createElement("div");p.id="srChatPreview"}return p}
function preview(p){const root=document.getElementById("srSocial");p.style.display=root?"none":"block";if(root)return;const msgs=read().filter(m=>m&&m.channel!=="announcements").slice(-2);p.innerHTML=msgs.map(m=>'<div class="p"><span class="n">'+esc(m.author||"?")+'</span>'+esc(m.text||"")+'</div>').join("")}
let syncing=false;
function sync(){
  if(syncing)return;syncing=true;
  requestAnimationFrame(()=>{
    syncing=false;
    const app=document.getElementById("app"),hud=document.getElementById("hud"),screen=document.getElementById("screen");
    if(!app||!screen)return;
    const home=screen.classList.contains("fixed")&&!!screen.querySelector(".campaignWorld");
    app.classList.toggle("srHomeFullArena",home);
    const btn=document.getElementById("srChatBtn"),p=ensurePreview();
    let top=document.getElementById("srWorldTopDock");
    if(home){
      if(!top){top=document.createElement("div");top.id="srWorldTopDock"}
      if(hud&&top.parentElement!==hud)hud.appendChild(top);
      const fresh=[screen.querySelector(".worldRebirth"),screen.querySelector(".worldDev"),screen.querySelector(".worldDefis")].filter(Boolean);
      if(fresh.length===3&&(top.children.length!==3||fresh.some((n,i)=>top.children[i]!==n)))top.replaceChildren(...fresh);
      top.style.display="flex";
      let dock=document.getElementById("srChatDock");
      if(!dock){dock=document.createElement("div");dock.id="srChatDock"}
      const world=screen.querySelector(".campaignWorld");
      if(world&&dock.previousElementSibling!==world)world.insertAdjacentElement("afterend",dock);
      if(btn&&btn.parentElement!==dock)dock.appendChild(btn);
      if(p.parentElement!==dock)dock.appendChild(p);
    }else{
      if(top)top.style.display="none";
      const dock=document.getElementById("srChatDock");if(dock)dock.remove();
      if(app&&btn&&btn.parentElement!==app)app.appendChild(btn);
      if(app&&p.parentElement!==app)app.appendChild(p);
    }
    preview(p);
  });
}
installStyle();
const screen=document.getElementById("screen");
if(screen)new MutationObserver(sync).observe(screen,{childList:true});
window.addEventListener("storage",sync);window.addEventListener("resize",sync);
sync();
})();