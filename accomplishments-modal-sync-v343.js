/* SHADOWREACH V343 · Accomplishments persistent-modal sync
   V83 intentionally prevents background modal replacement while a modal is open.
   The Accomplishments pass is a single persistent modal whose tabs re-render the
   same canonical content, so same-modal refreshes must replace only its body. */
(function(){
'use strict';
if(window.__srAccomplishmentsModalSyncV343)return;
window.__srAccomplishmentsModalSyncV343=true;

var guardedOpen=window.openModal;
if(typeof guardedOpen!=='function')return;

function isPassRequest(content,title){
 return String(title||'')==='Pass Progression'||String(content||'').indexOf('srAch139')>=0;
}
function currentPass(){
 var ov=document.getElementById('overlay');
 return ov&&ov.querySelector('.srAch139')?ov:null;
}
function notifyRefresh(){
 try{window.dispatchEvent(new CustomEvent('sr:accomplishments-ready'));}catch(_){}
}

window.openModal=function(content,title){
 var ov=currentPass();
 if(ov&&isPassRequest(content,title)){
  var body=ov.querySelector(':scope > .card > .mbody')||ov.querySelector('.mbody');
  if(body){
   body.innerHTML=String(content==null?'':content);
   ov.setAttribute('data-modal','accomplishments');
   notifyRefresh();
   return;
  }
 }
 return guardedOpen.apply(this,arguments);
};

function removeDuplicateClose(){
 var ov=currentPass();if(!ov)return;
 var root=ov.querySelector('.srAch139');if(!root)return;
 var topClose=root.querySelector('.srPassClose331');if(!topClose)return;
 var rows=root.querySelectorAll(':scope > .mt10');
 rows.forEach(function(row){
  if(row.querySelector('[data-act="closeModal"]'))row.remove();
 });
}
function scheduleCleanup(){
 requestAnimationFrame(function(){requestAnimationFrame(removeDuplicateClose);});
 clearTimeout(scheduleCleanup.t);
 scheduleCleanup.t=setTimeout(removeDuplicateClose,180);
}
window.addEventListener('sr:modal-state',scheduleCleanup);
window.addEventListener('sr:accomplishments-ready',scheduleCleanup);
window.addEventListener('sr:accomplishmentclaimed',scheduleCleanup);
scheduleCleanup();

window.__srAccomplishmentsModalSyncConfigV343={sameModalBodyReplace:true,singleCloseControl:true};
})();
