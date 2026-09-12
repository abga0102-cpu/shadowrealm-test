// CHAT_ARENA_OVERLAY_V48
// CHAT_COMPACT_OVERLAY_V50
/* SHADOWREACH SOCIAL V2
   Forge Master-inspired social UX: Monde / Clan / Annonces, compact feed,
   clickable player identity, PvP challenge and share cards. */
(() => {
  const KEY="shadowreach.social.v1.messages";
  const MAX=160;
  const channel = typeof BroadcastChannel!=="undefined" ? new BroadcastChannel("shadowreach-social-v1") : null;
  let open=false, profileOpen=null, unread=0, lastArenaResult=null, pendingChallenge=null, lastBotAt=0, activeTab="world";
  const tabs={world:"Monde",clan:"Clan",announcements:"Annonces"};
  const bots=[
    {name:"Nyx",level:34,power:18000,floor:62,forge:17,bot:true},
    {name:"Kael",level:48,power:42000,floor:81,forge:24,bot:true},
    {name:"Mira",level:27,power:9700,floor:49,forge:12,bot:true},
    {name:"Rook",level:61,power:86000,floor:103,forge:31,bot:true},
  ];
  const botLines={
    world:["Quelqu’un a déjà passé le prochain boss ?","Je viens de changer mon build, ça tape beaucoup mieux.","J’économise mes clés pour les raids.","Qui veut tester un duel ?","Je me suis encore fait surprendre par un boss 😅","La forge me ruine mais je continue quand même."],
    clan:["Quelqu’un garde des clés pour le prochain objectif ?","Je peux tester un duel si besoin.","Je viens de monter ma Forge."],
  };
  const esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  const now=()=>Date.now();
  const msgChannel=m=>tabs[m&&m.channel]?m.channel:"world";
  function myProfile(){
    try{return {name:String(S.playerName||S.name||"Héros").slice(0,24),level:Number(S.level)||1,power:Math.max(1,Number(S.power)||Number(typeof computePower==="function"?computePower(S):1)||1),floor:Number(S.recordFloor||S.floor)||1,forge:Number(S.forge&&S.forge.level)||1,bot:false};}
    catch(_){return {name:"Héros",level:1,power:1,floor:1,forge:1,bot:false};}
  }
  function read(){try{const a=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(a)?a.slice(-MAX):[]}catch(_){return[]}}
  function serialize(list){return JSON.stringify(list.slice(-MAX))}
  function write(list){try{localStorage.setItem(KEY,serialize(list))}catch(_){}}
  window.__srSocialMessageStoreV1={key:KEY,max:MAX,read,serialize};
  function push(msg,broadcast=true,relay=broadcast){
    if(!msg||!msg.id)return; msg.channel=msgChannel(msg);
    const list=read(); if(list.some(x=>x&&x.id===msg.id))return;
    list.push(msg); write(list);
    if(broadcast&&channel)try{channel.postMessage(msg)}catch(_){ }
    if(!open){unread++;paintButton();} else if(msg.channel===activeTab)render();
    if(relay)remoteSend(msg);
  }
  async function remoteSend(msg){const ep=window.SHADOWREACH_SOCIAL_ENDPOINT;if(!ep)return;try{await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(msg)})}catch(_){ }}
  async function remotePull(){const ep=window.SHADOWREACH_SOCIAL_ENDPOINT;if(!ep)return;try{const r=await fetch(ep+(ep.includes("?")?"&":"?")+"since="+encodeURIComponent(now()-180000),{cache:"no-store"});if(!r.ok)return;const a=await r.json();if(Array.isArray(a))a.forEach(m=>push(m,true,false));}catch(_){ }}
  function sendText(text){
    if(activeTab==="announcements")return;
    text=String(text||"").trim().slice(0,220); if(!text)return;
    const p=myProfile(); push({id:"m"+now()+Math.random().toString(36).slice(2,7),type:"text",channel:activeTab,ts:now(),author:p.name,profile:p,text});
  }
  function botSpeak(){
    const tab=Math.random()<.82?"world":"clan", pool=botLines[tab], b=bots[Math.floor(Math.random()*bots.length)],text=pool[Math.floor(Math.random()*pool.length)];
    push({id:"b"+now()+Math.random().toString(36).slice(2,7),type:"text",channel:tab,ts:now(),author:b.name,profile:b,text,bot:true},true,false); lastBotAt=now();
  }
  function seed(){
    if(read().length)return;
    const n=now();
    push({id:"seed-ann",type:"announcement",channel:"announcements",ts:n-90000,author:"Shadowreach",text:"Bienvenue dans le chat des testeurs. Utilise Monde pour discuter avec tous les joueurs et Clan pour coordonner ton groupe.",system:true},false,false);
    push({id:"seed-world",type:"text",channel:"world",ts:n-45000,author:bots[0].name,profile:bots[0],text:"Bienvenue dans le chat test 👋",bot:true},false,false);
  }
  function fmtTime(ts){try{return new Date(ts).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}catch(_){return""}}
  function injectStyle(){
    const s=document.createElement("style");s.textContent=`
/* Floating launcher intentionally suppressed by the social UI owner. */
#srChatBtn{display:none!important}
#srChatBtn{position:absolute;z-index:95;width:44px;height:44px;border-radius:50%;border:2px solid #0A1020;background:linear-gradient(#5FB4F5,#1E72C8);color:white;font-weight:900;box-shadow:0 3px 0 #0A1020,0 6px 14px #0007;cursor:pointer;transition:left .16s ease,top .16s ease}#srChatBtn b{position:absolute;right:-3px;top:-5px;min-width:19px;height:19px;border-radius:10px;background:#E5484D;color:#fff;font:800 11px/19px system-ui;padding:0 5px}
#srSocial{position:absolute;z-index:120;display:flex;flex-direction:column;color:#EDF1FA;font-family:var(--fu,system-ui);background:rgba(7,11,19,.36);border:1px solid rgba(111,151,210,.58);border-radius:13px;box-shadow:0 8px 22px #0005;overflow:hidden}#srSocial .head{padding:8px 10px 6px;border-bottom:1px solid rgba(46,66,105,.72);background:rgba(16,26,44,.40);display:flex;align-items:center;gap:8px}#srSocial .head .grow{flex:1}.srClose{border:0;background:#243553;color:#fff;border-radius:9px;padding:7px 10px;font-weight:900}.srStatus{font-size:9px;color:#93A4C4;margin-top:2px}
.srTabs{display:flex;background:rgba(11,17,31,.32);border-bottom:1px solid rgba(46,66,105,.68);padding:4px 6px 0;gap:4px}.srTab{flex:1;text-align:center;padding:8px 3px;border-radius:9px 9px 0 0;color:#7F91B2;font-weight:900;font-size:11px;cursor:pointer;border:1px solid transparent;border-bottom:0}.srTab.on{background:rgba(23,36,59,.48);color:#FBDD8C;border-color:#2E4269}
.srMessages{flex:1;overflow:auto;padding:6px 8px 58px;overscroll-behavior:contain}.srMsg{padding:6px 7px;margin:0 0 4px;border-bottom:1px solid rgba(30,44,73,.65);background:rgba(8,13,24,.12);border-radius:7px}.srMsg.combat{margin:7px 0;border:1px solid #8A6522;border-radius:10px;background:linear-gradient(180deg,#251d0e,#17130c);padding:9px}.srMsg.announcement{margin:7px 0;border:1px solid #4A6494;border-radius:10px;background:#111d31;padding:9px}.srName{font-weight:900;color:#93C6FF;cursor:pointer;font-size:12px}.srBot,.srBadge{font-size:8px;color:#FBDD8C;margin-left:5px;border:1px solid #8A6522;border-radius:5px;padding:1px 4px}.srText{font-size:12px;margin-top:2px;line-height:1.35}.srMeta{font-size:8px;color:#6A7B9C;margin-left:5px}.srCombatTitle{font-weight:900;color:#FBDD8C;font-size:12px}.srCombatVs{font-size:11px;margin-top:4px}.srCompose{position:absolute;left:0;right:0;bottom:0;padding:6px;background:rgba(16,26,44,.42);border-top:1px solid rgba(46,66,105,.72);display:flex;gap:5px}.srCompose input{flex:1;min-width:0;border:1px solid #2E4269;background:rgba(8,13,24,.58);color:white;border-radius:9px;padding:9px;font-size:13px}.srCompose button,.srAction{border:0;border-radius:9px;background:#1E72C8;color:white;padding:8px 10px;font-weight:900}.srCompose.readonly{display:block;text-align:center;color:#7F91B2;font-size:10px;padding:12px}.srProfile{position:absolute;left:14px;right:14px;top:18%;z-index:3;background:#141F35;border:1px solid #4A6494;border-radius:14px;padding:14px;box-shadow:0 15px 50px #000}.srGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0}.srStat{background:#0B111F;border:1px solid #26344F;border-radius:9px;padding:8px;font-size:11px}.srShare{margin:7px 10px 0;padding:8px;border:1px solid #8A6522;border-radius:9px;background:#231b0c;color:#FBDD8C;font-size:10px;cursor:pointer;text-align:center}
`;
    document.head.appendChild(s);
  }
  function paintButton(){const b=document.getElementById("srChatBtn");if(!b)return;b.innerHTML="💬"+(unread?"<b>"+Math.min(99,unread)+"</b>":"");}
  function dockSocialUI(){
    const app=document.getElementById("app"), arena=document.querySelector(".campaignWorld");
    const b=document.getElementById("srChatBtn"), root=document.getElementById("srSocial");
    if(!app)return;
    const ar=arena?arena.getBoundingClientRect():null, ap=app.getBoundingClientRect();
    if(b){
      if(ar){
        // Sit on the arena's outer edge instead of floating over Forge/content.
        const desired=ar.right-ap.left-b.offsetWidth*.46;
        const left=Math.max(6,Math.min(app.clientWidth-b.offsetWidth-4,desired));
        const top=Math.max(8,ar.top-ap.top+14);
        b.style.left=left+"px";b.style.top=top+"px";b.style.right="auto";b.style.bottom="auto";
      }else{b.style.left="auto";b.style.top="66px";b.style.right="10px";b.style.bottom="auto";}
    }
    if(root){
      if(ar){
        const margin=7, top=Math.max(margin,ar.top-ap.top+margin);
        // About 72% of the arena width, anchored to its right edge.
        const width=Math.max(220,Math.min(310,ar.width*.72));
        const desiredLeft=ar.right-ap.left-width-margin;
        const left=Math.max(margin,Math.min(app.clientWidth-width-margin,desiredLeft));
        const height=Math.max(205,Math.min(268,ar.height-margin*2));
        root.style.left=left+"px";root.style.top=top+"px";root.style.right="auto";root.style.bottom="auto";root.style.width=width+"px";root.style.height=height+"px";
      }else{
        // Outside campaign, stay compact rather than becoming a near-full-screen sheet.
        const width=Math.max(220,Math.min(310,app.clientWidth-20));
        root.style.left="auto";root.style.right="10px";root.style.top="72px";root.style.bottom="auto";root.style.width=width+"px";root.style.height=Math.min(360,Math.max(240,app.clientHeight-160))+"px";
      }
    }
  }
  function mountButton(){
    const existing=document.getElementById("srChatBtn"); let unlocked=true;
    try{unlocked=typeof RULES==="undefined"||typeof S==="undefined"||Number(S.level||1)>=Number(RULES.CHAT_UNLOCK_LEVEL||3)}catch(_){unlocked=true}
    if(!unlocked){if(existing)existing.remove();return;} if(existing){paintButton();return;}
    const b=document.createElement("button");b.id="srChatBtn";b.type="button";b.setAttribute("aria-label","Ouvrir le chat");b.onclick=()=>{open=true;unread=0;paintButton();render();};document.getElementById("app").appendChild(b);paintButton();dockSocialUI();
  }
  function syncSocialLayout(){requestAnimationFrame(()=>{mountButton();dockSocialUI();});}
  function profileHTML(p){if(!p)return"";return `<div class="srProfile"><div style="display:flex;justify-content:space-between;gap:8px"><div><div style="font-weight:900;font-size:18px">${esc(p.name)}</div><div class="srStatus">${p.bot?"BOT DE TEST":"JOUEUR"}</div></div><button class="srClose" data-sr="profileClose">✕</button></div><div class="srGrid"><div class="srStat">Niveau<br><b>${p.level||1}</b></div><div class="srStat">Puissance<br><b>${Math.round(p.power||1).toLocaleString()}</b></div><div class="srStat">Record étage<br><b>${p.floor||1}</b></div><div class="srStat">Forge<br><b>${p.forge||1}</b></div></div>${p.name!==myProfile().name?'<button class="srAction" style="width:100%" data-sr="challenge">⚔️ Défier</button>':''}</div>`}
  function messageHTML(m){
    const type=m.type==="combat"?"combat":m.type==="announcement"?"announcement":"";
    if(type==="combat")return `<div class="srMsg combat"><div><span class="srName" data-sr="profile" data-id="${esc(m.id)}">${esc(m.author||"?")}</span><span class="srMeta">${fmtTime(m.ts)}</span></div><div class="srCombatTitle">${m.won?"🏆 Victoire PvP":"⚔️ Duel PvP"}</div><div class="srCombatVs">${esc(m.text||"")}</div></div>`;
    if(type==="announcement")return `<div class="srMsg announcement"><div><span class="srName">${esc(m.author||"Shadowreach")}</span><span class="srBadge">ANNONCE</span><span class="srMeta">${fmtTime(m.ts)}</span></div><div class="srText">${esc(m.text||"")}</div></div>`;
    return `<div class="srMsg"><div><span class="srName" data-sr="profile" data-id="${esc(m.id)}">${esc(m.author||"?")}</span>${m.bot?'<span class="srBot">BOT</span>':''}<span class="srMeta">${fmtTime(m.ts)}</span></div><div class="srText">${esc(m.text||"")}</div></div>`;
  }
  function render(){
    let root=document.getElementById("srSocial");if(!open){if(root)root.remove();return;} if(!root){root=document.createElement("div");root.id="srSocial";document.getElementById("app").appendChild(root)}
    const msgs=read().filter(m=>msgChannel(m)===activeTab); const status=window.SHADOWREACH_SOCIAL_ENDPOINT?"Temps réel connecté":"Chat test · connexion P2P si disponible";
    const composer=activeTab==="announcements"?'<div class="srCompose readonly">Canal réservé aux annonces du jeu et du clan.</div>':'<div class="srCompose"><input id="srInput" maxlength="220" placeholder="Message '+tabs[activeTab]+'…"><button data-sr="send">Envoyer</button></div>';
    root.innerHTML=`<div class="head"><div class="grow"><div style="font-weight:900">Chat</div><div class="srStatus status">${status}</div></div><button class="srClose" data-sr="close">✕</button></div><div class="srTabs">${Object.keys(tabs).map(k=>`<div class="srTab ${activeTab===k?'on':''}" data-sr="tab" data-tab="${k}">${tabs[k]}</div>`).join("")}</div>${lastArenaResult&&activeTab!=="announcements"?'<div class="srShare" data-sr="shareLast">⚔️ Partager le dernier duel dans '+tabs[activeTab]+'</div>':''}<div class="srMessages">${msgs.map(messageHTML).join("")||'<div class="srStatus" style="text-align:center;margin-top:24px">Aucun message dans ce canal.</div>'}</div>${composer}${profileHTML(profileOpen)}`;
    const list=root.querySelector('.srMessages');if(list)list.scrollTop=list.scrollHeight;
    dockSocialUI();
  }
  function findProfileByMessage(id){const m=read().find(x=>x&&x.id===id);return m&&m.profile?m.profile:null}
  function startChallenge(p){
    if(!p||typeof startArenaLiveFight!=="function"||typeof arenaSimCfg!=="object")return;
    const mine=myProfile(),ratio=Math.max(50,Math.min(200,Math.round((Number(p.power)||mine.power)/Math.max(1,mine.power)*100))); arenaSimCfg.ratio=ratio;arenaSimCfg.build="equilibre";
    const before=typeof arenaLiveResult!=="undefined"?arenaLiveResult:null; if(!startArenaLiveFight())return;
    try{if(arenaLiveBot)arenaLiveBot.name=p.name;if(combat&&combat.enemies){const e=combat.enemies.find(x=>x.arenaProfile)||combat.enemies[0];if(e)e.name=p.name;}}catch(_){ }
    pendingChallenge={target:p,started:now(),before};open=false;profileOpen=null;render();try{toast("Duel contre "+p.name)}catch(_){ }
  }
  function shareCombat(){
    if(!lastArenaResult||activeTab==="announcements")return;const me=myProfile(),r=lastArenaResult,target=r.target||{name:r.bot&&r.bot.name||"Rival"};
    push({id:"fight"+now()+Math.random().toString(36).slice(2,6),type:"combat",channel:activeTab,ts:now(),author:me.name,profile:me,target:target.name,won:!!r.won,text:(r.won?"Victoire":"Défaite")+" de "+me.name+" contre "+target.name});open=true;render();
  }
  document.addEventListener("click",e=>{
    const el=e.target.closest&&e.target.closest("[data-sr]");if(!el)return;const a=el.dataset.sr;
    if(a==="close"){open=false;profileOpen=null;render()} else if(a==="tab"){if(tabs[el.dataset.tab]){activeTab=el.dataset.tab;profileOpen=null;render()}}
    else if(a==="send"){const i=document.getElementById("srInput");sendText(i&&i.value);if(i)i.value="";render()} else if(a==="profile"){profileOpen=findProfileByMessage(el.dataset.id);render()}
    else if(a==="profileClose"){profileOpen=null;render()} else if(a==="challenge"){startChallenge(profileOpen)} else if(a==="shareLast"){shareCombat()}
  });
  document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target&&e.target.id==="srInput"){e.preventDefault();sendText(e.target.value);e.target.value="";render();}});
  if(channel)channel.onmessage=e=>{if(e&&e.data)push(e.data,false,false)};window.addEventListener("storage",e=>{if(e.key===KEY&&open)render()});
  setInterval(()=>{remotePull();if(now()-lastBotAt>60000+Math.random()*120000&&Math.random()<.28)botSpeak();},15000);
  setInterval(()=>{if(!pendingChallenge)return;try{if(typeof arenaLiveResult!=="undefined"&&arenaLiveResult&&arenaLiveResult!==pendingChallenge.before){lastArenaResult={...arenaLiveResult,target:pendingChallenge.target};pendingChallenge=null;try{toast("Combat terminé · partage disponible dans le chat",true)}catch(_){ }}}catch(_){ }},800);
  seed();injectStyle();mountButton();remotePull();

  // CHAT_ARENA_OVERLAY_V48 docking: follow the Campaign arena without covering Forge.
  window.addEventListener("resize",dockSocialUI,{passive:true});
  window.addEventListener("orientationchange",()=>setTimeout(dockSocialUI,120),{passive:true});
  window.addEventListener("sr:bottomnavrendered",syncSocialLayout);
})();