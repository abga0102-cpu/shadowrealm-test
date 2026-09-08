/* SHADOWREACH · Import save daily-reset guard V204
   Importing a save must preserve the key counts stored in that save.
   A daily reset is a real-time event, not an import side effect. */
(function(){
  'use strict';
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
          var importedKeyReset=raw&&raw.lastKeyReset;
          S=migrate(raw,'Héros');

          /* Never award a daily refill merely because a save was imported.
             Anchor the imported state to the current UTC day, preserving the
             exact key counts contained in the file. The normal daily reset
             resumes when the calendar actually changes. */
          S.lastKeyReset=todayStr();
          if(raw&&raw.eventDay===todayStr())S.eventDay=raw.eventDay;
          if(S.__skipDailyResetOnce)delete S.__skipDailyResetOnce;

          S.power=computePower(S);
          refreshDerived();
          saveNow();
          startCampaign();
          nav('accueil');
          toast('Sauvegarde importée',true);
        }catch(e){
          console.warn('import save failed',e);
          toast('Fichier invalide');
        }
      };
      fr.readAsText(f);
    };
    inp.click();
  };
})();
