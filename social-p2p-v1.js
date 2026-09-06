/* SHADOWREACH SOCIAL P2P V2
   Cross-device tester transport. Preserves social channels and narrow payloads. */
(() => {
  "use strict";
  const STORE="shadowreach.social.v1.messages",MAX=160,APP_ID="shadowreach-testers-social-2026-v1",ROOM_ID="shadowreach-testers-global-v1",CDN="https://esm.run/trystero@0.25.4";
  const seen=new Set();let action=null,room=null,peerCount=0,ready=false,lastSnapshot="";
  function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a.slice(-MAX):[]}catch(_){return[]}}
  function write(a){try{localStorage.setItem(STORE,JSON.stringify(a.slice(-MAX)))}catch(_){}}
  function safeChannel(v){return v==="clan"||v==="announcements"?v:"world"}
  function ingest(msg){
    if(!msg||typeof msg!=="object"||!msg.id||seen.has(msg.id))return false;
    const safe={id:String(msg.id).slice(0,80),type:msg.type==="combat"?"combat":msg.type==="announcement"?"announcement":"text",channel:safeChannel(msg.channel),ts:Math.max(0,Number(msg.ts)||Date.now()),author:String(msg.author||"?").slice(0,24),text:String(msg.text||"").slice(0,220),bot:!!msg.bot,system:!!msg.system,won:!!msg.won,target:String(msg.target||"").slice(0,24)};
    if(msg.profile&&typeof msg.profile==="object")safe.profile={name:String(msg.profile.name||safe.author).slice(0,24),level:Math.max(1,Math.min(999,Number(msg.profile.level)||1)),power:Math.max(1,Math.min(1e15,Number(msg.profile.power)||1)),floor:Math.max(1,Math.min(1e7,Number(msg.profile.floor)||1)),forge:Math.max(1,Math.min(999,Number(msg.profile.forge)||1)),bot:!!msg.profile.bot};
    const list=read();if(list.some(x=>x&&x.id===safe.id)){seen.add(safe.id);return false}list.push(safe);write(list);seen.add(safe.id);
    try{window.dispatchEvent(new StorageEvent("storage",{key:STORE,newValue:JSON.stringify(list)}))}catch(_){window.dispatchEvent(new Event("storage"))}return true;
  }
  function sendEnvelope(payload,options){if(!ready||!action)return;try{action.send(payload,options||undefined)}catch(_){}}
  function syncKnown(){const list=read();list.forEach(m=>{if(m&&m.id)seen.add(m.id)});return list}
  function broadcastNewLocal(){const list=read(),snap=list.map(m=>m&&m.id).join("|");if(snap===lastSnapshot)return;lastSnapshot=snap;for(const m of list){if(!m||!m.id||seen.has(m.id))continue;seen.add(m.id);if(!m.bot)sendEnvelope({kind:"message",message:m})}}
  function patchStatus(){const root=document.getElementById("srSocial");if(!root)return;const status=root.querySelector(".head .status");if(!status)return;status.textContent=ready?"Temps réel P2P · "+peerCount+" joueur"+(peerCount!==1?"s":"")+" connecté"+(peerCount!==1?"s":""):"Connexion au chat…"}
  function installStatusObserver(){const obs=new MutationObserver(()=>patchStatus()),app=document.getElementById("app");if(app)obs.observe(app,{childList:true,subtree:true});setInterval(patchStatus,1500)}
  async function boot(){
    syncKnown();lastSnapshot=read().map(m=>m&&m.id).join("|");installStatusObserver();
    try{const mod=await import(CDN);room=mod.joinRoom({appId:APP_ID},ROOM_ID);action=room.makeAction("shadowreach-social-message-v2");action.onMessage=payload=>{if(!payload||typeof payload!=="object")return;if(payload.kind==="message")ingest(payload.message);else if(payload.kind==="history"&&Array.isArray(payload.messages))payload.messages.slice(-60).forEach(ingest)};room.onPeerJoin=peerId=>{peerCount++;ready=true;patchStatus();const history=read().filter(m=>m&&!m.bot).slice(-60);sendEnvelope({kind:"history",messages:history},{target:peerId})};room.onPeerLeave=()=>{peerCount=Math.max(0,peerCount-1);patchStatus()};ready=true;patchStatus()}
    catch(err){ready=false;console.warn("Shadowreach P2P social unavailable; local chat remains active.",err);patchStatus()}
  }
  setInterval(broadcastNewLocal,350);window.addEventListener("storage",e=>{if(!e||e.key===STORE)broadcastNewLocal()});window.addEventListener("beforeunload",()=>{try{if(room)room.leave()}catch(_){}});boot();
})();