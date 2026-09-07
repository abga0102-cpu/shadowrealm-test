/* SHADOWREACH · accomplishments Development entry v124
   Accomplissements belongs to the progression hub, not Settings.
   This patch mounts the entry directly in the live Développement screen. */
(function(){
'use strict';
if(window.__srAccomplishmentsUIV124)return;
window.__srAccomplishmentsUIV124=true;

function norm(v){
  try{return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
  catch(_){return String(v||'').toLowerCase();}
}
function isDevelopmentScreen(screen){
  if(!screen)return false;
  var txt=norm(screen.textContent);
  return txt.indexOf('developpement')>=0;
}
function openAccomplishments(e){
  if(e){e.preventDefault();e.stopPropagation();}
  try{
    if(typeof ACT!=='undefined'&&ACT&&typeof ACT.accomplishments==='function'){
      ACT.accomplishments();
      return;
    }
  }catch(_){}
  try{if(typeof toast==='function')toast('Accomplissements indisponibles. Recharge la page.',false);}catch(_){}
}
function mount(){
  try{
    var screen=document.getElementById('screen');
    if(!isDevelopmentScreen(screen))return;
    if(screen.querySelector('[data-sr-accomplishments-entry]'))return;

    var host=screen.querySelector('.pad')||screen.querySelector('.screenBody')||screen;
    var card=document.createElement('button');
    card.type='button';
    card.setAttribute('data-sr-accomplishments-entry','1');
    card.setAttribute('aria-label','Ouvrir les accomplissements');
    card.className='card lit';
    card.style.cssText='display:block;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;margin:8px 0 10px;padding:12px 14px;color:inherit;font:inherit;';
    card.innerHTML='<div class="between"><div><b>Accomplissements</b><div class="mute tiny mt3">Progression, jalons et récompenses</div></div><span class="pill">Voir</span></div>';
    card.addEventListener('click',openAccomplishments,true);
    host.insertBefore(card,host.firstChild||null);
  }catch(_){}
}

if(typeof MutationObserver!=='undefined'){
  new MutationObserver(function(){requestAnimationFrame(mount);}).observe(document.body,{childList:true,subtree:true});
}
document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('[data-sr-accomplishments-entry]'):null;
  if(b)openAccomplishments(e);
},true);
setInterval(mount,700);
setTimeout(mount,0);
})();
