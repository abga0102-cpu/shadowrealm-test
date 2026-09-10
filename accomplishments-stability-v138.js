/* SHADOWREACH · Accomplishments Development entry stability v138
   - Prevent the legacy text-based Development detector from mounting the card on Accueil.
   - Mount Accomplissements only on the canonical Development route.
   - Canonical Accomplissements modal rendering belongs exclusively to v139.
   - Phase 4F: reconcile the Development entry from BottomNav/renderTabs lifecycle,
     not a document-wide MutationObserver. */
(function(){
'use strict';
if(window.__srAccomplishmentsStabilityV138)return;window.__srAccomplishmentsStabilityV138=true;

/* v124 detects the word "Developpement" anywhere in #screen. Accueil contains
   a navigation tile with that word, so the old detector incorrectly inserts
   Accomplissements above the Forge. Stop only that UI injector. */
window.__srAccomplishmentsUIV124=true;

function activeDevelopmentRoute(){
 var active=document.querySelector('#tabs .tab.on[data-arg="developpement"]');
 return !!active;
}
function realDevelopmentScreen(){
 var s=document.getElementById('screen');if(!s)return false;
 /* Phase 2A owns BottomNav route state. Phase 4F makes that route state the
    exclusive scope signal instead of falling back to screen-heading text. */
 return activeDevelopmentRoute();
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

/* BottomNav already owns deterministic route rendering through renderTabs.
   Chain that lifecycle instead of observing every mutation in the document.
   The RAF + single retry remain bounded protection for WebKit render settling. */
var nativeRenderTabs=typeof window.renderTabs==='function'?window.renderTabs:null;
if(nativeRenderTabs){
 window.renderTabs=function(){
  var out=nativeRenderTabs.apply(this,arguments);
  schedulePlace();
  return out;
 };
}
schedulePlace();
})();
