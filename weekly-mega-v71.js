// MEGA_REWARDS_V329
(function(){
  'use strict';

  const UNLOCK_LEVEL=18;
  const STATE_VERSION=329;
  const MILESTONES={
    1:{level:1,rarity:'COMMUN',pieces:5,mins:1,qty:5},
    5:{level:5,rarity:'COMMUN',pieces:10,mins:1,qty:5},
    10:{level:10,rarity:'RARE',pieces:5,mins:5,qty:5},
    15:{level:15,rarity:'RARE',pieces:10,mins:5,qty:5},
    20:{level:20,rarity:'EPIQUE',pieces:4,mins:10,qty:10},
    30:{level:30,rarity:'MYTHIQUE',pieces:1,mins:10,qty:15},
    40:{level:40,rarity:'ARTEFACT',pieces:1,mins:20,qty:15},
    45:{level:45,rarity:'ARTEFACT',pieces:2,mins:20,qty:20},
    50:{level:50,rarity:'LEGENDAIRE',pieces:1,mins:20,qty:20}
  };
  const LEVELS=Object.keys(MILESTONES).map(Number).sort(function(a,b){return a-b;});
  const RESERVE_ORDER=['LEGENDAIRE','ARTEFACT','MYTHIQUE','EPIQUE','RARE','COMMUN'];
  const RARITY_NAMES={COMMUN:'Commun',RARE:'Rare',EPIQUE:'Épique',MYTHIQUE:'Mythique',ARTEFACT:'Artefact',LEGENDAIRE:'Légendaire'};

  function stateReady(){return typeof S!=='undefined'&&S&&typeof S==='object';}
  function hasMegaHistory(s){return !!(s&&s.megaBossClears&&Object.keys(s.megaBossClears).some(function(k){return !!s.megaBossClears[k];}));}
  function levelForFloor(floor){return typeof megaLevelForFloor==='function'?megaLevelForFloor(Number(floor)):Math.max(1,Math.floor(Number(floor)/10));}
  function reward(level){const r=MILESTONES[Number(level)];return r?Object.assign({},r):null;}
  function isMilestoneClearedFor(s,level){
    const clears=s&&s.megaBossClears&&typeof s.megaBossClears==='object'?s.megaBossClears:{};
    return Object.keys(clears).some(function(f){return !!clears[f]&&levelForFloor(f)===Number(level);});
  }
  function bestMilestoneFor(s){let best=0;LEVELS.forEach(function(level){if(isMilestoneClearedFor(s,level))best=level;});return best;}
  function highest(){return stateReady()?bestMilestoneFor(S):0;}

  function weekEpoch(now){
    const d=new Date(now==null?Date.now():now),day=d.getDay(),back=(day+6)%7;
    const m=new Date(d.getFullYear(),d.getMonth(),d.getDate()-back,2,0,0,0);
    if(d<m)m.setDate(m.getDate()-7);
    return m.getTime();
  }
  function nextMonday(now){const d=new Date(weekEpoch(now));d.setDate(d.getDate()+7);return d;}

  function ensureAccelDefs(){
    if(typeof ACCEL_DEFS==='undefined'||!Array.isArray(ACCEL_DEFS))return;
    if(!ACCEL_DEFS.some(function(x){return Number(x.mins)===10;}))ACCEL_DEFS.push({key:'a10',mins:10,label:'10 min'});
    if(!ACCEL_DEFS.some(function(x){return Number(x.mins)===20;}))ACCEL_DEFS.push({key:'a20',mins:20,label:'20 min'});
    ACCEL_DEFS.sort(function(a,b){return Number(a.mins)-Number(b.mins);});
  }
  function accelDef(mins){ensureAccelDefs();return typeof ACCEL_DEFS!=='undefined'&&ACCEL_DEFS.find(function(x){return Number(x.mins)===Number(mins);});}

  function ensure(){
    if(!stateReady())return null;
    ensureAccelDefs();
    if(!S.megaWeekly||typeof S.megaWeekly!=='object')S.megaWeekly={lastEpoch:hasMegaHistory(S)?0:weekEpoch(),lastLevel:0,lastReward:null};
    const w=S.megaWeekly;
    if(!w.unlockedAt||typeof w.unlockedAt!=='object')w.unlockedAt={};
    LEVELS.forEach(function(level){if(isMilestoneClearedFor(S,level)&&w.unlockedAt[String(level)]==null)w.unlockedAt[String(level)]=0;});
    w.rewardStateVersion=STATE_VERSION;
    if(!S.sanctuary||typeof S.sanctuary!=='object')S.sanctuary={};
    if(!Array.isArray(S.sanctuary.mergeBoard))S.sanctuary.mergeBoard=Array(typeof SANCT_BOARD_SIZE==='number'?SANCT_BOARD_SIZE:16).fill(null);
    if(!S.sanctuary.weeklyReserve||typeof S.sanctuary.weeklyReserve!=='object')S.sanctuary.weeklyReserve={};
    RESERVE_ORDER.forEach(function(r){S.sanctuary.weeklyReserve[r]=Math.max(0,Number(S.sanctuary.weeklyReserve[r])||0);});
    if(!S.accels||typeof S.accels!=='object')S.accels={};
    return w;
  }

  function placeReserve(){
    if(!ensure())return {placed:0,left:0};
    const st=S.sanctuary,b=st.mergeBoard;let placed=0,left=0;
    RESERVE_ORDER.forEach(function(rarity){
      let n=Math.max(0,Number(st.weeklyReserve[rarity])||0)|0;
      for(let i=0;i<b.length&&n>0;i++)if(!b[i]){b[i]=rarity;n--;placed++;}
      st.weeklyReserve[rarity]=n;left+=n;
    });
    return {placed:placed,left:left};
  }
  function reserveTotal(){if(!ensure())return 0;return RESERVE_ORDER.reduce(function(n,r){return n+(Number(S.sanctuary.weeklyReserve[r])||0);},0);}

  function rewardText(r){
    if(!r)return '';
    const base=RARITY_NAMES[r.rarity]||r.rarity;
    const plural={Commun:'Communs',Rare:'Rares','Épique':'Épiques',Mythique:'Mythiques',Artefact:'Artefacts','Légendaire':'Légendaires'};
    const pieceLabel=r.pieces>1?(plural[base]||base+'s'):base;
    return r.pieces+' fragments '+pieceLabel+' de fusion + '+r.qty+'× '+r.mins+' min';
  }
  function grantReward(r,source){
    if(!r||!ensure())return null;
    S.sanctuary.weeklyReserve[r.rarity]=(Number(S.sanctuary.weeklyReserve[r.rarity])||0)+r.pieces;
    const placement=placeReserve(),def=accelDef(r.mins);
    if(def)S.accels[def.key]=(Number(S.accels[def.key])||0)+r.qty;
    const out={level:r.level,rarity:r.rarity,pieces:r.pieces,accelMins:r.mins,accelQty:r.qty,placed:placement.placed,reserve:placement.left,source:source||'weekly',at:Date.now()};
    if(typeof saveNow==='function')saveNow();
    if(typeof scheduleRender==='function')scheduleRender();
    return out;
  }

  function bestWeeklyMilestone(epoch){
    const w=ensure();if(!w)return 0;
    let best=0;
    LEVELS.forEach(function(level){
      if(!isMilestoneClearedFor(S,level))return;
      const at=w.unlockedAt[String(level)];
      if(at==null||Number(at)<=Number(epoch))best=level;
    });
    return best;
  }
  function grant(now){
    const w=ensure();if(!w)return false;
    const ep=weekEpoch(now),lv=bestWeeklyMilestone(ep);
    if(!lv||Number(w.lastEpoch||0)>=ep)return false;
    const r=reward(lv),paid=grantReward(r,'weekly');
    if(!paid)return false;
    w.lastEpoch=ep;w.lastLevel=lv;w.lastReward=paid;
    if(typeof saveNow==='function')saveNow();
    try{if(typeof toast==='function')toast('Récompense hebdomadaire · Palier Méga '+lv+' · '+rewardText(r),true);}catch(_){ }
    return true;
  }

  function recoverDirectBossRewards(){
    if(!ensure()||S.megaDirectAccelRecoveryV329)return false;
    const clears=S.megaBossClears&&typeof S.megaBossClears==='object'?S.megaBossClears:{};
    let count=0;
    Object.keys(clears).forEach(function(f){
      if(!clears[f]||typeof megaAccelReward!=='function')return;
      const a=megaAccelReward(Number(f));
      if(!a||!a.key||!a.qty)return;
      S.accels[a.key]=(Number(S.accels[a.key])||0)+Number(a.qty);
      count+=Number(a.qty)||0;
    });
    S.megaDirectAccelRecoveryV329={done:true,at:Date.now(),count:count};
    if(typeof saveNow==='function')saveNow();
    if(count&&typeof toast==='function')toast('Récompenses directes Méga régularisées · '+count+' accélérateur'+(count>1?'s':''),true);
    return count>0;
  }

  function installUnlockPolicy(){
    if(typeof megaRaidUnlocked!=='function'||megaRaidUnlocked.__srV329)return;
    const previous=megaRaidUnlocked;
    megaRaidUnlocked=function(s){return !!(s&&((Number(s.level)||0)>=UNLOCK_LEVEL||hasMegaHistory(s)));};
    megaRaidUnlocked.__srV329=true;megaRaidUnlocked.__srPrevious=previous;
  }
  function retireAppleOnly(){try{if(typeof megaAppleFirstClearReward==='function')megaAppleFirstClearReward=function(){return 0;};}catch(_){ }}
  function installMegaCopy(){
    if(typeof scrMegaRaid!=='function'||scrMegaRaid.__srV329)return;
    const previous=scrMegaRaid;
    scrMegaRaid=function(){
      let h=String(previous.apply(this,arguments)||'');
      h=h.replace(/La première victoire donne(?: les Pommes et)? 2× les accélérateurs de ce Boss normal\./gi,'Boss vaincu : récompense directe encaissée immédiatement. Les paliers cochés servent uniquement à la récompense hebdomadaire du lundi à 02:00.');
      return h;
    };
    scrMegaRaid.__srV329=true;scrMegaRaid.__srPrevious=previous;
    try{if(typeof SCREENS!=='undefined'&&SCREENS)SCREENS.mega=scrMegaRaid;}catch(_){ }
  }

  function row(level){
    const r=reward(level),unlocked=isMilestoneClearedFor(S,level);
    return '<div style="display:grid;grid-template-columns:44px 1fr auto;gap:6px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06)"><b style="color:'+(unlocked?'#84E891':'#6A7B9C')+'">'+(unlocked?'✓':'○')+' '+level+'</b><span style="font-size:11px;color:#C9D4E6">'+r.pieces+' fragments '+(RARITY_NAMES[r.rarity]||r.rarity)+'</span><span style="font-size:11px;color:#8FEFF4">'+r.qty+'× '+r.mins+' min</span></div>';
  }
  function buildBox(){
    const lv=highest(),r=lv?reward(lv):null,reserve=reserveTotal(),next=nextMonday(),box=document.createElement('div');
    box.id='megaWeeklyV117';box.className='card frame mt8';box.style.borderLeftColor='#3FCFD6';
    const rows=LEVELS.map(row).join('');
    box.innerHTML='<div class="between"><div><div class="bb small">Paliers hebdomadaires Méga Boss</div><div class="mute tiny b">Cases cochées : versement chaque lundi à 02:00 · indépendant des récompenses directes de victoire</div></div><span class="pill" style="color:#84E891;border-color:#3FB950">'+(lv?'Palier '+lv:'Niv. '+UNLOCK_LEVEL)+'</span></div>'+
      (r?'<div class="notice mt8 tiny"><b>Meilleur palier coché :</b> '+rewardText(r)+'<br><span class="mute">Prochain versement : '+next.toLocaleString('fr-FR',{weekday:'long',hour:'2-digit',minute:'2-digit'})+'</span></div>':'<div class="notice mt8 tiny">Débloqué au niveau personnage '+UNLOCK_LEVEL+'. Bats les Méga Boss pour cocher les paliers.</div>')+
      (reserve?'<button id="megaWeeklyPlaceV117" class="btn small mt8" style="width:100%">Placer '+reserve+' fragment'+(reserve>1?'s':'')+' en réserve</button>':'')+
      '<details class="mt8" open><summary class="b small" style="cursor:pointer">Paliers hebdomadaires</summary><div class="mt6">'+rows+'</div></details>';
    const b=box.querySelector('#megaWeeklyPlaceV117');if(b)b.addEventListener('click',function(){const n=placeReserve();if(n.placed&&typeof saveNow==='function')saveNow();if(typeof render==='function')render();});
    return box;
  }
  function inject(){const screen=document.getElementById('screen');if(!screen||!stateReady())return;const title=screen.textContent||'';if(!/méga[ -]?boss/i.test(title)&&title.indexOf('MÉGA')<0)return;if(screen.querySelector('#megaWeeklyV117'))return;const pad=screen.querySelector('.pad');if(!pad)return;const y=window.scrollY||document.documentElement.scrollTop||0;pad.appendChild(buildBox());if((window.scrollY||document.documentElement.scrollTop||0)!==y)window.scrollTo(0,y);}
  function queueInject(){requestAnimationFrame(inject);}
  window.addEventListener('sr:bottomnavrendered',queueInject);

  function install(){installUnlockPolicy();retireAppleOnly();ensureAccelDefs();}
  function boot(){if(!stateReady()){setTimeout(boot,150);return;}install();ensure();recoverDirectBossRewards();installMegaCopy();grant();inject();setInterval(grant,60000);}

  window.__srMegaRewardsV318={unlockLevel:UNLOCK_LEVEL,levels:LEVELS.slice(),reward:reward,bestMilestoneFor:bestMilestoneFor,bestWeeklyMilestone:bestWeeklyMilestone,weekEpoch:weekEpoch,grantWeeklyAt:grant,grantReward:grantReward,rewardText:rewardText,placeReserve:placeReserve};
  window.__srMegaRewardsV329=window.__srMegaRewardsV318;
  if(stateReady()){install();ensure();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,150);},{once:true});else setTimeout(boot,150);
})();