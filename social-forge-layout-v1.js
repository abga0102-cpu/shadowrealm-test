/* SHADOWREACH SOCIAL FORGE LAYOUT V1
   Forge Master-inspired placement: persistent bottom chat access + compact
   lower drawer, leaving gameplay visible and interactive above it. */
(() => {
  "use strict";
  const STORE="shadowreach.social.v1.messages";
  function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}}
  function injectStyle(){
    if(document.getElementById("srForgeLayoutStyle"))return;
    const s=document.createElement("style");s.id="srForgeLayoutStyle";s.textContent=`
#srChatBtn{
  left:10px!important;right:auto!important;bottom:calc(68px + env(safe-area-inset-bottom))!important;
  width:44px!important;height:44px!important;border-radius:11px!important;z-index:86!important;
  box-shadow:0 3px 0 #0A1020,0 5px 12px #0008!important;font-size:18px!important;
}
#srChatPreview{
  position:absolute;left:60px;right:12px;bottom:calc(69px + env(safe-area-inset-bottom));z-index:82;
  min-height:38px;max-height:52px;padding:6px 9px;border-radius:9px;
  background:linear-gradient(90deg,#09101be6,#101a2cd9 72%,#101a2c80);border:1px solid #2E426980;
  pointer-events:none;overflow:hidden;font-family:var(--fu,system-ui);box-shadow:0 2px 8px #0006;
}
#srChatPreview .p{font-size:10px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#D9E4F7}
#srChatPreview .n{font-weight:900;color:#93C6FF;margin-right:4px}
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
@media(max-height:650px){#srSocial{height:min(55vh,350px)!important}.srChatPreview{display:none!important}}
`;
    document.head.appendChild(s);
  }
  function preview(){
    let p=document.getElementById("srChatPreview");
    if(!p){p=document.createElement("div");p.id="srChatPreview";const app=document.getElementById("app");if(app)app.appendChild(p)}
    const root=document.getElementById("srSocial");
    p.style.display=root?"none":"block";
    if(root)return;
    const msgs=read().filter(m=>m&&m.channel!=="announcements").slice(-2);
    p.innerHTML=msgs.map(m=>'<div class="p"><span class="n">'+esc(m.author||"?")+'</span>'+esc(m.text||"")+'</div>').join("");
  }
  function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
  injectStyle();
  setInterval(preview,700);
  window.addEventListener("storage",preview);
  preview();
})();