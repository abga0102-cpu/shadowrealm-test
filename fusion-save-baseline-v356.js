/* SHADOWREACH · Fusion test-save baseline rollback v356
   Restores the current test save to the pre-reward fusion baseline requested by the owner.
   Baseline source: original screenshot before the Gold reward redesign (~3.11K Or, ~50 Fusions).
   Scope is intentionally limited to Fusion progress/reward state and Gold. */
(function(){
'use strict';
if(window.__srFusionSaveBaselineV356)return;
window.__srFusionSaveBaselineV356=true;

var IDS=['fusion50','fusion150','fusion250','fusion350','fusion500','fusion1000','fusion1500'];
function ensure(s){
 if(!s.sanctuary||typeof s.sanctuary!=='object')s.sanctuary={};
 if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};
 var a=s.accomplishments;
 if(!a.claimed||typeof a.claimed!=='object')a.claimed={};
 if(!a.premiumClaimed||typeof a.premiumClaimed!=='object')a.premiumClaimed={};
 return a;
}
function applyBaseline(s){
 var a=ensure(s),st=s.sanctuary;
 if(a.fusionSaveBaselineV356Done)return false;

 /* Gold visible before the reward chain started. */
 s.gold=3110;

 /* Every counter that can feed the Fusion accomplishment total is reset to 50. */
 st.mergeCrafts=50;
 st.fusions=50;
 st.mergeFusions=50;
 a.fusionCount=50;

 /* Treat every Fusion milestone as never claimed. */
 IDS.forEach(function(id){a.claimed[id]=false;a.premiumClaimed[id]=false;});

 a.fusionSaveBaselineV356Done=true;
 a.fusionSaveBaselineV356At=Date.now();
 return true;
}
function run(){
 try{
  if(typeof S==='undefined'||!S)return false;
  var changed=false;
  if(typeof update==='function'){
   update(function(s){changed=applyBaseline(s)||changed;});
  }else{
   changed=applyBaseline(S)||changed;
   if(changed){try{dirty=true;}catch(_){}}
  }
  if(changed){
   try{if(typeof saveNow==='function')saveNow();}catch(_){}
   try{if(typeof ACT!=='undefined'&&ACT&&typeof ACT.accomplishments==='function')ACT.accomplishments();}catch(_){}
   try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){}
   try{if(typeof toast==='function')toast('Fusion restaurée à 50 · Or restauré à 3,11K',true);}catch(_){}
  }
  return changed;
 }catch(_){return false;}
}

run();
setTimeout(run,120);
setTimeout(run,500);
})();
