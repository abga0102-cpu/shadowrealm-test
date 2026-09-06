/* SHADOWREACH SOCIAL V1
   Frontend social layer. Same-origin tabs/devices on the same browser sync via
   BroadcastChannel + localStorage. A remote transport can be attached later via
   window.SHADOWREACH_SOCIAL_ENDPOINT without changing the UI contract. */
(() => {
  const KEY="shadowreach.social.v1.messages";
  const MAX=120;
  const channel = typeof BroadcastChannel!=="undefined" ? new BroadcastChannel("shadowreach-social-v1") : null;
  let open=false, profileOpen=null, unread=0, lastArenaResult=null, pendingChallenge=null, lastBotAt=0;
  const bots=[
    {name:"Nyx",level:34,power:18000,floor:62,forge:17,bot:true},
    {name:"Kael",level:48,power:42000,floor:81,forge:24,bot:true},
    {name:"Mira",level:27,power:9700,floor:49,forge:12,bot:true},
    {name:"Rook",level:61,power:86000,floor:103,forge:31,bot:true},
  ];
  const botLines=[
    "Quelqu’un a déjà passé le prochain boss ?",
    "Je viens de changer mon build, ça tape beaucoup mieux.",
    "J’économise mes clés pour les raids.",
    "Le Raid Évolution commence enfin à devenir rentable.",
    "Qui veut tester un duel ?",
    "Je me suis encore fait surprendre par un boss 😅",
    "La forge me ruine mais je continue quand même.",
    "Je viens de gagner un niveau, enfin.",
  ];
  const esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  const now=()=>Date.now();
  function myProfile(){
    try{
      return {name:String(S.playerName||"Héros").slice(0,24),level:Number(S.level)||1,power:Math.max(1,Number(S.power)||Number(typeof computePower==="function"?computePower(S):1)||1),floor:Number(S.recordFloor||S.floor)||1,forge:Number(S.forge&&S.forge.level)||1,bot:false};
    }catch(_){return {name:"Héros",level:1,power:1,floor:1,forge:1,bot:false};}
  }
  function read(){try{const a=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(a)?a.slice(-MAX):[]}catch(_){return[]}}
  function write(list){try{localStorage.setItem(KEY,JSON.stringify(list.slice(-MAX)))}catch(_){}}
  function push(msg,broadcast=true){
    const list=read(); if(list.some(x=>x.id===msg.id))return;
    list.push(msg); write(list);
    if(broadcast&&channel)try{channel.postMessage(msg)}catch(_){ }
    if(!open){unread++;paintButton();} else render();
    remoteSend(msg);
  }
  async function remoteSend(msg){
    const ep=window.SHADOWREACH_SOCIAL_ENDPOINT; if(!ep)return;
    try{await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(msg)})}catch(_){ }
  }
  async function remotePull(){
    const ep=window.SHADOWREACH_SOCIAL_ENDPOINT; if(!ep)return;
    try{const r=await fetch(ep+(ep.includes("?")?"&":"?")+"since="+encodeURIComponent(now()-180000),{cache:"no-store"});if(!r.ok)return;const a=await r.json();if(Array.isArray(a))a.forEach(m=>push(m,false));}catch(_){ }
  }
  function sendText(text){
    text=String(text||"").trim().slice(0,220); if(!text)return;
    const p=myProfile(); push({id:"m"+now()+Math.random().toString(36).slice(2,7),type:"text",ts:now(),author:p.name,profile:p,text});
  }
  function botSpeak(){
    const b=bots[Math.floor(Math.random()*bots.length)],text=botLines[Math.floor(Math.random()*botLines.length)];
    push({id:"b"+now()+Math.random().toString(36).slice(2,7),type:"text",ts:now(),author:b.name,profile:b,text,bot:true});
    lastBotAt=now();
  }
  function seed(){if(read().length)return;bots.slice(0,2).forEach((b,i)=>push({id:"seed"+i,type:"text",ts:now()-((2-i)*45000),author:b.name,profile:b,text:i?"Quelqu’un veut tester l’arène ?":"Bienvenue dans le chat test 👋",bot:true},false));}
  function fmtTime(ts){try{return new Date(ts).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}catch(_){return""}}
  function injectStyle(){
    const s=document.createElement("style");s.textContent=`
#srChatBtn{position:absolute;right:12px;bottom:74px;z-index:70;width:54px;height:54px;border-radius:50%;border:2px solid #0A1020;background:linear-gradient(#5FB4F5,#1E72C8);color:white;font-weight:900;box-shadow:0 4px 0 #0A1020,0 8px 18px #0008;cursor:pointer}
#srChatBtn b{position:absolute;right:-3px;top:-5px;min-width:19px;height:19px;border-radius:10px;background:#E5484D;color:#fff;font:800 11px/19px system-ui;padding:0 5px}
#srSocial{position:absolute;inset:0;z-index:120;background:#070B13f2;display:flex;flex-direction:column;color:#EDF1FA;font-family:var(--fu,system-ui)}
#srSocial .head{padding:12px 14px;border-bottom:1px solid #2E4269;background:#101A2C;display:flex;align-items:center;gap:10px}
#srSocial .head .grow{flex:1}.srClose{border:0;background:#243553;color:#fff;border-radius:10px;padding:8px 11px;font-weight:900}
#srSocial .status{font-size:10px;color:#93A4C4}.srMessages{flex:1;overflow:auto;padding:10px 12px 88px}.srMsg{padding:9px 10px;margin:0 0 7px;border:1px solid #2E4269;border-radius:11px;background:#141F35}.srMsg.combat{border-color:#8A6522;background:#1b1a16}.srName{font-weight:900;color:#93C6FF;cursor:pointer}.srBot{font-size:9px;color:#FBDD8C;margin-left:5px}.srText{font-size:13px;margin-top:3px;line-height:1.35}.srMeta{font-size:9px;color:#6A7B9C;margin-top:4px}.srCompose{position:absolute;left:0;right:0;bottom:0;padding:9px;background:#101A2C;border-top:1px solid #2E4269;display:flex;gap:7px}.srCompose input{flex:1;min-width:0;border:1px solid #2E4269;background:#080D18;color:white;border-radius:10px;padding:10px;font-size:14px}.srCompose button,.srAction{border:0;border-radius:10px;background:#1E72C8;color:white;padding:9px 11px;font-weight:900}.srProfile{position:absolute;left:14px;right:14px;top:20%;z-index:3;background:#141F35;border:1px solid #4A6494;border-radius:14px;padding:14px;box-shadow:0 15px 50px #000}.srGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0}.srStat{background:#0B111F;border:1px solid #26344F;border-radius:9px;padding:8px;font-size:11px}.srShare{margin:0 12px 8px;padding:9px;border:1px solid #8A6522;border-radius:10px;background:#231b0c;color:#FBDD8C;font-size:11px;cursor:pointer}
`;
    document.head.appendChild(s);
  }
  function paintButton(){const b=document.getElementById("srChatBtn");if(!b)return;b.innerHTML="💬"+(unread?"<b>"+Math.min(99,unread)+"</b>":"");}
  function mountButton(){
    if(document.getElementById("srChatBtn"))return;
    const b=document.createElement("button");b.id="srChatBtn";b.type="button";b.setAttribute("aria-label","Ouvrir le chat");b.onclick=()=>{open=true;unread=0;paintButton();render();};document.getElementById("app").appendChild(b);paintButton();
  }
  function profileHTML(p){if(!p)return"";return `<div class="srProfile"><div style="display:flex;justify-content:space-between;gap:8px"><div><div style="font-weight:900;font-size:18px">${esc(p.name)}</div><div class="status">${p.bot?"BOT DE TEST":"JOUEUR"}</div></div><button class="srClose" data-sr="profileClose">✕</button></div><div class="srGrid"><div class="srStat">Niveau<br><b>${p.level||1}</b></div><div class="srStat">Puissance<br><b>${Math.round(p.power||1).toLocaleString()}</b></div><div class="srStat">Record étage<br><b>${p.floor||1}</b></div><div class="srStat">Forge<br><b>${p.forge||1}</b></div></div>${p.name!==myProfile().name?'<button class="srAction" style="width:100%" data-sr="challenge">⚔️ Défier en combat</button>':''}<div class="status" style="margin-top:8px">Le duel utilise le moteur PvP réel. Sans serveur social, le build adverse est approximé à partir de sa puissance publique.</div></div>`}
  function render(){
    let root=document.getElementById("srSocial");if(!open){if(root)root.remove();return;}
    if(!root){root=document.createElement("div");root.id="srSocial";document.getElementById("app").appendChild(root)}
    const msgs=read();const status=window.SHADOWREACH_SOCIAL_ENDPOINT?"Temps réel connecté":"Mode test local · serveur social non configuré";
    root.innerHTML=`<div class="head"><div class="grow"><div style="font-weight:900">Chat des testeurs</div><div class="status">${status}</div></div><button class="srClose" data-sr="close">✕</button></div>${lastArenaResult?'<div class="srShare" data-sr="shareLast">Partager le dernier combat dans le chat</div>':''}<div class="srMessages">${msgs.map(m=>`<div class="srMsg ${m.type==='combat'?'combat':''}"><div><span class="srName" data-sr="profile" data-id="${esc(m.id)}">${esc(m.author||"?")}</span>${m.bot?'<span class="srBot">BOT</span>':''}</div><div class="srText">${esc(m.text||"")}</div><div class="srMeta">${fmtTime(m.ts)}</div></div>`).join("")}</div><div class="srCompose"><input id="srInput" maxlength="220" placeholder="Écrire un message…"><button data-sr="send">Envoyer</button></div>${profileHTML(profileOpen)}`;
    const list=root.querySelector('.srMessages'); if(list)list.scrollTop=list.scrollHeight;
  }
  function findProfileByMessage(id){const m=read().find(x=>x.id===id);return m&&m.profile?m.profile:null}
  function startChallenge(p){
    if(!p||typeof startArenaLiveFight!=="function"||typeof arenaSimCfg!=="object")return;
    const mine=myProfile();const ratio=Math.max(50,Math.min(200,Math.round((Number(p.power)||mine.power)/Math.max(1,mine.power)*100)));
    arenaSimCfg.ratio=ratio;arenaSimCfg.build="equilibre";
    const before=typeof arenaLiveResult!=="undefined"?arenaLiveResult:null;
    if(!startArenaLiveFight())return;
    try{if(arenaLiveBot)arenaLiveBot.name=p.name;if(combat&&combat.enemies){const e=combat.enemies.find(x=>x.arenaProfile)||combat.enemies[0];if(e)e.name=p.name;}}catch(_){ }
    pendingChallenge={target:p,started:now(),before};open=false;profileOpen=null;render();
    try{toast("Duel contre "+p.name)}catch(_){ }
  }
  function shareCombat(){
    if(!lastArenaResult)return;const me=myProfile(),r=lastArenaResult,target=r.target||{name:r.bot&&r.bot.name||"Rival"};
    push({id:"fight"+now()+Math.random().toString(36).slice(2,6),type:"combat",ts:now(),author:me.name,profile:me,text:(r.won?"🏆 Victoire":"💀 Défaite")+" contre "+target.name+" · duel partagé depuis l’Arène"});
    open=true;render();
  }
  document.addEventListener("click",e=>{
    const el=e.target.closest&&e.target.closest("[data-sr]");if(!el)return;
    const a=el.dataset.sr;
    if(a==="close"){open=false;profileOpen=null;render()}
    else if(a==="send"){const i=document.getElementById("srInput");sendText(i&&i.value);if(i)i.value="";render()}
    else if(a==="profile"){profileOpen=findProfileByMessage(el.dataset.id);render()}
    else if(a==="profileClose"){profileOpen=null;render()}
    else if(a==="challenge"){startChallenge(profileOpen)}
    else if(a==="shareLast"){shareCombat()}
  });
  document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target&&e.target.id==="srInput"){e.preventDefault();sendText(e.target.value);e.target.value="";render();}});
  if(channel)channel.onmessage=e=>{if(e&&e.data)push(e.data,false)};
  window.addEventListener("storage",e=>{if(e.key===KEY&&open)render()});
  setInterval(()=>{remotePull();if(now()-lastBotAt>45000+Math.random()*90000&&Math.random()<.35)botSpeak();},15000);
  setInterval(()=>{
    if(!pendingChallenge)return;
    try{
      if(typeof arenaLiveResult!=="undefined"&&arenaLiveResult&&arenaLiveResult!==pendingChallenge.before){
        lastArenaResult={...arenaLiveResult,target:pendingChallenge.target};pendingChallenge=null;try{toast("Combat terminé · partage disponible dans le chat",true)}catch(_){ }
      }
    }catch(_){ }
  },800);
  seed();injectStyle();mountButton();remotePull();
})();
