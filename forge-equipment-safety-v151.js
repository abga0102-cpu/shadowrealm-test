/* SHADOWREACH · Forge equipment safety v151
   Global equipment safety layer.
   Guarantees that replacing an equipped item never destroys the previous item:
   the old item must remain equipped or return to inventory. Also clarifies Forge
   comparison actions so GARDER means keeping the new drop without equipping it. */
(function(){
'use strict';
if(window.__srForgeEquipmentSafetyV151)return;
window.__srForgeEquipmentSafetyV151=true;
if(typeof equipItem!=='function')return;

var originalEquipItem=equipItem;
function cloneItem(it){
 try{return typeof structuredClone==='function'?structuredClone(it):JSON.parse(JSON.stringify(it));}
 catch(_){try{return Object.assign({},it,{affixes:Array.isArray(it&&it.affixes)?it.affixes.map(function(a){return Object.assign({},a);}):[]});}catch(__){return it;}}
}
function hasItem(id){
 if(!id||typeof S==='undefined')return false;
 var eq=S.equipped||{};
 if(Object.keys(eq).some(function(k){return eq[k]&&eq[k].id===id;}))return true;
 return Array.isArray(S.inventory)&&S.inventory.some(function(x){return x&&x.id===id;});
}

equipItem=function(id){
 var incoming=null,previous=null;
 try{
  incoming=(S.inventory||[]).find(function(x){return x&&x.id===id;})||null;
  if(incoming&&incoming.slot)previous=(S.equipped||{})[incoming.slot]||null;
  previous=previous?cloneItem(previous):null;
 }catch(_){}
 originalEquipItem(id);
 if(previous&&previous.id&&!hasItem(previous.id)){
  try{
   update(function(s){
    s.inventory=Array.isArray(s.inventory)?s.inventory:[];
    var already=s.inventory.some(function(x){return x&&x.id===previous.id;})||Object.keys(s.equipped||{}).some(function(k){return s.equipped[k]&&s.equipped[k].id===previous.id;});
    if(!already)s.inventory.push(previous);
   });
   try{if(typeof saveNow==='function')saveNow();}catch(_){}
   try{if(typeof toast==='function')toast('Ancien équipement sécurisé dans l’inventaire.',true);}catch(_){}
  }catch(_){}
 }
};
try{window.equipItem=equipItem;}catch(_){}

function clarify(root){
 root=root||document;
 var keep=root.querySelector&&root.querySelector('#srForgeArenaPreview146 [data-sr-fp146="keep"]');
 var equip=root.querySelector&&root.querySelector('#srForgeArenaPreview146 [data-sr-fp146="equip"]');
 if(keep){
  var more=/SUIVANT/i.test(keep.textContent||'');
  keep.textContent=more?'GARDER LE NOUVEAU · SUIVANT':'GARDER LE NOUVEAU';
  keep.title='Conserve le nouvel équipement dans l’inventaire sans changer l’équipement porté.';
 }
 if(equip){
  equip.textContent='ÉQUIPER · ANCIEN CONSERVÉ';
  equip.title='Équipe le nouvel objet et remet automatiquement l’ancien dans l’inventaire.';
 }
}
clarify(document);
var observer=new MutationObserver(function(muts){
 for(var i=0;i<muts.length;i++){
  if(muts[i].addedNodes&&muts[i].addedNodes.length){clarify(document);break;}
 }
});
try{observer.observe(document.body,{childList:true,subtree:true});}catch(_){}
})();