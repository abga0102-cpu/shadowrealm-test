/* SHADOWREACH · Forge equipment safety v151
   Global equipment safety layer.
   Guarantees that replacing an equipped item never destroys the previous item:
   the old item must remain equipped or return to inventory. Also clarifies Forge
   comparison actions so keeping means storing the new drop without equipping it.
   V320: action labels match the explicit replacement-power comparison flow. */
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

var COMPARE_ROOT='srForgeArenaPreview146';
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}
function setTitle(el,text){if(el&&el.getAttribute('title')!==text)el.setAttribute('title',text);}
function clarify(root){
 root=root||document;
 var panel=root&&root.id===COMPARE_ROOT?root:(root.querySelector?root.querySelector('#'+COMPARE_ROOT):null);
 if(!panel)return;
 var keep=panel.querySelector('[data-sr-fp146="keep"]');
 var equip=panel.querySelector('[data-sr-fp146="equip"]');
 if(keep){
  var more=/SUIVANT/i.test(keep.textContent||'');
  setText(keep,more?'GARDER · SUIVANT':'GARDER');
  setTitle(keep,'Conserve le nouvel équipement dans l’inventaire sans changer l’équipement porté.');
 }
 if(equip){
  setText(equip,'ÉQUIPER');
  setTitle(equip,'Équipe le nouvel objet et remet automatiquement l’ancien dans l’inventaire.');
 }
}
clarify(document);

/* V146 appends its comparison panel directly to <body>. Observe only those
   direct additions instead of every mutation in the application. The previous
   subtree observer rewrote button text from inside its own callback; each
   textContent write created another child-list mutation and could starve the
   event loop after a successful Forge result. */
var observer=new MutationObserver(function(muts){
 for(var i=0;i<muts.length;i++){
  var added=muts[i].addedNodes||[];
  for(var j=0;j<added.length;j++){
   var node=added[j];
   if(!node||node.nodeType!==1)continue;
   var panel=node.id===COMPARE_ROOT?node:(node.querySelector?node.querySelector('#'+COMPARE_ROOT):null);
   if(panel){clarify(panel);return;}
  }
 }
});
try{observer.observe(document.body,{childList:true});}catch(_){}
})();