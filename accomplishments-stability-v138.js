/* SHADOWREACH · Accomplishments Development entry stability v138
   - Prevent the legacy text-based Development detector from mounting the card on Accueil.
   - Mount Accomplissements only on the canonical Development route.
   - Canonical Accomplissements modal rendering belongs exclusively to v139. */
(function(){
'use strict';
if(window.__srAccomplishmentsStabilityV138)return;window.__srAccomplishmentsStabilityV138=true;

/* v124 detects the word "Developpement" anywhere in #screen. Accueil contains
   a navigation tile with that word, so the old detector incorrectly inserts
   Accomplissements above the Forge. Stop only that UI injector. */
window.__srAccomplishmentsUIV124=true;

function norm(v){try{return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}catch(_){return String(v||'').toLowerCase();}}
function activeDevelopmentRoute(){
 var active=document.querySelector('#tabs .tab.on[data-arg="developpement"]');
 return !!active;
}
function realDevelopmentScreen(){
 var s=document.getElementById('screen');if(!s)return false;
 /* Phase 2A owns BottomNav route state. Prefer that stable owner so a transient
    header render cannot remove the entry during WebKit navigation. */
 if(activeDevelopmentRoute())return true;
 var heads=s.querySelectorAll('.topbar,.topBar,.screenTitle,h1,h2');
 for(var i=0;i<heads.length;i++)if(norm(heads[i].textContent).trim()==='developpement')return true;
 return false;
}
function openAchievements(e){
 if(e){e.preventDefault();e.stopPropagation();}
 try{if(typeof ACT!=='undefined'&&ACT&&typeof ACT.accomplishments==='function')ACT.accomplishments();}catch(_){}
}
function placeEntry(){
 try{
  var s=document.getElementById('screen');if(!s)return;
  var old=s.querySelectorAll('[data-sr-accomplishments-entry]');for(var i=0;i<old.length;i++)old[i].remove();
  var mine=s.querySelector('[data-sr-accomplishments-v138]');
  if(!realDevelopmentScreen()){if(mine)mine.remove();return;}
  if(mine)return;
  var host=s.querySelector('.pad')||s;
  var b=document.createElement('button');b.type='button';b.className='card lit';b.setAttribute('data-sr-accomplishments-v138','1');
  b.style.cssText='display:block;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;margin:8px 0 10px;padding:12px 14px;color:inherit;font:inherit;';
  b.innerHTML='<div class="between"><div><b>Accomplissements</b><div class="mute tiny mt3">Progression, jalons et récompenses</div></div><span class="pill">Voir</span></div>';
  b.addEventListener('click',openAchievements,true);host.appendChild(b);
 }catch(_){}
}
var q=false,retry=0;
function schedulePlace(){
 if(!q){
  q=true;
  requestAnimationFrame(function(){q=false;placeEntry();});
 }
 clearTimeout(retry);
 retry=setTimeout(placeEntry,120);
}
if(typeof MutationObserver!=='undefined'){
 new MutationObserver(schedulePlace).observe(document.body,{childList:true,subtree:true,characterData:true});
}
setTimeout(placeEntry,0);
setTimeout(placeEntry,120);
})();
