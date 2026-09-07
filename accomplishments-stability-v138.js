/* SHADOWREACH · Accomplishments stability v138
   - Prevent the legacy text-based Development detector from mounting the card on Accueil.
   - Mount Accomplissements only when the real screen header is Developpement.
   - Restore Etages after all older modal wrappers, while keeping v121 as claim/reward authority. */
(function(){
'use strict';
if(window.__srAccomplishmentsStabilityV138)return;window.__srAccomplishmentsStabilityV138=true;

/* v124 detects the word "Developpement" anywhere in #screen. Accueil contains
   a navigation tile with that word, so the old detector incorrectly inserts
   Accomplissements above the Forge. Stop only that UI injector. */
window.__srAccomplishmentsUIV124=true;

function norm(v){try{return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}catch(_){return String(v||'').toLowerCase();}}
function realDevelopmentScreen(){
 var s=document.getElementById('screen');if(!s)return false;
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
if(typeof MutationObserver!=='undefined'){var q=false;new MutationObserver(function(){if(q)return;q=true;requestAnimationFrame(function(){q=false;placeEntry();});}).observe(document.body,{childList:true,subtree:true});}
setTimeout(placeEntry,0);

var FLOORS=[
 ['floor25',25,'250 Essences'],
 ['floor50',50,'2 000 Minerais + 5 000 Or'],
 ['floor75',75,'1 000 PR + 30 Pièces de fusion Communes'],
 ['floor100',100,'500 Étincelles + 500 Essences + 30 Pièces de fusion Communes']
];
function floorRows(){
 var rec=Math.max(0,Number(typeof S!=='undefined'&&S.recordFloor)||0),claimed=(S.accomplishments&&S.accomplishments.claimed)||{};
 return '<div data-ach-floors-v138="1"><div class="sect" style="margin:12px 0 6px">Étages</div>'+FLOORS.map(function(x){
  var got=!!claimed[x[0]],done=rec>=x[1],act=got?'<span class="pill" style="color:var(--greenLit);border-color:#3FB950">Récupéré</span>':done?'<button class="btn sm green" data-ach="'+x[0]+'">Récupérer</button>':'<span class="pill">En cours</span>';
  return '<div class="itemRow"><div class="flex1"><div class="b small">Atteindre l’étage '+x[1]+'</div><div class="mute tiny">'+x[2]+'</div></div>'+act+'</div>';
 }).join('')+'</div>';
}
function floorOverview(){
 var rec=Math.max(0,Number(S.recordFloor)||0),steps=[25,50,75,100],done=0,next=null;
 for(var i=0;i<steps.length;i++){if(rec>=steps[i])done++;else if(next===null)next=steps[i];}
 var fin=done===steps.length;
 return '<div class="card frame" data-ach-floor-overview-v138="1" style="margin:6px 0"><div class="between"><div><div class="b">Étages</div><div class="mute tiny">'+(fin?'4 / 4 jalons atteints':'Prochain jalon : '+next+' · '+done+' / 4 atteints')+'</div></div><span class="pill">'+(fin?'Terminé':rec+' / '+next)+'</span></div></div>';
}
function installFinalModalFix(){
 if(typeof openModal!=='function'||window.__srAccomplishmentsFinalModalV138)return;
 window.__srAccomplishmentsFinalModalV138=true;
 var base=openModal;
 openModal=function(html,title){
  html=String(html);
  if(norm(title).trim()==='accomplissements'){
   /* Remove any older injected floor copy, then add one canonical copy. */
   html=html.replace(/<div data-ach-floors-v137="1">[\s\S]*?<\/div><\/div>/g,'');
   if(html.indexOf('data-ach-floor-overview-v138')<0){var firstSect=html.indexOf('<div class="sect"');if(firstSect>=0)html=html.slice(0,firstSect)+floorOverview()+html.slice(firstSect);else html=floorOverview()+html;}
   if(html.indexOf('data-ach-floors-v138')<0){var close='<div class="mt10"><button class="btn ghost" data-act="closeModal">Fermer</button></div>';html=html.indexOf(close)>=0?html.replace(close,floorRows()+close):html+floorRows();}
  }
  return base(html,title);
 };
}
/* All synchronous accomplishment layers load after this file; install last. */
setTimeout(installFinalModalFix,0);
})();
