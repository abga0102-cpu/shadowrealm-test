/* SHADOWREACH V340/V433 · Durable local save safety
   - Keeps rate-limited rotating snapshots instead of consuming every slot on every autosave.
   - Pins the strongest known progression in a non-rotating recovery key.
   - Pins every ancestral familiar separately so a later restore cannot silently delete it.
*/
(function(){
  'use strict';
  if(window.__srSaveSafetyV340)return;

  var SAVE_KEY='shadowreach.save.local';
  var BACKUP_PREFIX='shadowreach.save.backup.v340.';
  var BEST_KEY='shadowreach.save.best.v433';
  var ANCESTRAL_KEY='shadowreach.familiar.ancestral.v433';
  var META_KEY='shadowreach.save.backup.meta.v433';
  var BACKUP_SLOTS=12;
  var MIN_INTERVAL=5*60*1000;
  var IS_SMOKE=typeof SMOKE!=='undefined'&&SMOKE;

  function parse(raw){
    if(!raw||typeof raw!=='string')return null;
    try{
      var value=JSON.parse(raw);
      return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
    }catch(_){return null;}
  }

  function validRaw(raw){return !!parse(raw);}
  function num(v){v=Number(v);return isFinite(v)?v:0;}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}}

  function ancestralPets(s){
    var pets=[];
    [s&&s.pets,s&&s.familiars].forEach(function(list){
      if(!Array.isArray(list))return;
      list.forEach(function(p){
        if(p&&String(p.rarity||p.grade||p.rank||'').toUpperCase()==='ANCESTRAL')pets.push(p);
      });
    });
    return pets;
  }

  function pinAncestral(s){
    var found=ancestralPets(s);
    if(!found.length)return false;
    try{
      var prior=parse(localStorage.getItem(ANCESTRAL_KEY))||{};
      var merged=Array.isArray(prior.pets)?prior.pets.slice():[];
      var ids={};
      merged.forEach(function(p){if(p&&p.id!=null)ids[String(p.id)]=true;});
      found.forEach(function(p){
        if(!p)return;
        var id=p.id!=null?String(p.id):'ancestral-'+String(p.species||p.name||'pet');
        if(ids[id])return;
        var copy=clone(p);if(copy){merged.push(copy);ids[id]=true;}
      });
      localStorage.setItem(ANCESTRAL_KEY,JSON.stringify({at:Date.now(),pets:merged}));
      return true;
    }catch(_){return false;}
  }

  function stronger(candidate,best){
    if(!candidate)return false;
    if(!best)return true;
    var ca=ancestralPets(candidate).length,ba=ancestralPets(best).length;
    if(ca!==ba)return ca>ba;
    var cr=Math.max(num(candidate.recordFloor),num(candidate.floor));
    var br=Math.max(num(best.recordFloor),num(best.floor));
    if(cr!==br)return cr>br;
    if(num(candidate.level)!==num(best.level))return num(candidate.level)>num(best.level);
    if(num(candidate.power)!==num(best.power))return num(candidate.power)>num(best.power);
    var ci=Array.isArray(candidate.inventory)?candidate.inventory.length:0;
    var bi=Array.isArray(best.inventory)?best.inventory.length:0;
    if(ci!==bi)return ci>bi;
    return num(candidate.lastSeen)>num(best.lastSeen);
  }

  function pinBest(raw){
    var candidate=parse(raw);
    if(!candidate)return false;
    try{
      var best=parse(localStorage.getItem(BEST_KEY));
      if(stronger(candidate,best))localStorage.setItem(BEST_KEY,raw);
      pinAncestral(candidate);
      return true;
    }catch(_){return false;}
  }

  function lastSnapshotAt(){
    try{return num((parse(localStorage.getItem(META_KEY))||{}).at);}catch(_){return 0;}
  }

  function snapshot(raw,force){
    try{
      raw=typeof raw==='string'?raw:localStorage.getItem(SAVE_KEY);
      if(!validRaw(raw))return false;
      pinBest(raw);
      var first=localStorage.getItem(BACKUP_PREFIX+'1');
      if(first===raw)return true;
      var now=Date.now();
      if(!force&&first&&now-lastSnapshotAt()<MIN_INTERVAL)return true;
      for(var i=BACKUP_SLOTS;i>=2;i--){
        var previous=localStorage.getItem(BACKUP_PREFIX+(i-1));
        if(previous)localStorage.setItem(BACKUP_PREFIX+i,previous);
        else localStorage.removeItem(BACKUP_PREFIX+i);
      }
      localStorage.setItem(BACKUP_PREFIX+'1',raw);
      localStorage.setItem(META_KEY,JSON.stringify({at:now}));
      return true;
    }catch(_){return false;}
  }

  function restore(slot){
    slot=Math.max(1,Math.min(BACKUP_SLOTS,Math.floor(Number(slot)||1)));
    try{
      var raw=localStorage.getItem(BACKUP_PREFIX+slot);
      if(!validRaw(raw))return false;
      snapshot(localStorage.getItem(SAVE_KEY),true);
      localStorage.setItem(SAVE_KEY,raw);
      location.reload();
      return true;
    }catch(_){return false;}
  }

  if(IS_SMOKE){
    window.__srSaveSafetyV340={
      saveKey:SAVE_KEY,backupPrefix:BACKUP_PREFIX,backupSlots:BACKUP_SLOTS,
      bestKey:BEST_KEY,ancestralKey:ANCESTRAL_KEY,minInterval:MIN_INTERVAL,
      snapshot:function(){return false;},restore:function(){return false;},smokeIsolated:true
    };
    return;
  }

  window.__srSaveSafetyV340={
    saveKey:SAVE_KEY,backupPrefix:BACKUP_PREFIX,backupSlots:BACKUP_SLOTS,
    bestKey:BEST_KEY,ancestralKey:ANCESTRAL_KEY,minInterval:MIN_INTERVAL,
    snapshot:snapshot,restore:restore,pinBest:pinBest,pinAncestral:pinAncestral,smokeIsolated:false
  };

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
  }catch(_){}
})();