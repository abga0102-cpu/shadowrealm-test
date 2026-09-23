/* SHADOWREACH V341/V433 · Non-destructive save recovery center
   Scans same-origin localStorage for plausible Shadowreach saves, including
   V340 rotating backups. Never restores automatically. Every candidate can be
   exported first; restore requires explicit confirmation and snapshots the
   currently active save before replacement. */
(function(){
  'use strict';
  if(window.__srSaveRecoveryV341)return;

  var MAIN_KEY='shadowreach.save.local';
  var BACKUP_PREFIX='shadowreach.save.backup.v340.';
  var RESCUE_KEY='shadowreach.save.rescue.v430';
  var BUILD='V433';
  var BUTTON_ID='srSaveRecoveryButtonV341';
  var PANEL_ID='srSaveRecoveryPanelV341';
  var FORCE_RECOVERY=/(?:^|[?&])recovery=1(?:&|$)/.test(location.search);
  var STARTUP_INTEGRITY_POWER=integrityPower();

  function num(v,fallback){
    var n=Number(v);
    return isFinite(n)?n:(fallback==null?0:fallback);
  }

  function parse(raw){
    if(!raw||typeof raw!=='string')return null;
    try{
      var value=JSON.parse(raw);
      return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
    }catch(_){return null;}
  }

  function looksLikeSave(s){
    if(!s)return false;
    var score=0;
    if(typeof s.playerName==='string')score++;
    if(isFinite(Number(s.level)))score++;
    if(s.stats&&typeof s.stats==='object')score++;
    if(Array.isArray(s.inventory))score++;
    if(s.equipped&&typeof s.equipped==='object')score++;
    if(s.raids&&typeof s.raids==='object')score++;
    if(isFinite(Number(s.gold)))score++;
    if(isFinite(Number(s.exp)))score++;
    if(isFinite(Number(s.recordFloor))||isFinite(Number(s.floor)))score++;
    return score>=5;
  }

  function summarize(key,raw,s,source){
    var record=Math.max(1,Math.floor(num(s.recordFloor,num(s.floor,1))));
    var floor=Math.max(1,Math.floor(num(s.floor,record)));
    var level=Math.max(1,Math.floor(num(s.level,1)));
    var power=Math.max(0,Math.floor(num(s.power,0)));
    var inventory=Array.isArray(s.inventory)?s.inventory.length:0;
    var pets=Array.isArray(s.pets)?s.pets.length:0;
    var skills=Array.isArray(s.skills)?s.skills.length:0;
    var lastSeen=Math.max(0,Math.floor(num(s.lastSeen,0)));
    return {
      key:key,raw:raw,state:s,source:source||'localStorage',
      recordFloor:record,floor:floor,level:level,power:power,
      inventory:inventory,pets:pets,skills:skills,lastSeen:lastSeen,
      name:String(s.playerName||'Héros').slice(0,40)
    };
  }

  function scan(){
    var out=[];
    try{
      for(var i=0;i<localStorage.length;i++){
        var key=localStorage.key(i);
        if(!key)continue;
        var raw=localStorage.getItem(key);
        var s=parse(raw);
        if(!looksLikeSave(s))continue;
        var source=key===MAIN_KEY?'active':(key===RESCUE_KEY?'rescue-v430':(key.indexOf(BACKUP_PREFIX)===0?'backup-v340':'legacy-local'));
        out.push(summarize(key,raw,s,source));
      }
    }catch(_){ }
    out.sort(function(a,b){
      if(a.key===MAIN_KEY)return -1;
      if(b.key===MAIN_KEY)return 1;
      return (b.recordFloor-a.recordFloor)||(b.level-a.level)||(b.power-a.power)||(b.lastSeen-a.lastSeen);
    });
    return out;
  }

  function activeOf(list){
    for(var i=0;i<list.length;i++)if(list[i].key===MAIN_KEY)return list[i];
    return null;
  }

  function integrityPower(){
    try{
      var snapshot=parse(localStorage.getItem('shadowreach.power.sources.v256'));
      return snapshot?Math.max(0,num(snapshot.power,0)):0;
    }catch(_){return 0;}
  }

  function suspiciousReset(active){
    if(!active)return false;
    return active.level<=3&&active.recordFloor<=2&&Math.max(active.power,STARTUP_INTEGRITY_POWER,integrityPower())>=1000;
  }

  function aheadOf(candidate,active){
    if(!candidate||candidate.key===MAIN_KEY)return false;
    if(!active)return true;
    if(candidate.raw===active.raw)return false;
    if(candidate.recordFloor!==active.recordFloor)return candidate.recordFloor>active.recordFloor;
    if(candidate.level!==active.level)return candidate.level>active.level;
    if(candidate.power!==active.power)return candidate.power>active.power*1.05;
    if(candidate.inventory!==active.inventory)return candidate.inventory>active.inventory;
    if(candidate.pets!==active.pets)return candidate.pets>active.pets;
    return false;
  }

  function bestAhead(list,active){
    var best=null;
    for(var i=0;i<list.length;i++){
      var c=list[i];
      if(!aheadOf(c,active))continue;
      if(!best||c.recordFloor>best.recordFloor||
        (c.recordFloor===best.recordFloor&&c.level>best.level)||
        (c.recordFloor===best.recordFloor&&c.level===best.level&&c.power>best.power)||
        (c.recordFloor===best.recordFloor&&c.level===best.level&&c.power===best.power&&c.lastSeen>best.lastSeen))best=c;
    }
    return best;
  }

  /* Pin the strongest older state before the five rotating slots can evict it.
     The rescue key is never rotated and is replaced only by a stronger state. */
  function pinBest(){
    try{
      var list=scan(),active=activeOf(list),candidate=bestAhead(list,active);
      if(!candidate)return null;
      var pinned=null;
      for(var i=0;i<list.length;i++)if(list[i].key===RESCUE_KEY){pinned=list[i];break;}
      var replace=!pinned||candidate.recordFloor>pinned.recordFloor||
        (candidate.recordFloor===pinned.recordFloor&&candidate.level>pinned.level)||
        (candidate.recordFloor===pinned.recordFloor&&candidate.level===pinned.level&&candidate.power>pinned.power);
      if(replace&&candidate.key!==RESCUE_KEY){
        localStorage.setItem(RESCUE_KEY,candidate.raw);
        return summarize(RESCUE_KEY,candidate.raw,candidate.state,'rescue-v430');
      }
      return pinned||candidate;
    }catch(_){return null;}
  }

  function dateLabel(ms){
    if(!ms)return 'date inconnue';
    try{return new Date(ms).toLocaleString('fr-FR');}catch(_){return 'date inconnue';}
  }

  function safeName(s){return String(s||'save').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,42)||'save';}

  function exportCandidate(key){
    var list=scan(),candidate=null;
    for(var i=0;i<list.length;i++)if(list[i].key===key){candidate=list[i];break;}
    if(!candidate)return false;
    try{
      var blob=new Blob([JSON.stringify(candidate.state,null,2)],{type:'application/json'});
      var a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='shadowreach-recovery-'+safeName(candidate.name)+'-floor-'+candidate.recordFloor+'.json';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){try{URL.revokeObjectURL(a.href);}catch(_){}},1000);
      return true;
    }catch(_){return false;}
  }

  function exportAllLocalData(){
    try{
      var entries={};
      for(var i=0;i<localStorage.length;i++){
        var key=localStorage.key(i);
        if(key&&key.indexOf('shadowreach.')===0)entries[key]=localStorage.getItem(key);
      }
      var payload={
        format:'shadowreach-local-diagnostic-v433',
        exportedAt:new Date().toISOString(),
        build:BUILD,
        entries:entries
      };
      var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      var a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='shadowreach-diagnostic-complet-'+Date.now()+'.json';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){try{URL.revokeObjectURL(a.href);}catch(_){}},1000);
      return true;
    }catch(_){return false;}
  }

  function isAncestralPet(p){
    return !!(p&&typeof p==='object'&&String(p.rarity||p.grade||p.rank||'').toUpperCase()==='ANCESTRAL');
  }

  function preserveAncestralPets(nextState,currentState){
    var next=parse(JSON.stringify(nextState))||nextState;
    if(!next||typeof next!=='object')return nextState;
    if(!Array.isArray(next.pets))next.pets=[];
    var keep=[];
    if(currentState&&Array.isArray(currentState.pets))keep=keep.concat(currentState.pets.filter(isAncestralPet));
    try{
      var pinned=parse(localStorage.getItem('shadowreach.familiar.ancestral.v433'));
      if(pinned&&Array.isArray(pinned.pets))keep=keep.concat(pinned.pets.filter(isAncestralPet));
    }catch(_){}
    var ids={};
    next.pets.forEach(function(p){if(p&&p.id!=null)ids[String(p.id)]=true;});
    keep.forEach(function(p){
      if(!p)return;
      var id=p.id!=null?String(p.id):'ancestral-'+String(p.species||p.name||'pet');
      if(ids[id])return;
      try{next.pets.push(JSON.parse(JSON.stringify(p)));ids[id]=true;}catch(_){}
    });
    var currentActive=currentState&&currentState.activePetId;
    if(currentActive&&next.pets.some(function(p){return p&&String(p.id)===String(currentActive)&&isAncestralPet(p);}))next.activePetId=currentActive;
    return next;
  }

  function restoreCandidate(key){
    var list=scan(),candidate=null;
    for(var i=0;i<list.length;i++)if(list[i].key===key){candidate=list[i];break;}
    if(!candidate||candidate.key===MAIN_KEY)return false;
    var active=activeOf(list);
    var msg='Restaurer cette sauvegarde ?\n\n'+
      candidate.name+' · record '+candidate.recordFloor+' · niveau '+candidate.level+'\n'+
      'Dernière activité : '+dateLabel(candidate.lastSeen)+'\n\n'+
      'La sauvegarde actuelle sera conservée dans les sauvegardes de secours avant le remplacement.';
    if(!window.confirm(msg))return false;
    try{
      if(window.__srSaveSafetyV340&&typeof window.__srSaveSafetyV340.snapshot==='function'){
        window.__srSaveSafetyV340.snapshot(active&&active.raw);
      }
      var restoredState=preserveAncestralPets(candidate.state,active&&active.state);
      localStorage.setItem(MAIN_KEY,JSON.stringify(restoredState));
      location.reload();
      return true;
    }catch(_){return false;}
  }

  function esc(s){return String(s).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function sourceLabel(c){
    if(c.source==='active')return 'Actuelle';
    if(c.source==='rescue-v430')return 'Copie protégée V430';
    if(c.source==='backup-v340')return 'Secours V340';
    return 'Ancienne copie locale';
  }

  function closePanel(){var p=document.getElementById(PANEL_ID);if(p)p.remove();}

  function openPanel(){
    closePanel();
    var list=scan(),active=activeOf(list);
    var overlay=document.createElement('div');
    overlay.id=PANEL_ID;
    overlay.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(3,7,14,.88);display:flex;align-items:flex-end;justify-content:center;padding:12px;box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#fff';
    var box=document.createElement('div');
    box.style.cssText='width:min(680px,100%);max-height:88vh;overflow:auto;background:#111827;border:1px solid #334155;border-radius:18px;padding:16px;box-sizing:border-box;box-shadow:0 20px 70px rgba(0,0,0,.5)';
    var guard=window.__srSaveLoadGuardV430||{};
    var html='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><div><div style="font-size:18px;font-weight:900">Récupération de sauvegarde</div><div style="font-size:12px;color:#94a3b8;margin-top:3px">'+BUILD+' · restauration uniquement après confirmation</div></div><button data-sr-close style="border:0;border-radius:10px;padding:8px 11px;background:#243044;color:#fff;font-weight:800">Fermer</button></div>';
    if(guard.blocked)html+='<div style="margin-top:12px;padding:11px;border-radius:11px;background:#3a1d22;border:1px solid #d45b68;color:#ffd7dc;font-size:12px;line-height:1.45"><b>Protection active :</b> le chargement principal a échoué. Les sauvegardes automatiques sont bloquées pour éviter d’écraser ton ancienne partie.</div>';
    html+='<button data-sr-export-all style="width:100%;margin-top:12px;border:1px solid #60a5fa;border-radius:11px;padding:11px;background:#17365f;color:#fff;font-weight:900">Exporter toutes les données locales</button>'+
      '<div style="margin-top:6px;font-size:11px;color:#94a3b8;line-height:1.4">Ce fichier permet de rechercher les fragments de progression, d’équipement et de familiers encore présents sur cet appareil.</div>';
    if(!list.length){
      html+='<div style="margin-top:14px;padding:14px;border-radius:12px;background:#182234;color:#cbd5e1">Aucune sauvegarde Shadow exploitable trouvée dans le stockage de ce navigateur.</div>';
    }else{
      html+='<div style="margin-top:12px;font-size:12px;line-height:1.45;color:#cbd5e1">Compare les records avant toute restauration. Tu peux exporter une copie en JSON sans modifier la partie actuelle.</div>';
      for(var i=0;i<list.length;i++){
        var c=list[i],better=aheadOf(c,active),same=active&&c.raw===active.raw&&c.key!==MAIN_KEY;
        html+='<div style="margin-top:10px;padding:12px;border-radius:13px;background:#172033;border:1px solid '+(better?'#3fb950':'#2b3a52')+'">'+
          '<div style="display:flex;justify-content:space-between;gap:8px"><div style="font-weight:900">'+esc(sourceLabel(c))+(better?' · progression supérieure détectée':'')+'</div><div style="font-size:11px;color:#94a3b8">'+esc(c.key)+'</div></div>'+
          '<div style="margin-top:7px;font-size:13px"><b>'+esc(c.name)+'</b> · record <b>'+c.recordFloor+'</b> · étage '+c.floor+' · niveau '+c.level+'</div>'+
          '<div style="margin-top:4px;font-size:12px;color:#aebbd0">Puissance '+c.power.toLocaleString('fr-FR')+' · équipement '+c.inventory+' · familiers '+c.pets+' · '+esc(dateLabel(c.lastSeen))+(same?' · copie identique à l’actuelle':'')+'</div>'+
          '<div style="display:flex;gap:8px;margin-top:10px"><button data-sr-export="'+esc(c.key)+'" style="flex:1;border:1px solid #3b4d68;border-radius:10px;padding:8px;background:#202c40;color:#fff;font-weight:800">Exporter</button>'+
          (c.key===MAIN_KEY?'':'<button data-sr-restore="'+esc(c.key)+'" style="flex:1;border:0;border-radius:10px;padding:8px;background:'+(better?'#238636':'#334155')+';color:#fff;font-weight:900">Restaurer</button>')+'</div></div>';
      }
    }
    box.innerHTML=html;overlay.appendChild(box);document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){
      var t=e.target;
      if(t===overlay||t.hasAttribute('data-sr-close')){closePanel();return;}
      if(t.hasAttribute&&t.hasAttribute('data-sr-export-all')){exportAllLocalData();return;}
      var ex=t.getAttribute&&t.getAttribute('data-sr-export');if(ex){exportCandidate(ex);return;}
      var rs=t.getAttribute&&t.getAttribute('data-sr-restore');if(rs){restoreCandidate(rs);}
    });
  }

  function mountButton(){
    var old=document.getElementById(BUTTON_ID);
    if(old&&old.parentNode)old.parentNode.removeChild(old);
    var list=scan(),active=activeOf(list),better=bestAhead(list,active);
    var guard=window.__srSaveLoadGuardV430||{};
    var button=document.createElement('button');
    button.id=BUTTON_ID;
    button.type='button';
    button.textContent=better?'⚠ Récupérer mon ancienne partie':((guard.blocked||suspiciousReset(active))?'⚠ Vérifier l’ancienne partie':'Sauvegardes locales');
    button.style.cssText='position:fixed;z-index:99998;left:12px;right:12px;top:calc(env(safe-area-inset-top) + 112px);margin:auto;max-width:520px;border:1px solid #ffd166;border-radius:13px;padding:11px 14px;background:linear-gradient(180deg,#62430e,#3f2908);color:#fff7d6;font:900 13px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.45);letter-spacing:.1px';
    button.addEventListener('click',openPanel);
    document.body.appendChild(button);
  }

  window.__srSaveRecoveryV341={scan:scan,open:openPanel,exportCandidate:exportCandidate,exportAllLocalData:exportAllLocalData,restoreCandidate:restoreCandidate,aheadOf:aheadOf,pinBest:pinBest,rescueKey:RESCUE_KEY};
  if(typeof SMOKE!=='undefined'&&SMOKE)return;
  pinBest();
  function mountRecovery(){
    mountButton();
    var list=scan(),active=activeOf(list);
    if(FORCE_RECOVERY||suspiciousReset(active))openPanel();
  }
  if(document.readyState==='complete')setTimeout(mountRecovery,0);
  else window.addEventListener('load',function(){setTimeout(mountRecovery,0);},{once:true});
})();
