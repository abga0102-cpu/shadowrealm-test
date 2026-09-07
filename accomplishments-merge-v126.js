/* Shadowreach v126 - Accomplissements -> vraies pièces du Sanctuaire
   Les anciennes récompenses stockées dans accomplishments.mergePieces sont
   déplacées sans perte vers le plateau de Merge puis vers une réserve persistante.
   Les futures récompenses passent par la même file d'attente automatiquement. */
(function(){
'use strict';
if(window.__srAccomplishmentsMergeV126)return;
window.__srAccomplishmentsMergeV126=true;

var ORDER=['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE','LEGENDAIRE','DIVIN'];
var NAME={COMMUN:'Commune',PEU_COMMUN:'Peu commune',RARE:'Rare',EPIQUE:'Épique',MYTHIQUE:'Mythique',LEGENDAIRE:'Légendaire',DIVIN:'Divine'};
var COLOR={COMMUN:'#9FB0C8',PEU_COMMUN:'#57C785',RARE:'#3FA7FF',EPIQUE:'#B15CF6',MYTHIQUE:'#FF7A3D',LEGENDAIRE:'#F5C542',DIVIN:'#FFB52E'};
var BOARD_SIZE=(typeof SANCT_BOARD_SIZE==='number'&&SANCT_BOARD_SIZE>0)?SANCT_BOARD_SIZE:16;
var syncing=false;

function ensureSanct(s){
  if(!s.sanctuary||typeof s.sanctuary!=='object')s.sanctuary={};
  var st=s.sanctuary;
  if(!Array.isArray(st.mergeBoard))st.mergeBoard=Array(BOARD_SIZE).fill(null);
  while(st.mergeBoard.length<BOARD_SIZE)st.mergeBoard.push(null);
  if(st.mergeBoard.length>BOARD_SIZE)st.mergeBoard=st.mergeBoard.slice(0,BOARD_SIZE);
  if(!st.mergeReserve||typeof st.mergeReserve!=='object')st.mergeReserve={};
  ORDER.forEach(function(r){st.mergeReserve[r]=Math.max(0,Math.floor(Number(st.mergeReserve[r])||0));});
  return st;
}
function ensureAcc(s){
  if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};
  if(!s.accomplishments.mergePieces||typeof s.accomplishments.mergePieces!=='object')s.accomplishments.mergePieces={};
  return s.accomplishments.mergePieces;
}
function putOne(st,r){
  var i=st.mergeBoard.findIndex(function(x){return !x;});
  if(i>=0){st.mergeBoard[i]=r;return true;}
  st.mergeReserve[r]=(st.mergeReserve[r]||0)+1;
  return false;
}
function refill(st){
  var changed=false;
  ORDER.forEach(function(r){
    while((st.mergeReserve[r]||0)>0){
      var i=st.mergeBoard.findIndex(function(x){return !x;});
      if(i<0)return;
      st.mergeBoard[i]=r;
      st.mergeReserve[r]--;
      changed=true;
    }
  });
  return changed;
}
function syncRewards(s){
  if(syncing||!s)return 0;
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
    refill(st);
    if(moved>0){
      st.accomplishmentMergeMigratedV126=true;
      st.accomplishmentMergeMigratedCount=(st.accomplishmentMergeMigratedCount||0)+moved;
    }
    return moved;
  }finally{syncing=false;}
}
function reserveTotal(st){return ORDER.reduce(function(n,r){return n+(Number(st.mergeReserve[r])||0);},0);}
function reserveHTML(st){
  var total=reserveTotal(st);
  if(!total)return '';
  var chips=ORDER.filter(function(r){return (st.mergeReserve[r]||0)>0;}).map(function(r){
    return '<span class="pill" style="border-color:'+COLOR[r]+';color:'+COLOR[r]+'">'+NAME[r]+' ×'+st.mergeReserve[r]+'</span>';
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
  var moved=syncRewards(S);
  if(moved>0){
    try{if(typeof dirty!=='undefined')dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
    try{if(typeof toast==='function')toast(moved+' pièce'+(moved>1?'s':'')+' de fusion ajoutée'+(moved>1?'s':'')+' au Sanctuaire',true);}catch(_){}
  }
  mountReserve();
}

/* Avant chaque rendu, la réserve recharge les cases libres et toute nouvelle
   récompense d'accomplissement est convertie dans le vrai système de Merge. */
if(typeof render==='function'){
  var oldRender=render;
  render=function(){
    try{if(typeof S!=='undefined'&&S){var st=ensureSanct(S);syncRewards(S);refill(st);}}catch(_){}
    var out=oldRender.apply(this,arguments);
    setTimeout(mountReserve,0);
    return out;
  };
}

/* Les actions du Sanctuaire peuvent libérer une case sans provoquer immédiatement
   un nouveau gain. Ce passage garantit que la réserve remplit le plateau ensuite. */
setInterval(function(){
  try{
    if(typeof S==='undefined'||!S)return;
    var st=ensureSanct(S), before=st.mergeBoard.filter(Boolean).length;
    var moved=syncRewards(S);var refilled=refill(st);
    if(moved||refilled){if(typeof dirty!=='undefined')dirty=true;if(typeof scheduleRender==='function')scheduleRender();}
    if(moved){try{if(typeof saveNow==='function')saveNow();}catch(_){}}
    if(refilled&&before<st.mergeBoard.filter(Boolean).length){try{if(typeof saveNow==='function')saveNow();}catch(_){}}
    mountReserve();
  }catch(_){}
},700);

setTimeout(syncAndRenderHint,50);
})();
