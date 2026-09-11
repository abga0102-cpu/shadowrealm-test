/* Shadowreach v127 - Accomplishment legacy reward migrations · Lean L3
   - Adds the missing 10-minute accelerator definition so rb50 rewards are usable.
   - Compensates legacy Raid 100 claims to the validated total without double-paying.
   - Owns the legacy floor25/floor50/floor75 make-good formerly implemented by V141.
   - Applies legacy compensation at boot and whenever migrate(...) processes a save.
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

/* V141 historically compensated floor25/floor50/floor75 that were already marked
   claimed before the reliable V140 claim path existed. Preserve the exact payout
   values and persisted V141 markers while moving ownership into this durable
   migration module. floor100 stays excluded because V140 owns that claim. */
var LEGACY_FLOOR_IDS=['floor25','floor50','floor75'];
function grantLegacyFloor(s,id){
  var a=ensureAcc(s);
  if(id==='floor25'){
    s.essence=(Number(s.essence)||0)+250;
    return 'Étage 25';
  }
  if(id==='floor50'){
    s.minerai=(Number(s.minerai)||0)+2000;
    s.gold=(Number(s.gold)||0)+5000;
    return 'Étage 50';
  }
  if(id==='floor75'){
    if(!s.rebirth||typeof s.rebirth!=='object')s.rebirth={};
    s.rebirth.pr=(Number(s.rebirth.pr)||0)+1000;
    a.mergePieces.COMMUN=(Number(a.mergePieces.COMMUN)||0)+30;
    return 'Étage 75';
  }
  return '';
}
function compensateLegacyFloors(s){
  if(!s)return {changed:false,paid:[]};
  var a=ensureAcc(s);
  if(a.floorLegacyCompensationV141Processed)return {changed:false,paid:[]};
  var paid=[];
  LEGACY_FLOOR_IDS.forEach(function(id){
    if(a.claimed[id]){
      var label=grantLegacyFloor(s,id);
      if(label)paid.push(label);
    }
  });
  a.floorLegacyCompensationV141Processed=true;
  a.floorLegacyCompensationV141Paid=paid.slice();
  a.floorLegacyCompensationV141At=Date.now();
  return {changed:true,paid:paid};
}

function compensateCurrentState(){
  try{
    if(typeof S==='undefined'||!S)return false;
    var raidChanged=compensateRaid100(S);
    var floors=compensateLegacyFloors(S);
    var changed=raidChanged||floors.changed;
    if(changed){
      try{if(typeof dirty!=='undefined')dirty=true;}catch(_){}
      try{if(typeof saveNow==='function')saveNow();}catch(_){}
      try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){}
    }
    if(raidChanged){
      try{if(typeof toast==='function')toast('Récompense Raid 100 complétée',true);}catch(_){}
    }
    if(floors.paid.length){
      try{if(typeof toast==='function')toast('Compensation Étages reçue : '+floors.paid.join(', '),true);}catch(_){}
    }
    return changed;
  }catch(_){return false;}
}

/* Save import V207 resolves the global migrate(...) function when a file is
   processed. Chaining that deterministic lifecycle gives both historical reward
   migrations the same durable import path without separate runtime wrappers. */
var nativeMigrate=typeof window.migrate==='function'?window.migrate:null;
if(nativeMigrate){
  window.migrate=function(){
    var migrated=nativeMigrate.apply(this,arguments);
    try{compensateRaid100(migrated);}catch(_){}
    try{compensateLegacyFloors(migrated);}catch(_){}
    return migrated;
  };
}

/* Run immediately because S is already initialized before V127 loads. Keep only
   the two later bounded startup safety windows for delayed boot reconciliation;
   imported saves remain covered by the deterministic migrate(...) lifecycle. */
compensateCurrentState();
setTimeout(compensateCurrentState,700);
setTimeout(compensateCurrentState,1800);
})();
