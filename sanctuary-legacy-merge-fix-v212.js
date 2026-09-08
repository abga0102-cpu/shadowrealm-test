/* SHADOWREACH · Sanctuary legacy merge compatibility V212
   Fixes old save-board rarity ids (RARE, EPIQUE, etc.) after the expanded
   Sanctuary ladder introduced RARE_I / RARE_II and other sub-tiers.
   No pieces, rewards, resources or progression values are added or removed. */
(function(){
'use strict';
if(window.__srSanctLegacyMergeFixV212)return;
window.__srSanctLegacyMergeFixV212=true;
if(typeof S==='undefined'||typeof sanctMergeState!=='function')return;

var ALIAS={
  RARE:'RARE_I',
  EPIQUE:'EPIQUE_I',
  MYTHIQUE:'MYTHIQUE_I',
  ARTEFACT:'ARTEFACT_I',
  LEGENDAIRE:'LEGENDAIRE_I',
  INFERNAL:'INFERNAL_I',
  IMMORTEL:'IMMORTEL_I'
};

function canon(r){return ALIAS[r]||r;}
function normalizeState(st){
  var changed=false;
  if(Array.isArray(st.mergeBoard)){
    st.mergeBoard=st.mergeBoard.map(function(r){
      if(!r)return r;
      var n=canon(r);if(n!==r)changed=true;return n;
    });
  }
  if(Array.isArray(st.mergeReserve)){
    st.mergeReserve=st.mergeReserve.map(function(r){
      if(!r)return r;
      var n=canon(r);if(n!==r)changed=true;return n;
    });
  }
  if(st.mergeDiscovered&&typeof st.mergeDiscovered==='object'){
    Object.keys(ALIAS).forEach(function(oldKey){
      if(st.mergeDiscovered[oldKey]&&!st.mergeDiscovered[ALIAS[oldKey]]){
        st.mergeDiscovered[ALIAS[oldKey]]=st.mergeDiscovered[oldKey];changed=true;
      }
    });
  }
  if(changed){
    st.legacyRarityCompatV212=true;
    try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
  }
  return st;
}

var prevState=sanctMergeState;
sanctMergeState=function(){return normalizeState(prevState.apply(this,arguments));};

/* The base helper must also understand an old id during the same frame before
   the next render has had a chance to normalize the board. */
var prevNext=typeof sanctMergeNext==='function'?sanctMergeNext:null;
sanctMergeNext=function(r){
  var c=canon(r);
  if(typeof SANCT_MERGE_ORDER!=='undefined'){
    var i=SANCT_MERGE_ORDER.indexOf(c);
    if(i>=0&&i<SANCT_MERGE_ORDER.length-1)return SANCT_MERGE_ORDER[i+1];
    if(i===SANCT_MERGE_ORDER.length-1)return null;
  }
  return prevNext?prevNext(c):null;
};

try{
  var st=sanctMergeState();
  if(typeof render==='function')render();
}catch(e){console.warn('Sanctuary legacy merge compatibility V212',e);}
})();