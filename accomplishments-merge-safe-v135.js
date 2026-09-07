/* SHADOWREACH · safe accomplishment merge bridge v135
   Loaded before legacy v126.
   Prevents the old fixed 16-slot normalizer from truncating the Sanctuary board.
   Accomplishment merge rewards now respect the current dynamic board size (16..32)
   and overflow into a dedicated persistent reserve until a slot becomes free. */
(function(){
'use strict';
if(window.__srAccomplishmentsMergeSafeV135)return;
window.__srAccomplishmentsMergeSafeV135=true;

/* Keep the legacy file in the build, but stop its 16-slot implementation from installing. */
window.__srAccomplishmentsMergeV126=true;

var ORDER=['COMMUN','PEU_COMMUN','RARE_I','EPIQUE_I','MYTHIQUE_I','LEGENDAIRE_I','DIVIN'];
var MAP={RARE:'RARE_I',EPIQUE:'EPIQUE_I',MYTHIQUE:'MYTHIQUE_I',LEGENDAIRE:'LEGENDAIRE_I'};
var NAME={COMMUN:'Commune',PEU_COMMUN:'Peu commune',RARE_I:'Rare I',EPIQUE_I:'Épique I',MYTHIQUE_I:'Mythique I',LEGENDAIRE_I:'Légendaire I',DIVIN:'Divine'};
var busy=false;
function state(){
  if(typeof S==='undefined'||!S)return null;
  var st=typeof sanctMergeState==='function'?sanctMergeState():(S.sanctuary||(S.sanctuary={}));
  if(!Array.isArray(st.mergeBoard))st.mergeBoard=[];
  if(!st.accomplishmentReserveV135||typeof st.accomplishmentReserveV135!=='object')st.accomplishmentReserveV135={};
  ORDER.forEach(function(r){st.accomplishmentReserveV135[r]=Math.max(0,Math.floor(Number(st.accomplishmentReserveV135[r])||0));});
  return st;
}
function pending(){
  if(typeof S==='undefined'||!S)return null;
  S.accomplishments=S.accomplishments&&typeof S.accomplishments==='object'?S.accomplishments:{};
  S.accomplishments.mergePieces=S.accomplishments.mergePieces&&typeof S.accomplishments.mergePieces==='object'?S.accomplishments.mergePieces:{};
  return S.accomplishments.mergePieces;
}
function put(st,r){var i=st.mergeBoard.findIndex(function(x){return !x;});if(i>=0){st.mergeBoard[i]=r;return true;}st.accomplishmentReserveV135[r]=(st.accomplishmentReserveV135[r]||0)+1;return false;}
function refill(st){var changed=false;ORDER.forEach(function(r){while((st.accomplishmentReserveV135[r]||0)>0){var i=st.mergeBoard.findIndex(function(x){return !x;});if(i<0)return;st.mergeBoard[i]=r;st.accomplishmentReserveV135[r]--;changed=true;}});return changed;}
function sync(){
 if(busy)return false;busy=true;
 try{
   var st=state(),p=pending();if(!st||!p)return false;var changed=false;
   Object.keys(p).forEach(function(old){var q=Math.max(0,Math.floor(Number(p[old])||0));if(!q)return;var r=MAP[old]||old;if(ORDER.indexOf(r)<0)return;for(var i=0;i<q;i++)put(st,r);p[old]=0;changed=true;});
   if(refill(st))changed=true;
   if(changed){try{if(typeof dirty!=='undefined')dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){} }
   return changed;
 }finally{busy=false;}
}
function total(st){return ORDER.reduce(function(n,r){return n+(Number(st.accomplishmentReserveV135[r])||0);},0);}
function mount(){
 try{
   var st=state();if(!st)return;var n=total(st),old=document.getElementById('srAchReserveV135');
   if(!n){if(old)old.remove();return;}
   var screen=document.getElementById('screen');if(!screen||String(screen.textContent||'').toLowerCase().indexOf('sanctuaire')<0)return;
   var chips=ORDER.filter(function(r){return st.accomplishmentReserveV135[r]>0;}).map(function(r){return '<span class="pill">'+NAME[r]+' ×'+st.accomplishmentReserveV135[r]+'</span>';}).join('');
   var html='<div id="srAchReserveV135" class="card lit mt8"><div class="between"><div><b>RÉSERVE ACCOMPLISSEMENTS</b><div class="mute tiny mt3">Remplit automatiquement les cases libres du plateau.</div></div><span class="pill">'+n+'</span></div><div class="row gap4 mt6" style="flex-wrap:wrap">'+chips+'</div></div>';
   if(old)old.outerHTML=html;else(screen.querySelector('.pad')||screen).insertAdjacentHTML('beforeend',html);
 }catch(_){}
}
setInterval(function(){if(sync()&&typeof scheduleRender==='function')scheduleRender();mount();},700);
setTimeout(function(){sync();mount();},60);
})();