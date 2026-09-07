/* SHADOWREACH · Sanctuaire rarity expansion v129
   Extends the existing drag-merge chain without resetting board/saves.
   Supplier remains capped at Epic; Mythic+ are earned through fusion/rewards. */
(function(){
'use strict';
if(window.__srSanctuaryRaritiesV129)return;window.__srSanctuaryRaritiesV129=true;
if(typeof SANCT_MERGE_ORDER==='undefined'||typeof SANCT_MERGE_COLOR==='undefined'||typeof SANCT_MERGE_NAME==='undefined')return;
var order=['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE','ARTEFACT','LEGENDAIRE','INFERNAL','IMMORTEL','DIVIN'];
SANCT_MERGE_ORDER.splice(0,SANCT_MERGE_ORDER.length);order.forEach(function(r){SANCT_MERGE_ORDER.push(r);});
Object.assign(SANCT_MERGE_COLOR,{
  COMMUN:'#9FB0C8',PEU_COMMUN:'#57C785',RARE:'#3FA7FF',EPIQUE:'#B15CF6',
  MYTHIQUE:'#FF7A3D',ARTEFACT:'#2FA47C',LEGENDAIRE:'#F5C542',INFERNAL:'#D94A50',IMMORTEL:'#C15CF6',DIVIN:'#FFB52E'
});
Object.assign(SANCT_MERGE_NAME,{
  COMMUN:'Commun',PEU_COMMUN:'Peu commun',RARE:'Rare',EPIQUE:'Épique',MYTHIQUE:'Mythique',
  ARTEFACT:'Artefact',LEGENDAIRE:'Légendaire',INFERNAL:'Infernal',IMMORTEL:'Immortel',DIVIN:'Divin'
});
/* Keep supplier semantics authoritative: only the first four colours are purchasable. */
var oldUnlocked=typeof sanctSupplierUnlocked==='function'?sanctSupplierUnlocked:null;
if(oldUnlocked){
  sanctSupplierUnlocked=function(level){return oldUnlocked(level).filter(function(r){return order.indexOf(r)>=0&&order.indexOf(r)<=3;});};
  try{window.sanctSupplierUnlocked=sanctSupplierUnlocked;}catch(_){}
}
/* Existing save values remain untouched. New ranks are naturally supported by
   mergeBoard strings, sanctMergeNext(), discovery, counts and drag/tap merge. */
try{if(typeof render==='function')render();}catch(_){}
})();