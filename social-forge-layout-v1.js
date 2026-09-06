/* SHADOWREACH HOME FRAME LAYOUT V3
   Forge-Master-inspired fixed home frame: arena fills the available world,
   world controls are grouped high, combat ground stays clear, and chat owns a
   dedicated strip below fighters. No home-page vertical scrolling. */
(() => {
"use strict";
const STORE="shadowreach.social.v1.messages";
function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}}
function injectStyle(){let s=document.getElementById("srForgeLayoutStyle");if(!s){s=document.createElement("style");s.id="srForgeLayoutStyle";document.head.appendChild(s)}s.textContent=`
/* HOME = one fixed frame. The arena consumes every pixel left between HUD and
   the permanent lower controls instead of making the player scroll. */
#screen.fixed{overflow:hidden!important;display:flex!important;flex-direction:column!important;min-height:0!important}
#screen.fixed>.recommendedWrap{flex:0 0 auto}
#screen.fixed>.campaignWorld{flex:1 1 auto!important;min-height:330px!important;height:auto!important;margin:0!important;position:relative!important;overflow:hidden!important}
#screen.fixed #arenaSlot{position:absolute!important;inset:0!important;height:100%!important;min-height:0!important;max-height:none!important}
#screen.fixed #arena{height:100%!important;min-height:100%!important}
#screen.fixed>#skillbar{flex:0 0 auto!important;margin-top:0!important}
#screen.fixed>#fxbar{flex:0 0 auto!important}
#screen.fixed>.pad.mt4{flex:0 0 auto!important;margin-top:2px!important}
#screen.fixed .homeForge{padding:7px 9px!important;margin:0!important}
#screen.fixed .homeForge .fgFilter,#screen.fixed .homeForge .compactAuto{display:none!important}
#screen.fixed .homeCompactEnd{display:none!important}

/* World navigation is one compact upper control band. It no longer descends
   through the battlefield. */
#screen.fixed .worldNavLayer{position:absolute!important;inset:8px 8px auto 8px!important;height:58px!important;z-index:30!important;pointer-events:none!important}
#screen.fixed .worldAction,#screen.fixed .worldMenu{pointer-events:auto!important}
#screen.fixed .worldRebirth{left:0!important;top:0!important;right:auto!important;bottom:auto!important}
#screen.fixed .worldDev{right:66px!important;top:0!important;left:auto!important;bottom:auto!important}
#screen.fixed .worldDefis{right:0!important;top:0!important;left:auto!important;bottom:auto!important}
#screen.fixed .worldMenu{left:0!important;top:64px!important;right:auto!important;bottom:auto!important}

/* Floor/wave information sits in its own readable upper-middle pocket, below
   the action band and above the actual fighting ground. */
#screen.fixed #arena .floorTag{top:70px!important;bottom:auto!important;z-index:18!important}

/* The walking/fighting plane is lifted. The lower 54px are exclusively chat;
   feet and health bars remain above it. */
#screen.fixed #arena #aLayer{bottom:58px!important;height:calc(100% - 58px)!important}
#screen.fixed #arena #aDecor{bottom:58px!important;height:calc(100% - 58px)!important}
#screen.fixed #arena #arenaShade{bottom:0!important}

/* Persistent chat strip, visually part of the arena but outside the ground. */
#arena #srChatBtn{position:absolute!important;left:9px!important;right:auto!important;bottom:7px!important;width:44px!important;height:44px!important;border-radius:11px!important;z-index:86!important;box-shadow:0 3px 0 #0A1020,0 5px 12px #0008!important;font-size:18px!important}
#arena #srChatPreview{position:absolute!important;left:59px!important;right:9px!important;bottom:7px!important;z-index:82!important;height:44px!important;min-height:44px!important;max-height:44px!important;padding:5px 9px!important;border-radius:10px!important;background:linear-gradient(90deg,#09101bf7,#101a2cef 75%,#101a2cc7)!important;border:1px solid #3A4E74bb!important;pointer-events:none!important;overflow:hidden!important;font-family:var(--fu,system-ui)!important;box-shadow:0 2px 8px #0008!important}
#arena #srChatPreview .p{font-size:10px;line-height:1.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#D9E4F7}
#arena #srChatPreview .n{font-weight:900;color:#93C6FF;margin-right:4px}

/* Outside Home, keep a safe floating fallback. */
#app>#srChatBtn{left:10px!important;right:auto!important;bottom:calc(68px + env(safe-area-inset-bottom))!important;width:44px!important;height:44px!important;border-radius:11px!important;z-index:86!important}
#app>#srChatPreview{position:absolute;left:60px;right:12px;bottom:calc(69px + env(safe-area-inset-bottom));z-index:82;min-height:38px;max-height:52px;padding:6px 9px;border-radius:9px;background:#09101be6;border:1px solid #2E426980;pointer-events:none;overflow:hidden}

#srSocial{inset:auto 8px calc(65px + env(safe-area-inset-bottom)) 8px!important;height:min(48vh,430px)!important;max-height:430px!important;border-radius:16px!important;border:1px solid #3A4E74!important;background:#08101bf2!important;overflow:hidden!important;box-shadow:0 -8px 28px #000b,0 0 0 1px #ffffff08 inset!important}
#srSocial .head{padding:8px 10px!important;min-height:43px!important}#srSocial .srTabs{margin:5px 8px 3px!important}#srSocial .srMessages{padding:6px 8px 60px!important}#srSocial .srMsg{padding:5px 7px!important;margin-bottom:4px!important;border-radius:8px!important}#srSocial .srText{font-size:11.5px!important;line-height:1.25!important}#srSocial .srMeta{font-size:8px!important}#srSocial .srCompose{padding:6px!important}#srSocial .srCompose input{padding:8px 9px!important;font-size:12px!important}#srSocial .srCompose button{padding:8px 10px!important;font-size:11px!important}#srSocial .srProfile{top:8%!important;left:10px!important;right:10px!important;max-height:84%!important;overflow:auto!important}
@media(max-height:760px){#screen.fixed>.campaignWorld{min-height:285px!important}#screen.fixed .homeForge{padding:5px 7px!important}#screen.fixed #arena .floorTag{top:62px!important}}
@media(max-height:650px){#screen.fixed>.campaignWorld{min-height:245px!important}#srSocial{height:min(55vh,350px)!important}#arena #srChatPreview{height:40px!important;min-height:40px!important;max-height:40px!important}}
`;}
function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
function mountInArena(){const app=document.getElementById("app"),arena=document.getElementById("arena"),btn=document.getElementById("srChatBtn");let p=document.getElementById("srChatPreview");if(!p){p=document.createElement("div");p.id="srChatPreview"}const host=arena||app;if(host&&p.parentElement!==host)host.appendChild(p);if(btn&&host&&btn.parentElement!==host)host.appendChild(btn);return{p,arena}}
function preview(){const{p}=mountInArena();if(!p)return;const root=document.getElementById("srSocial");p.style.display=root?"none":"block";if(root)return;const msgs=read().filter(m=>m&&m.channel!=="announcements").slice(-2);p.innerHTML=msgs.map(m=>'<div class="p"><span class="n">'+esc(m.author||"?")+'</span>'+esc(m.text||"")+'</div>').join("")}
injectStyle();setInterval(preview,900);window.addEventListener("storage",preview);window.addEventListener("resize",preview);preview();
})();