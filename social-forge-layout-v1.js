/* SHADOWREACH HOME FRAME LAYOUT V4
   True fixed home frame: world actions live in the HUD, stage info owns the
   arena top, combat owns the arena body, chat owns a separate strip below it. */
(() => {
"use strict";
const STORE="shadowreach.social.v1.messages";
function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}}
function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
function style(){let s=document.getElementById("srForgeLayoutStyle");if(!s){s=document.createElement("style");s.id="srForgeLayoutStyle";document.head.appendChild(s)}s.textContent=`
/* Accueil = cadre fixe, jamais une longue page. */
#screen.fixed{overflow:hidden!important;display:flex!important;flex-direction:column!important;min-height:0!important}
#screen.fixed>.recommendedWrap{display:none!important}
#screen.fixed>.campaignWorld{flex:1 1 0!important;min-height:0!important;height:auto!important;margin:0!important;position:relative!important;overflow:hidden!important}
#screen.fixed #arenaSlot{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important}
#screen.fixed #arena{height:100%!important;min-height:100%!important}
#screen.fixed>#skillbar{flex:0 0 auto!important;margin:0!important}
#screen.fixed>#fxbar{flex:0 0 auto!important}
#screen.fixed>.pad.mt4{flex:0 0 auto!important;margin-top:2px!important}
#screen.fixed .homeForge{padding:6px 8px!important;margin:0!important}
#screen.fixed .homeForge .fgFilter,#screen.fixed .homeForge .compactAuto{display:none!important}
#screen.fixed .homeCompactEnd{display:none!important}

/* HUD à deux niveaux : profil/ressources puis actions principales. */
#hud{flex-wrap:wrap!important;align-content:flex-start!important;gap:6px!important}
#srWorldTopDock{order:99;flex:0 0 100%;display:flex;justify-content:center;align-items:center;gap:8px;height:48px;padding:1px 2px 0;position:relative;z-index:95}
#srWorldTopDock .worldAction{position:relative!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;min-width:92px!important;width:auto!important;height:42px!important;padding:3px 9px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;border-radius:11px!important;pointer-events:auto!important}
#srWorldTopDock .worldAction img{width:27px!important;height:27px!important;object-fit:contain!important}
#srWorldTopDock .worldAction span{font-size:10px!important;white-space:nowrap!important}
#srWorldTopDock .worldDot{top:2px!important;right:2px!important}

/* Plus aucun gros bouton sur le terrain. */
#screen.fixed .worldNavLayer>.worldRebirth,#screen.fixed .worldNavLayer>.worldDev,#screen.fixed .worldNavLayer>.worldDefis{display:none!important}
#screen.fixed .worldNavLayer{position:absolute!important;inset:0!important;z-index:24!important;pointer-events:none!important}
#screen.fixed .worldMenu{left:8px!important;top:auto!important;bottom:8px!important;right:auto!important;pointer-events:auto!important}

/* L'étage et les vagues occupent seuls la zone haute de l'arène. */
#screen.fixed #arena .floorTag{top:9px!important;bottom:auto!important;z-index:18!important}

/* Le chat n'est plus dans le terrain : bande DOM séparée entre arène et skills. */
#srChatDock{flex:0 0 50px;height:50px;display:flex;align-items:center;gap:7px;padding:4px 9px;background:linear-gradient(180deg,#10192a,#0b1220);border-top:1px solid #34486e;border-bottom:1px solid #050912;position:relative;z-index:70;overflow:hidden}
#srChatDock #srChatBtn{position:relative!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;flex:0 0 42px!important;width:42px!important;height:42px!important;border-radius:10px!important;z-index:2!important;box-shadow:0 2px 0 #060b13,0 3px 8px #0008!important}
#srChatDock #srChatPreview{position:relative!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;flex:1 1 auto!important;min-width:0!important;height:40px!important;min-height:40px!important;max-height:40px!important;padding:4px 8px!important;border-radius:9px!important;background:linear-gradient(90deg,#101b2eee,#101827dd)!important;border:1px solid #34486e!important;pointer-events:none!important;overflow:hidden!important;box-shadow:none!important}
#srChatDock #srChatPreview .p{font-size:10px!important;line-height:1.5!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#d9e4f7!important}
#srChatDock #srChatPreview .n{font-weight:900!important;color:#93c6ff!important;margin-right:4px!important}

/* Chat ouvert : tiroir au-dessus de la navigation, sans modifier le cadre. */
#srSocial{inset:auto 8px calc(65px + env(safe-area-inset-bottom)) 8px!important;height:min(48vh,430px)!important;max-height:430px!important;border-radius:16px!important;border:1px solid #3A4E74!important;background:#08101bf2!important;overflow:hidden!important;box-shadow:0 -8px 28px #000b,0 0 0 1px #ffffff08 inset!important}
#srSocial .head{padding:8px 10px!important;min-height:43px!important}#srSocial .srTabs{margin:5px 8px 3px!important}#srSocial .srMessages{padding:6px 8px 60px!important}#srSocial .srMsg{padding:5px 7px!important;margin-bottom:4px!important;border-radius:8px!important}#srSocial .srText{font-size:11.5px!important;line-height:1.25!important}#srSocial .srMeta{font-size:8px!important}#srSocial .srCompose{padding:6px!important}#srSocial .srCompose input{padding:8px 9px!important;font-size:12px!important}#srSocial .srCompose button{padding:8px 10px!important;font-size:11px!important}

/* Hors Accueil : retour au bouton flottant sûr. */
#app>#srChatBtn{left:10px!important;right:auto!important;bottom:calc(68px + env(safe-area-inset-bottom))!important;width:44px!important;height:44px!important;border-radius:11px!important;z-index:86!important}
#app>#srChatPreview{position:absolute;left:60px;right:12px;bottom:calc(69px + env(safe-area-inset-bottom));z-index:82;min-height:38px;max-height:52px;padding:6px 9px;border-radius:9px;background:#09101be6;border:1px solid #2E426980;pointer-events:none;overflow:hidden}

@media(max-width:370px){#srWorldTopDock{gap:5px}#srWorldTopDock .worldAction{min-width:82px!important;padding:3px 6px!important}#srWorldTopDock .worldAction span{font-size:9px!important}}
@media(max-height:720px){#srWorldTopDock{height:43px}#srWorldTopDock .worldAction{height:38px!important}#srWorldTopDock .worldAction img{width:23px!important;height:23px!important}#srChatDock{height:46px;flex-basis:46px}#srChatDock #srChatBtn{width:38px!important;height:38px!important;flex-basis:38px!important}#srChatDock #srChatPreview{height:36px!important;min-height:36px!important;max-height:36px!important}#screen.fixed .homeForge{padding:4px 6px!important}}
`;}
function ensurePreview(){let p=document.getElementById("srChatPreview");if(!p){p=document.createElement("div");p.id="srChatPreview"}return p}
function updatePreview(p){const root=document.getElementById("srSocial");p.style.display=root?"none":"block";if(root)return;const msgs=read().filter(m=>m&&m.channel!=="announcements").slice(-2);p.innerHTML=msgs.map(m=>'<div class="p"><span class="n">'+esc(m.author||"?")+'</span>'+esc(m.text||"")+'</div>').join("")}
function sync(){
  const app=document.getElementById("app"),hud=document.getElementById("hud"),screen=document.getElementById("screen"),home=!!(screen&&screen.classList.contains("fixed")&&screen.querySelector(".campaignWorld"));
  const btn=document.getElementById("srChatBtn"),p=ensurePreview();
  let top=document.getElementById("srWorldTopDock");
  if(home){
    if(!top){top=document.createElement("div");top.id="srWorldTopDock"}
    if(hud&&top.parentElement!==hud)hud.appendChild(top);
    const fresh=[screen.querySelector(".worldRebirth"),screen.querySelector(".worldDev"),screen.querySelector(".worldDefis")].filter(Boolean);
    if(fresh.length===3&&(top.children.length!==3||fresh.some((n,i)=>top.children[i]!==n)))top.replaceChildren(...fresh);
    top.style.display="flex";
    let dock=document.getElementById("srChatDock");if(!dock){dock=document.createElement("div");dock.id="srChatDock"}
    const world=screen.querySelector(".campaignWorld");if(world&&dock.previousElementSibling!==world)world.insertAdjacentElement("afterend",dock);
    if(btn&&btn.parentElement!==dock)dock.appendChild(btn);if(p.parentElement!==dock)dock.appendChild(p);
  }else{
    if(top)top.style.display="none";
    const dock=document.getElementById("srChatDock");if(dock)dock.remove();
    if(app&&btn&&btn.parentElement!==app)app.appendChild(btn);if(app&&p.parentElement!==app)app.appendChild(p);
  }
  updatePreview(p);
}
style();sync();setInterval(sync,500);window.addEventListener("storage",sync);window.addEventListener("resize",sync);
})();