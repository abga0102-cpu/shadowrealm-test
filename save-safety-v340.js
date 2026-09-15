/* SHADOWREACH V340 · Local save safety
   Keeps rotating snapshots of the persisted local save before every saveNow()
   write. Loaded after game-5 so the canonical boot has already restored S. */
(function(){
  'use strict';
  if(window.__srSaveSafetyV340)return;

  var SAVE_KEY='shadowreach.save.local';
  var BACKUP_PREFIX='shadowreach.save.backup.v340.';
  var BACKUP_SLOTS=5;

  function validRaw(raw){
    if(!raw||typeof raw!=='string')return false;
    try{
      var parsed=JSON.parse(raw);
      return !!(parsed&&typeof parsed==='object'&&!Array.isArray(parsed));
    }catch(_){return false;}
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

  window.__srSaveSafetyV340={
    saveKey:SAVE_KEY,
    backupPrefix:BACKUP_PREFIX,
    backupSlots:BACKUP_SLOTS,
    snapshot:snapshot,
    restore:restore
  };
})();
