/* SHADOWREACH V340/V341 · Local save safety and recovery
   Canonical owner for rotating local snapshots plus explicit, non-destructive
   recovery. Loaded after game-5 so canonical boot has already restored S.
   Recovery never replaces the active save automatically. */
(function(){
  'use strict';
  if(window.__srSaveSafetyV340)return;

  var SAVE_KEY='shadowreach.save.local';
  var BACKUP_PREFIX='shadowreach.save.backup.v340.';
  var PREIMPORT_KEY='shadowreach.save.preimport.v207';
  var BACKUP_SLOTS=5;
  var BUTTON_ID='srSaveRecoveryButtonV341';
  var PANEL_ID='srSaveRecoveryPanelV341';

  function validRaw(raw){
    if(!raw||typeof raw!=='string')return false;
    try{
      var parsed=JSON.parse(raw);
      return !!(parsed&&typeof parsed==='object'&&!Array.isArray(parsed));
    }catch(_){return false;}
  }

  function parse(raw){
    if(!validRaw(raw))return null;
    try{return JSON.parse(raw);}catch(_){return null;}
  }

  function snapshot(raw){
    try{
      raw=typeof raw==='string'?raw:localStorage.getItem(SAVE_KEY);
      if(!validRaw(raw))return false;
      if(localStorage.getItem(BACKUP_PREFIX+'1')===raw)return true;
      for(var i=BACKUP_SLOTS;i>=2;i--){
        var previous=localStorage.getItem(BACKUP_PREFIX+(i-1));
        if(previous)localStorage.setItem(BACKUP_PREFIX+i,previous);
        else localStorage.removeItem(BACKUP_PREFIX+i);
      }
      localStorage.setItem(BACKUP_PREFIX+'1',raw);
      return true;
    }catch(_){return false;}
  }

  function restore(slot){
    slot=Math.max(1,Math.min(BACKUP_SLOTS,Math.floor(Number(slot)||1)));
    try{
      var raw=localStorage.getItem(BACKUP_PREFIX+slot);
      if(!validRaw(raw))return false;
      localStorage.setItem(SAVE_KEY,raw);
      location.reload();
      return true;
    }catch(_){return false;}
  }

  function num(v,fallback){
    var n=Number(v);
    return isFinite(n)?n:(fallback==null?0:fallback);
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
    return {
      key:key,
      raw:raw,
      state:s,
      source:source||'localStorage',
      recordFloor:record,
      floor:floor,
      level:level,
      power:power,
      inventory:Array.isArray(s.inventory)?s.inventory.length:0,
      pets:Array.isArray(s.pets)?s.pets.length:0,
      skills:Array.isArray(s.skills)?s.skills.length:0,
      lastSeen:Math.max(0,Math.floor(num(s.lastSeen,0))),
      name:String(s.playerName||'Héros').slice(0,40)
    };
  }

  function sourceForKey(key){
    if(key===SAVE_KEY)return 'active';
    if(key===PREIMPORT_KEY)return 'pre-import';
    if(key.indexOf(BACKUP_PREFIX)===0)return 'backup-v340';
    return 'legacy-local';
  }

  function scan(){
    var out=[];
    try{
      for(var i=0;i<localStorage.length;i++){
        var key=localStorage.key(i);
        if(!key)continue;
        var raw=localStorage.getItem(key);
        var state=parse(raw);
        if(!looksLikeSave(state))continue;
        out.push(summarize(key,raw,state,sourceForKey(key)));
      }
    }catch(_){ }
    out.sort(function(a,b){
      if(a.key===SAVE_KEY)return -1;
      if(b.key===SAVE_KEY)return 1;
      return (b.recordFloor-a.recordFloor)||(b.level-a.level)||(b.power-a.power)||(b.lastSeen-a.lastSeen);
    });
    return out;
  }

  function activeOf(list){
    for(var i=0;i<list.length;i++)if(list[i].key===SAVE_KEY)return list[i];
    return null;
  }

  function aheadOf(candidate,active){
    if(!candidate||candidate.key===SAVE_KEY)return false;
    if(!active)return true;
    if(candidate.raw===active.raw)return false;
    if(candidate.recordFloor!==active.recordFloor)return candidate.recordFloor>active.recordFloor;
    if(candidate.level!==active.level)return candidate.level>active.level;
    if(candidate.power!==active.power)return candidate.power>active.power*1.05;
    if(candidate.inventory!==active.inventory)return candidate.inventory>active.inventory;
    if(candidate.pets!==active.pets)return candidate.pets>active.pets;
    return false;
  }

  function findCandidate(key){
    var list=scan();
    for(var i=0;i<list.length;i++)if(list[i].key===key)return {candidate:list[i],list:list};
    return {candidate:null,list:list};
  }

  function dateLabel(ms){
    if(!ms)return 'date inconnue';
    try{return new Date(ms).toLocaleString('fr-FR');}catch(_){return 'date inconnue';}
  }

  function safeName(s){
    return String(s||'save').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,42)||'save';
  }

  function exportCandidate(key){
    var found=findCandidate(key),candidate=found.candidate;
    if(!candidate)return false;
    try{
      var blob=new Blob([JSON.stringify(candidate.state,null,2)],{type:'application/json'});
      var a=document.createElement('a');
      var href=URL.createObjectURL(blob);
      a.href=href;
      a.download='shadowreach-recovery-'+safeName(candidate.name)+'-floor-'+candidate.recordFloor+'.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function(){try{URL.revokeObjectURL(href);}catch(_){}},1000);
      return true;
    }catch(_){return false;}
  }

  function restoreCandidate(key){
    var found=findCandidate(key),candidate=found.candidate;
    if(!candidate||candidate.key===SAVE_KEY)return false;
    var active=activeOf(found.list);
    var msg='Restaurer cette sauvegarde ?\n\n'+
      candidate.name+' · record '+candidate.recordFloor+' · niveau '+candidate.level+'\n'+
      'Dernière activité : '+dateLabel(candidate.lastSeen)+'\n\n'+
      'La sauvegarde actuelle sera conservée dans les sauvegardes de secours avant le remplacement.';
    if(!window.confirm(msg))return false;
    try{
      if(active&&active.raw)snapshot(active.raw);
      localStorage.setItem(SAVE_KEY,candidate.raw);
      location.reload();
      return true;
    }catch(_){return false;}
  }

  function esc(s){
    return String(s).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function sourceLabel(c){
    if(c.source==='active')return 'Actuelle';
    if(c.source==='backup-v340')return 'Secours V340';
    if(c.source==='pre-import')return 'Avant import';
    return 'Ancienne copie locale';
  }

  function closeRecovery(){
    var panel=document.getElementById(PANEL_ID);
    if(panel)panel.remove();
  }

  function openRecovery(){
    closeRecovery();
    var list=scan(),active=activeOf(list);
    var overlay=document.createElement('div');
    overlay.id=PANEL_ID;
    overlay.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(3,7,14,.88);display:flex;align-items:flex-end;justify-content:center;padding:12px;box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#fff';
    var box=document.createElement('div');
    box.style.cssText='width:min(680px,100%);max-height:88vh;overflow:auto;background:#111827;border:1px solid #334155;border-radius:18px;padding:16px;box-sizing:border-box;box-shadow:0 20px 70px rgba(0,0,0,.5)';
    var html='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><div><div style="font-size:18px;font-weight:900">Récupération de sauvegarde</div><div style="font-size:12px;color:#94a3b8;margin-top:3px">V341 · aucune restauration automatique</div></div><button data-sr-close style="border:0;border-radius:10px;padding:8px 11px;background:#243044;color:#fff;font-weight:800">Fermer</button></div>';
    if(!list.length){
      html+='<div style="margin-top:14px;padding:14px;border-radius:12px;background:#182234;color:#cbd5e1">Aucune sauvegarde Shadow exploitable trouvée dans le stockage de ce navigateur.</div>';
    }else{
      html+='<div style="margin-top:12px;font-size:12px;line-height:1.45;color:#cbd5e1">Compare les records avant toute restauration. Tu peux exporter une copie en JSON sans modifier la partie actuelle.</div>';
      for(var i=0;i<list.length;i++){
        var c=list[i],better=aheadOf(c,active),same=active&&c.raw===active.raw&&c.key!==SAVE_KEY;
        html+='<div style="margin-top:10px;padding:12px;border-radius:13px;background:#172033;border:1px solid '+(better?'#3fb950':'#2b3a52')+'">'+
          '<div style="display:flex;justify-content:space-between;gap:8px"><div style="font-weight:900">'+esc(sourceLabel(c))+(better?' · progression supérieure détectée':'')+'</div><div style="font-size:11px;color:#94a3b8">'+esc(c.key)+'</div></div>'+
          '<div style="margin-top:7px;font-size:13px"><b>'+esc(c.name)+'</b> · record <b>'+c.recordFloor+'</b> · étage '+c.floor+' · niveau '+c.level+'</div>'+
          '<div style="margin-top:4px;font-size:12px;color:#aebbd0">Puissance '+c.power.toLocaleString('fr-FR')+' · équipement '+c.inventory+' · familiers '+c.pets+' · '+esc(dateLabel(c.lastSeen))+(same?' · copie identique à l’actuelle':'')+'</div>'+
          '<div style="display:flex;gap:8px;margin-top:10px"><button data-sr-export="'+esc(c.key)+'" style="flex:1;border:1px solid #3b4d68;border-radius:10px;padding:8px;background:#202c40;color:#fff;font-weight:800">Exporter</button>'+
          (c.key===SAVE_KEY?'':'<button data-sr-restore="'+esc(c.key)+'" style="flex:1;border:0;border-radius:10px;padding:8px;background:'+(better?'#238636':'#334155')+';color:#fff;font-weight:900">Restaurer</button>')+'</div></div>';
      }
    }
    box.innerHTML=html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){
      var t=e.target;
      if(t===overlay||t.hasAttribute('data-sr-close')){closeRecovery();return;}
      var ex=t.getAttribute&&t.getAttribute('data-sr-export');
      if(ex){exportCandidate(ex);return;}
      var rs=t.getAttribute&&t.getAttribute('data-sr-restore');
      if(rs)restoreCandidate(rs);
    });
  }

  function mountRecoveryButton(){
    if(document.getElementById(BUTTON_ID))return;
    var list=scan(),active=activeOf(list),ahead=false;
    for(var i=0;i<list.length;i++)if(aheadOf(list[i],active)){ahead=true;break;}
    var button=document.createElement('button');
    button.id=BUTTON_ID;
    button.type='button';
    button.textContent=ahead?'Sauvegarde récupérable':'Récupération';
    button.setAttribute('aria-label','Ouvrir la récupération de sauvegarde');
    button.style.cssText='position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom) + 82px);z-index:99990;border:'+(ahead?'1px solid #56d364':'1px solid #3b4d68')+';border-radius:12px;padding:8px 10px;background:'+(ahead?'#173d25':'#182234')+';color:#fff;font:800 12px/1 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 8px 26px rgba(0,0,0,.35)';
    button.addEventListener('click',openRecovery);
    document.body.appendChild(button);
  }

  /* Capture the save that boot() just loaded before later migration scripts run. */
  snapshot();

  try{
    if(typeof saveNow==='function'&&!saveNow.__srSaveSafetyV340){
      var previousSaveNow=saveNow;
      var safeSaveNow=function(){
        snapshot();
        return previousSaveNow.apply(this,arguments);
      };
      safeSaveNow.__srSaveSafetyV340=true;
      safeSaveNow.__srPreviousSaveNow=previousSaveNow;
      saveNow=safeSaveNow;
    }
  }catch(_){ }

  var recoveryApi={
    scan:scan,
    open:openRecovery,
    exportCandidate:exportCandidate,
    restoreCandidate:restoreCandidate,
    aheadOf:aheadOf
  };

  window.__srSaveSafetyV340={
    saveKey:SAVE_KEY,
    backupPrefix:BACKUP_PREFIX,
    backupSlots:BACKUP_SLOTS,
    snapshot:snapshot,
    restore:restore,
    scan:scan,
    openRecovery:openRecovery,
    exportCandidate:exportCandidate,
    restoreCandidate:restoreCandidate,
    aheadOf:aheadOf
  };

  /* Compatibility alias for the short-lived V341 recovery API. The canonical
     runtime owner is save-safety-v340.js; no sibling recovery module is needed. */
  window.__srSaveRecoveryV341=recoveryApi;

  if(typeof SMOKE!=='undefined'&&SMOKE)return;
  if(document.readyState==='complete')setTimeout(mountRecoveryButton,0);
  else window.addEventListener('load',function(){setTimeout(mountRecoveryButton,0);},{once:true});
})();
