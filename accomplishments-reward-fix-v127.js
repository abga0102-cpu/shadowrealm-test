/* Shadowreach v127 - Accomplishment reward audit fixes · Phase 4G
   - Adds the missing 10-minute accelerator definition so rb50 rewards are usable.
   - Compensates legacy Raid 100 claims to the validated total without double-paying.
   - Applies that legacy compensation once at boot and whenever migrate(...) processes
     a save, instead of polling the whole runtime every 500 ms.
   Canonical future claims are owned by accomplishments-claim-v140.js. */
(function(){
'use strict';
if(window.__srAccomplishmentsRewardFixV127)return;
window.__srAccomplishmentsRewardFixV127=true;

/* The engine consumes accelerator definitions dynamically through ACCEL_DEFS.
   Existing saves may already contain S.accels.a10 from the rb50 reward. */
try{
  if(typeof ACCEL_DEFS!=='undefined' && Array.isArray(ACCEL_DEFS) && !ACCEL_DEFS.some(function(a){return a&&a.key==='a10';})){
    var pos=ACCEL_DEFS.findIndex(function(a){return a&&Number(a.mins)>10;});
    var def={key:'a10',mins:10,label:'10 min'};
    if(pos<0)ACCEL_DEFS.push(def);else ACCEL_DEFS.splice(pos,0,def);
  }
}catch(_){}

function ensureAcc(s){
  if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};
  var a=s.accomplishments;
  if(!a.claimed||typeof a.claimed!=='object')a.claimed={};
  if(!a.mergePieces||typeof a.mergePieces!=='object')a.mergePieces={};
  return a;
}

/* Legacy Raid 100 paid:
   1,000,000 Or + 750 Étincelles + 750 Essences + 30 Rares.
   Validated Raid 100 is:
   1,500,000 Or + 1,000 Étincelles + 1,000 Essences + 50 Rares.
   Therefore the exact safe compensation is +500k/+250/+250/+20 Rare. */
function compensateRaid100(s){
  if(!s)return false;
  var a=ensureAcc(s);
  if(!a.claimed.raid100 || a.raid100ValidatedV127)return false;
  s.gold=(Number(s.gold)||0)+500000;
  s.eclat=(Number(s.eclat)||0)+250;
  s.essence=(Number(s.essence)||0)+250;
  a.mergePieces.RARE=(Number(a.mergePieces.RARE)||0)+20;
  a.raid100ValidatedV127=true;
  return true;
}

function compensateCurrentState(){
  try{
    if(typeof S==='undefined'||!S)return false;
    var changed=compensateRaid100(S);
    if(changed){
      try{if(typeof dirty!=='undefined')dirty=true;}catch(_){}
      try{if(typeof saveNow==='function')saveNow();}catch(_){}
      try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){}
      try{if(typeof toast==='function')toast('Récompense Raid 100 complétée',true);}catch(_){}
    }
    return changed;
  }catch(_){return false;}
}

/* Save import V207 resolves the global migrate(...) function when a file is
   processed. Chaining that deterministic lifecycle preserves live-import
   compensation without a perpetual timer. */
var nativeMigrate=typeof window.migrate==='function'?window.migrate:null;
if(nativeMigrate){
  window.migrate=function(){
    var migrated=nativeMigrate.apply(this,arguments);
    try{compensateRaid100(migrated);}catch(_){}
    return migrated;
  };
}

/* The initial save is loaded before this compatibility layer. Reconcile it once
   now, with one bounded fallback for unusual boot timing. The migration flag
   makes both calls idempotent. */
compensateCurrentState();
setTimeout(compensateCurrentState,50);
})();
