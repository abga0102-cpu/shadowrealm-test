/* Shadowreach v126 - Accomplissements -> vraies pièces du Sanctuaire
   Les anciennes récompenses stockées dans accomplishments.mergePieces sont
   déplacées sans perte vers le plateau de Merge puis vers une réserve persistante.
   Les futures récompenses passent par la même file d'attente automatiquement. */
(function(){
'use strict';
// Temporary pause: do not move pending rewards, mutate Sanctuary board or run auto-fusions.
// Keep all existing saved data untouched for future reactivation.
if(window.__SHADOWREACH_SANCTUARY_PAUSED===true)return;
if(window.__srAccomplishmentsMergeV126)return;
window.__srAccomplishmentsMergeV126=true;

var ORDER=['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE','LEGENDAIRE','DIVIN'];
var NAME={COMMUN:'Commune',PEU_COMMUN:'Peu commune',RARE:'Rare',EPIQUE:'Épique',MYTHIQUE:'Mythique',LEGENDAIRE:'Légendaire',DIVIN:'Divine'};
var COLOR={COMMUN:'#9FB0C8',PEU_COMMUN:'#57C785',RARE:'#3FA7FF',EPIQUE:'#B15CF6',MYTHIQUE:'#FF7A3D',LEGENDAIRE:'#F5C542',DIVIN:'#FFB52E'};
var BOARD_SIZE=(typeof SANCT_BOARD_SIZE==='number'&&SANCT_BOARD_SIZE>0)?SANCT_BOARD_SIZE:16;
var syncing=false;

/* Canonical reserve is an array: V130 consumes it with shift().
   Convert legacy count dictionaries without dropping unknown rarities or array properties. */
var RARITY_ALIAS={RARE:'RARE_I',EPIQUE:'EPIQUE_I',MYTHIQUE:'MYTHIQUE_I',LEGENDAIRE:'LEGENDAIRE_I',ARTEFACT:'ARTEFACT_I',INFERNAL:'INFERNAL_I',IMMORTEL:'IMMORTEL_I'};
function canonicalRarity(r){return RARITY_ALIAS[r]||r;}
function normalizeReserve(st){
  var old=st.mergeReserve,arr=Array.isArray(old)?old.slice():[];
  if(old&&typeof old==='object'){
    Object.keys(old).forEach(function(r){
      if(/^\\d+$/.test(r)||r==='length')return;
      var qty=Math.max(0,Math.floor(Number(old[r])||0));
      for(var i=0;i<qty;i++)arr.push(canonicalRarity(r));
    });
  }
  st.mergeReserve=arr.map(canonicalRarity);
}
function ensureSanct(s){
  if(!s.sanctuary||typeof s.sanctuary!=='object')s.sanctuary={};
  var st=s.sanctuary;
  if(!Array.isArray(st.mergeBoard))st.mergeBoard=Array(BOARD_SIZE).fill(null);
  while(st.mergeBoard.length<BOARD_SIZE)st.mergeBoard.push(null);
  normalizeReserve(st);
  return st;
}
function ensureAcc(s){
  if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};
  if(!s.accomplishments.mergePieces||typeof s.accomplishments.mergePieces!=='object')s.accomplishments.mergePieces={};
  return s.accomplishments.mergePieces;
}
function putOne(st,r){
  var i=st.mergeBoard.findIndex(function(x){return !x;});
  if(i>=0){st.mergeBoard[i]=canonicalRarity(r);return true;}
  st.mergeReserve.push(canonicalRarity(r));
  return false;
}
function refill(st){
  var changed=false;
  while(st.mergeReserve.length){
    var i=st.mergeBoard.findIndex(function(x){return !x;});
    if(i<0)break;
    st.mergeBoard[i]=st.mergeReserve.shift();
    changed=true;
  }
  return changed;
}
function syncRewards(s){
  if(syncing||!s)return {moved:0,refilled:false};
  syncing=true;
  try{
    var st=ensureSanct(s), pending=ensureAcc(s), moved=0;
    ORDER.forEach(function(r){
      var q=Math.max(0,Math.floor(Number(pending[r])||0));
      if(!q)return;
      for(var n=0;n<q;n++)putOne(st,r);
      pending[r]=0;
      moved+=q;
    });
    var refilled=refill(st);
    if(moved>0){
      st.accomplishmentMergeMigratedV126=true;
      st.accomplishmentMergeMigratedCount=(st.accomplishmentMergeMigratedCount||0)+moved;
    }
    return {moved:moved,refilled:refilled};
  }finally{syncing=false;}
}
function reserveTotal(st){return st.mergeReserve.length;}
function reserveHTML(st){
  var total=reserveTotal(st);
  if(!total)return '';
  var counts={};
  st.mergeReserve.forEach(function(r){counts[r]=(counts[r]||0)+1;});
  var chips=Object.keys(counts).map(function(r){
    var name=(typeof SANCT_MERGE_NAME!=='undefined'&&SANCT_MERGE_NAME[r])||NAME[r]||r;
    var color=(typeof SANCT_MERGE_COLOR!=='undefined'&&SANCT_MERGE_COLOR[r])||COLOR[r]||'#9FB0C8';
    return '<span class="pill" style="border-color:'+color+';color:'+color+'">'+name+' ×'+counts[r]+'</span>';
  }).join('');
  return '<div id="srMergeReserveV126" class="card lit mt8" style="padding:10px"><div class="between"><div><div class="b small">RÉSERVE DE FUSION</div><div class="mute tiny mt3">Les pièces en trop remplissent automatiquement le plateau dès qu’une place se libère.</div></div><span class="pill">'+total+'</span></div><div class="row gap4 mt8" style="flex-wrap:wrap">'+chips+'</div></div>';
}
function mountReserve(){
  try{
    if(typeof S==='undefined'||!S)return;
    var st=ensureSanct(S), total=reserveTotal(st), old=document.getElementById('srMergeReserveV126');
    if(!total){if(old)old.remove();return;}
    var screen=document.getElementById('screen');
    if(!screen)return;
    var txt=(screen.textContent||'').toLowerCase();
    if(txt.indexOf('sanctuaire')<0)return;
    var host=screen.querySelector('.pad')||screen;
    if(old)old.outerHTML=reserveHTML(st);else host.insertAdjacentHTML('beforeend',reserveHTML(st));
  }catch(_){}
}
function syncAndRenderHint(){
  if(typeof S==='undefined'||!S)return;
  var result=syncRewards(S),moved=result.moved;
  if(moved||result.refilled){
    try{if(typeof dirty!=='undefined')dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
  }
  if(moved>0){
    try{if(typeof toast==='function')toast(moved+' pièce'+(moved>1?'s':'')+' de fusion ajoutée'+(moved>1?'s':'')+' au Sanctuaire',true);}catch(_){}
  }
  mountReserve();
}
window.__srSyncAccomplishmentMergeV126=syncAndRenderHint;

/* V127 already chains the canonical migrate(...) lifecycle before V126 loads.
   Extend that same deterministic import path so legacy/compensation merge pieces
   are conserved into the Sanctuary before the imported state becomes global. */
var nativeMigrate=typeof window.migrate==='function'?window.migrate:null;
if(nativeMigrate){
  window.migrate=function(){
    var migrated=nativeMigrate.apply(this,arguments);
    try{syncRewards(migrated);}catch(_){}
    return migrated;
  };
}

/* V140 publishes this event only after a successful claim updated state. Consume
   that lifecycle directly instead of depending on click-listener order plus a
   zero-delay timer. */
window.addEventListener('sr:accomplishmentclaimed',syncAndRenderHint);

/* Sanctuary rendering is the deterministic reserve-refill lifecycle. Sync before
   building the screen so newly available board slots are filled immediately.
   The core renderer commits the returned HTML synchronously before the current
   JavaScript turn ends, so the microtask mounts the reserve after that DOM commit
   without a zero-delay timer. */
if(typeof scrSanctuaire==='function'){
  var oldScrSanctuaire=scrSanctuaire;
  scrSanctuaire=function(){
    var result=syncRewards(typeof S!=='undefined'?S:null);
    if(result.moved||result.refilled){
      try{if(typeof dirty!=='undefined')dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
    }
    var out=oldScrSanctuaire.apply(this,arguments);
    queueMicrotask(mountReserve);
    return out;
  };
  try{if(typeof SCREENS!=='undefined'&&SCREENS)SCREENS.sanctuaire=scrSanctuaire;}catch(_){}
}

/* V127 runs its boot compensation synchronously before V126 in index.html, so
   any legacy pending pieces already exist when this module loads. Reconcile them
   now instead of waiting on a timer; imports are handled by the migrate chain. */
syncAndRenderHint();
})();
