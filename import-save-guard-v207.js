/* SHADOWREACH · Authoritative save import guard V207
   Import is a state replacement: raid key counts from the JSON remain authoritative.
   No daily reset is executed during import. */
(function(){
  'use strict';
  if(window.__srImportSaveGuardV207)return;
  window.__srImportSaveGuardV207=true;
  if(typeof ACT!=='object'||!ACT)return;

  /* Reject non-save JSON before migrate() can silently create a fresh hero.
     Keep legacy saves compatible: no version number is required. */
  function isSaveObject(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
    /* Every known exported/legacy fixture contains these independent structures.
       Reject partial JSON even if it happens to contain valid numeric fields. */
    if(!Array.isArray(raw.inventory))return false;
    if(!raw.equipped||typeof raw.equipped!=='object'||Array.isArray(raw.equipped))return false;
    if(raw.pets!=null&&!Array.isArray(raw.pets))return false;
    if(raw.level!=null&&(!Number.isFinite(Number(raw.level))||Number(raw.level)<1))return false;
    if(raw.floor!=null&&(!Number.isFinite(Number(raw.floor))||Number(raw.floor)<1))return false;
    var hasProgress=(raw.level!=null||raw.floor!=null||raw.recordFloor!=null);
    var hasIdentity=(raw.version!=null||raw.v!=null||typeof raw.playerName==='string'||
      ['stats','forge','raids','skills','pets'].some(function(k){return raw[k]!=null;}));
    return hasProgress&&hasIdentity;
  }
  window.__srIsSaveObjectV508=isSaveObject;

  ACT.importSave=function(){
    var inp=document.createElement('input');
    inp.type='file';
    inp.accept='.json,application/json';
    inp.onchange=function(){
      var f=inp.files&&inp.files[0];
      if(!f)return;
      var fr=new FileReader();
      fr.onload=function(){
        var previous=S;
        var persisted=false;
        try{
          var raw=JSON.parse(String(fr.result));
          if(!isSaveObject(raw))throw new Error('Not a Shadowreach save');
          var imported=migrate(raw,'Héros');
          if(!imported||typeof imported!=='object'||Array.isArray(imported)||!Array.isArray(imported.inventory)||!imported.raids||typeof imported.raids!=='object')throw new Error('Invalid migrated save');

          /* Migration may contain legacy compensation/default logic. Restore the
             imported key inventory afterwards so zero is preserved as zero. */
          if(raw&&raw.raids&&typeof raw.raids==='object'&&Array.isArray(RAID_IDS)){
            RAID_IDS.forEach(function(id){
              var rr=raw.raids[id];
              if(!rr)return;
              var k=Number(rr.keys);
              if(Number.isFinite(k)&&imported.raids&&imported.raids[id]){
                imported.raids[id].keys=Math.max(0,Math.floor(k));
              }
            });
          }
          if(raw&&Number.isFinite(Number(raw.universalKeys))){
            imported.universalKeys=Math.max(0,Math.floor(Number(raw.universalKeys)));
          }

          /* Import must not masquerade as a calendar change. The next real day
             will resume the normal daily reset automatically. */
          imported.lastKeyReset=raidKeyResetDayKey(Date.now());
          imported.eventDay=todayStr();
          delete imported.testDays;
          imported.power=computePower(imported);
          S=imported;
          refreshDerived();
          if(saveNow()===false)throw new Error('Import could not be persisted');
          persisted=true;
          startCampaign();
          nav('accueil');
          toast('Sauvegarde importée',true);
        }catch(e){
          if(!persisted&&S!==previous){S=previous;try{refreshDerived();}catch(_){} }
          console.warn('import save V207 failed',e);
          toast('Fichier invalide');
        }
      };
      fr.readAsText(f);
    };
    inp.click();
  };
})();
