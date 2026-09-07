/* SHADOWREACH · Accomplishments home scope v136
   Additive UI-only correction: the Accomplissements entry belongs to the
   dedicated Developpement hub and must never remain mounted on Accueil.
   The accomplishment engine, rewards, claims and Development entry stay intact. */
(function(){
'use strict';
if(window.__srAccomplishmentsHomeScopeV136)return;
window.__srAccomplishmentsHomeScopeV136=true;

function norm(v){
  try{return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
  catch(_){return String(v||'').toLowerCase();}
}
function isDevelopment(screen){
  if(!screen)return false;
  return norm(screen.textContent).indexOf('developpement')>=0;
}
function clean(){
  try{
    var screen=document.getElementById('screen');
    if(!screen||isDevelopment(screen))return;
    var entries=screen.querySelectorAll('[data-sr-accomplishments-entry]');
    for(var i=0;i<entries.length;i++)entries[i].remove();
  }catch(_){}
}
if(typeof MutationObserver!=='undefined'){
  var queued=false;
  new MutationObserver(function(){
    if(queued)return;queued=true;
    requestAnimationFrame(function(){queued=false;clean();});
  }).observe(document.body,{childList:true,subtree:true});
}
setTimeout(clean,0);
})();
