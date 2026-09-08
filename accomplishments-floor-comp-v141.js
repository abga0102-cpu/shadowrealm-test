/* SHADOWREACH · Legacy floor reward compensation v141
   One-time make-good for floor milestones that were already shown as claimed
   before the reliable v140 claim handler existed.

   Historical state observed before v140:
   - floor25, floor50 and floor75 were already marked claimed.
   - floor100 was still claimable, so it is NOT compensated here; v140 handles it reliably.

   This migration runs once per save. It only compensates milestones that are
   already claimed at the instant v141 first loads, then permanently marks the
   migration processed so later legitimate claims cannot receive a second payout. */
(function(){
'use strict';
if(window.__srFloorCompV141)return;
window.__srFloorCompV141=true;

var IDS=['floor25','floor50','floor75'];

function ensure(s){
  if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};
  var a=s.accomplishments;
  if(!a.claimed||typeof a.claimed!=='object')a.claimed={};
  if(!a.mergePieces||typeof a.mergePieces!=='object')a.mergePieces={};
  return a;
}
function grantLegacy(s,id){
  var a=ensure(s);
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
function run(){
  try{
    if(typeof S==='undefined'||!S)return;
    var a=ensure(S);
    if(a.floorLegacyCompensationV141Processed)return;
    var paid=[];

    function migrate(s){
      var x=ensure(s);
      if(x.floorLegacyCompensationV141Processed)return;
      IDS.forEach(function(id){
        if(x.claimed[id]){
          var label=grantLegacy(s,id);
          if(label)paid.push(label);
        }
      });
      x.floorLegacyCompensationV141Processed=true;
      x.floorLegacyCompensationV141Paid=paid.slice();
      x.floorLegacyCompensationV141At=Date.now();
    }

    if(typeof update==='function')update(migrate);
    else{
      migrate(S);
      try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
      try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){}
    }

    if(paid.length){
      try{if(typeof toast==='function')toast('Compensation Étages reçue : '+paid.join(', '),true);}catch(_){}
    }
  }catch(_){}
}

/* Run after save/bootstrap initialization, then retry briefly in case S is not
   fully ready on the first synchronous pass. The persisted processed marker
   makes every retry idempotent. */
setTimeout(run,80);
setTimeout(run,700);
setTimeout(run,1800);
})();
