/* SHADOWREACH · Authoritative save import guard V207
   Import is a state replacement: raid key counts from the JSON remain authoritative.
   No daily reset is executed during import. */
(function(){
  'use strict';
  if(window.__srImportSaveGuardV207)return;
  window.__srImportSaveGuardV207=true;
  if(typeof ACT!=='object'||!ACT)return;

  ACT.importSave=function(){
    var inp=document.createElement('input');
    inp.type='file';
    inp.accept='.json,application/json';
    inp.onchange=function(){
      var f=inp.files&&inp.files[0];
      if(!f)return;
      var fr=new FileReader();
      fr.onload=function(){
        try{
          var raw=JSON.parse(String(fr.result));
          S=migrate(raw,'Héros');

          /* Migration may contain legacy compensation/default logic. Restore the
             imported key inventory afterwards so zero is preserved as zero. */
          if(raw&&raw.raids&&typeof raw.raids==='object'&&Array.isArray(RAID_IDS)){
            RAID_IDS.forEach(function(id){
              var rr=raw.raids[id];
              if(!rr)return;
              var k=Number(rr.keys);
              if(Number.isFinite(k)&&S.raids&&S.raids[id]){
                S.raids[id].keys=Math.max(0,Math.floor(k));
              }
            });
          }
          if(raw&&Number.isFinite(Number(raw.universalKeys))){
            S.universalKeys=Math.max(0,Math.floor(Number(raw.universalKeys)));
          }

          /* Import must not masquerade as a calendar change. The next real day
             will resume the normal daily reset automatically. */
          S.lastKeyReset=todayStr();
          S.eventDay=todayStr();
          S.testDays=Math.max(0,Number(S.testDays)||0);
          S.power=computePower(S);
          refreshDerived();
          saveNow();
          startCampaign();
          nav('accueil');
          toast('Sauvegarde importée',true);
        }catch(e){
          console.warn('import save V207 failed',e);
          toast('Fichier invalide');
        }
      };
      fr.readAsText(f);
    };
    inp.click();
  };
})();
