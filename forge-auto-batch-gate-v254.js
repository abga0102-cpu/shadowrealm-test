/* SHADOWREACH · Forge Auto-Batch Gate V254 / V257 bridge
   - AUTO batch choices never exceed canonical forgeBatch(S).
   - Hot-loads the V257 Forge inline-result authority with a fresh cache key.
   - Re-applies the gate after V257 loads so no later wrapper can bypass progression.
*/
(function(){
'use strict';
if(window.__srForgeAutoBatchGateV254)return;
window.__srForgeAutoBatchGateV254=true;
if(typeof S==='undefined'||!S.forge)return;
var OPTIONS=[1,3,5,10];
var guardedBase=null;
function unlocked(){try{return Math.max(1,Math.floor(typeof forgeBatch==='function'?forgeBatch(S):1));}catch(_){return 1;}}
function allowed(){var m=unlocked();return OPTIONS.filter(function(n){return n<=m;});}
function safeChoice(n){var a=allowed(),v=Math.floor(Number(n)||1);if(a.indexOf(v)>=0)return v;for(var i=a.length-1;i>=0;i--)if(a[i]<=v)return a[i];return 1;}
function sanitize(save){var before=Math.floor(Number(S.forge.autoBatch)||1),after=safeChoice(before);if(before!==after){S.forge.autoBatch=after;if(save&&typeof saveNow==='function')try{saveNow();}catch(_){}}return after;}
sanitize(true);

function installActionGuard(){
 if(typeof ACT==='undefined'||!ACT)return;
 var current=ACT.autoForgeBatch253;
 if(current&&current.__srGate254)return;
 guardedBase=current;
 var guard=function(a){
   var wanted=Math.floor(Number(a)||1),max=unlocked();
   if(wanted>max){if(typeof toast==='function')toast('Forge ×'+wanted+' pas encore débloquée',false);sanitize(true);if(typeof showForgeFilterPicker==='function')try{showForgeFilterPicker();}catch(_){}return;}
   var n=safeChoice(wanted);
   if(typeof current==='function')return current.call(this,n);
   S.forge.autoBatch=n;try{if(typeof saveNow==='function')saveNow();}catch(_){}
 };
 guard.__srGate254=true;ACT.autoForgeBatch253=guard;
}
installActionGuard();

function refreshPicker(){
 sanitize(false);var max=unlocked();
 document.querySelectorAll('#srAutoBatch253 .srBatch253').forEach(function(b){
   var n=Math.floor(Number(b.getAttribute('data-arg'))||1),locked=n>max;
   b.disabled=locked;b.classList.toggle('srBatchLocked254',locked);b.classList.toggle('on',!locked&&n===safeChoice(S.forge.autoBatch));
   if(locked){b.setAttribute('aria-disabled','true');b.title='Débloque d’abord Forge ×'+n;b.textContent='🔒 ×'+n;}
   else{b.removeAttribute('aria-disabled');b.title='';b.textContent='×'+n;}
 });
 var box=document.getElementById('srAutoBatch253');if(box){var note=box.querySelector('.srBatchGateNote254');if(!note){note=document.createElement('div');note.className='srBatchGateNote254 mute tiny mt3';box.appendChild(note);}note.textContent='Maximum actuellement débloqué : ×'+max+'.';}
}
function wrapPicker(){
 var previous=typeof showForgeFilterPicker==='function'?showForgeFilterPicker:null;
 if(!previous||previous.__srGatePicker254)return;
 var p=function(){var r=previous.apply(this,arguments);requestAnimationFrame(refreshPicker);return r;};p.__srGatePicker254=true;showForgeFilterPicker=p;try{window.showForgeFilterPicker=showForgeFilterPicker;}catch(_){}
}
wrapPicker();
var old=document.getElementById('srForgeBatchGate254Style');if(old)old.remove();
var st=document.createElement('style');st.id='srForgeBatchGate254Style';st.textContent='.srBatch253.srBatchLocked254{opacity:.34!important;filter:grayscale(1);cursor:not-allowed!important;border-color:#354258!important;color:#738099!important;background:#0a111d!important;box-shadow:none!important}.srBatch253.srBatchLocked254:active{transform:none!important}';document.head.appendChild(st);
setTimeout(refreshPicker,0);

/* Fresh V257 authority. This is intentionally dynamic so clients whose index still references
   forge-ux-v253.js?v=...254 receive the corrected inline renderer immediately after this gate. */
if(!window.__srForgeUXV257){
 var s=document.createElement('script');s.src='forge-ux-v253.js?v=2026.09.09.257';s.async=false;
 s.onload=function(){installActionGuard();wrapPicker();setTimeout(refreshPicker,0);};
 document.body.appendChild(s);
}
window.__srForgeAutoBatchGateV254={unlocked:unlocked,sanitize:sanitize,refresh:refreshPicker,version:257};
})();
