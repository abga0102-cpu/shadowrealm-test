/* SHADOWREACH SOCIAL ARENA LAYOUT V2
   Compact chat lives inside a reserved lower lane of the campaign arena.
   The arena grows vertically and the combat layer is lifted to keep the chat
   below the fighters instead of covering Forge/content. */
(() => {
  "use strict";
  const STORE="shadowreach.social.v1.messages";
  function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}}
  function injectStyle(){
    let s=document.getElementById("srForgeLayoutStyle");
    if(!s){s=document.createElement("style");s.id="srForgeLayoutStyle";document.head.appendChild(s)}
    s.textContent=`
/* Arena occupies the large gameplay zone. Extra height creates a dedicated
   chat lane below the combat ground without pushing chat over the Forge. */
#screen.fixed #arenaSlot{
  height:clamp(360px,108vw,470px)!important;
  min-height:360px!important;
  max-height:470px!important;
}
@media(max-width:430px){
  #screen.fixed #arenaSlot{height:clamp(380px,116vw,490px)!important;min-height:380px!important;max-height:490px!important}
}
/* Lift the actual combat plane. The bottom 58px are reserved for chat. */
#screen.fixed #arena #aLayer{bottom:58px!important;height:calc(100% - 58px)!important}
#screen.fixed #arena #aDecor{bottom:58px!important;height:calc(100% - 58px)!important}
#screen.fixed #arena #arenaShade{bottom:0!important}

/* Chat access now belongs to the arena itself. */
#arena #srChatBtn{
  position:absolute!important;left:10px!important;right:auto!important;bottom:9px!important;
  width:44px!important;height:44px!important;border-radius:11px!important;z-index:86!important;
  box-shadow:0 3px 0 #0A1020,0 5px 12px #0008!important;font-size:18px!important;
}
#arena #srChatPreview{
  position:absolute!important;left:60px!important;right:10px!important;bottom:9px!important;z-index:82!important;
  height:44px!important;min-height:44px!important;max-height:44px!important;padding:5px 9px!important;border-radius:10px!important;
  background:linear-gradient(90deg,#09101bf2,#101a2ce8 75%,#101a2cb8)!important;
  border:1px solid #3A4E7499!important;pointer-events:none!important;overflow:hidden!important;
  font-family:var(--fu,system-ui)!important;box-shadow:0 2px 8px #0008!important;
}
#arena #srChatPreview .p{font-size:10px;line-height:1.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#D9E4F7}
#arena #srChatPreview .n{font-weight:900;color:#93C6FF;margin-right:4px}

/* Fallback outside campaign screens. */
#app>#srChatBtn{left:10px!important;right:auto!important;bottom:calc(68px + env(safe-area-inset-bottom))!important;width:44px!important;height:44px!important;border-radius:11px!important;z-index:86!important}
#app>#srChatPreview{position:absolute;left:60px;right:12px;bottom:calc(69px + env(safe-area-inset-bottom));z-index:82;min-height:38px;max-height:52px;padding:6px 9px;border-radius:9px;background:#09101be6;border:1px solid #2E426980;pointer-events:none;overflow:hidden}

/* Open chat stays a lower drawer. */
#srSocial{
  inset:auto 8px calc(65px + env(safe-area-inset-bottom)) 8px!important;
  height:min(48vh,430px)!important;max-height:430px!important;border-radius:16px!important;
  border:1px solid #3A4E74!important;background:#08101bf2!important;overflow:hidden!important;
  box-shadow:0 -8px 28px #000b,0 0 0 1px #ffffff08 inset!important;
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
#srSocial .srProfile{top:8%!important;left:10px!important;right:10px!important;max-height:84%!important;overflow:auto!important}
@media(max-height:650px){#srSocial{height:min(55vh,350px)!important}#arena #srChatPreview{height:40px!important;min-height:40px!important;max-height:40px!important}}
`;
  }
  function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
  function mountInArena(){
    const app=document.getElementById("app"),arena=document.getElementById("arena"),btn=document.getElementById("srChatBtn");
    let p=document.getElementById("srChatPreview");
    if(!p){p=document.createElement("div");p.id="srChatPreview"}
    const host=arena||app;if(host&&p.parentElement!==host)host.appendChild(p);
    if(btn&&host&&btn.parentElement!==host)host.appendChild(btn);
    return {p,arena};
  }
  function preview(){
    const {p}=mountInArena();if(!p)return;
    const root=document.getElementById("srSocial");p.style.display=root?"none":"block";if(root)return;
    const msgs=read().filter(m=>m&&m.channel!=="announcements").slice(-2);
    p.innerHTML=msgs.map(m=>'<div class="p"><span class="n">'+esc(m.author||"?")+'</span>'+esc(m.text||"")+'</div>').join("");
  }
  injectStyle();
  setInterval(preview,900);
  window.addEventListener("storage",preview);
  window.addEventListener("resize",preview);
  preview();
})();