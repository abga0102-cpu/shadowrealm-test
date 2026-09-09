/* SHADOWREACH · Forge Auto-Batch Gate V260
   Final progression authority. No dynamic loaders.
   Must load after forge-ux-v258.js and forge-panel-authority-v260.js.
*/
(function(){
'use strict';
if(window.__srForgeBatchGateV260)return;window.__srForgeBatchGateV260=true;
if(typeof S==='undefined'||!S.forge)return;
var OPTIONS=[1,3,5,10];
function unlocked(){try{return Math.max(1,Math.floor(typeof forgeBatch==='function'?forgeBatch(S):1));}catch(_){return 1;}}
function allowed(){var m=unlocked();return OPTIONS.filter(function(n){return n<=m;});}
function safeChoice(n){var a=allowed(),v=Math.floor(Number(n)||1);if(a.indexOf(v)>=0)return v;for(var i=a.length-1;i>=0;i--){if(a[i]<=v)return a[i];}return 1;}
function sanitize(save){var before=Math.floor(Number(S.forge.autoBatch)||1),after=safeChoice(before);if(before!==after){S.forge.autoBatch=after;if(save&&typeof saveNow==='function')try{saveNow();}catch(_){}}return after;}
sanitize(true);
if(typeof ACT!=='undefined'&&ACT){
  var base=ACT.autoForgeBatch258;
  ACT.autoForgeBatch258=function(a){
    var wanted=Math.floor(Number(a)||1),max=unlocked();
    if(wanted>max){if(typeof toast==='function')toast('Forge ×'+wanted+' pas encore débloquée',false);sanitize(true);if(typeof showForgeFilterPicker==='function')try{showForgeFilterPicker();}catch(_){}return;}
    var n=safeChoice(wanted);
    if(typeof base==='function')return base.call(this,n);
    S.forge.autoBatch=n;try{if(typeof saveNow==='function')saveNow();}catch(_){}
  };
}
function refresh(){
  sanitize(false);var max=unlocked();
  document.querySelectorAll('#srAutoBatch258 .srBatch258').forEach(function(b){
    var n=Math.floor(Number(b.getAttribute('data-arg'))||1),locked=n>max;
    b.disabled=locked;b.classList.toggle('srBatchLocked260',locked);b.classList.toggle('on',!locked&&n===safeChoice(S.forge.autoBatch));
    if(locked){b.setAttribute('aria-disabled','true');b.textContent='🔒 ×'+n;}else{b.removeAttribute('aria-disabled');b.textContent='×'+n;}
  });
  var box=document.getElementById('srAutoBatch258');if(box){var note=box.querySelector('.srBatchGateNote260');if(!note){note=document.createElement('div');note.className='srBatchGateNote260 mute tiny mt3';box.appendChild(note);}note.textContent='Maximum actuellement débloqué : ×'+max+'.';}
}
var prev=typeof showForgeFilterPicker==='function'?showForgeFilterPicker:null;
if(prev){showForgeFilterPicker=function(){var r=prev.apply(this,arguments);requestAnimationFrame(refresh);return r;};try{window.showForgeFilterPicker=showForgeFilterPicker;}catch(_){}}
var st=document.createElement('style');st.id='srForgeBatchGate260Style';st.textContent='.srBatch258.srBatchLocked260{opacity:.34!important;filter:grayscale(1);cursor:not-allowed!important;border-color:#354258!important;color:#738099!important;background:#0a111d!important;box-shadow:none!important}.srBatch258.srBatchLocked260:active{transform:none!important}';document.head.appendChild(st);
setTimeout(refresh,0);
window.__srForgeBatchGateV260={unlocked:unlocked,sanitize:sanitize,refresh:refresh,version:260};
})();
