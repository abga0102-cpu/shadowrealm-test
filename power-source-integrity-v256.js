/* SHADOWREACH · Power Source Integrity V256
   No synthetic power compensation. Power always comes from canonical game systems.
   - Removes V255 artificial compensation fields.
   - Stores a compact snapshot of real power-bearing progression.
   - On a later boot, only restores monotonic source regressions (same item/pet id, lower level/stat;
     lower tree/rebirth/player stats) that occurred without a matching saved source snapshot.
   - Never restores a different equipped item, never invents a stat, and never adds a flat power bonus.
*/
(function(){
'use strict';
if(window.__srPowerSourceIntegrityV256)return;
window.__srPowerSourceIntegrityV256=true;
if(typeof S==='undefined'||typeof computePower!=='function')return;

var STORE='shadowreach.power.sources.v256';
var repaired=[];
function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}}
function num(v){v=Number(v);return Number.isFinite(v)?v:0;}
function snapItem(it){if(!it)return null;return {
 id:it.id,slot:it.slot,level:num(it.level),baseDamage:num(it.baseDamage),baseHp:num(it.baseHp),
 damage:num(it.damage),hp:num(it.hp),power:num(it.power),upgradeBaseLevel:num(it.upgradeBaseLevel),
 originalPower:num(it.originalPower),rarity:it.rarity,weaponType:it.weaponType,
 affixes:clone(it.affixes||[])
};}
function snapshot(s){
 var eq={};Object.keys((s&&s.equipped)||{}).sort().forEach(function(k){eq[k]=snapItem(s.equipped[k]);});
 var pet=null,id=s&&s.activePetId;
 if(id&&Array.isArray(s.pets)){var p=s.pets.find(function(x){return x&&x.id===id;});if(p)pet={id:p.id,level:num(p.level),rarity:p.rarity,species:p.species,element:p.element};}
 return {
   equipped:eq,
   playerStats:clone((s&&s.stats)||{}),
   tree:clone((s&&s.tree&&s.tree.levels)||{}),
   rebirth:clone((s&&s.rebirth&&s.rebirth.upgrades)||{}),
   rebirthCount:num(s&&s.rebirth&&s.rebirth.count),
   ascension:num(s&&s.ascension),
   activePet:pet
 };
}
function read(){try{return JSON.parse(localStorage.getItem(STORE)||'null');}catch(_){return null;}}
function write(){try{localStorage.setItem(STORE,JSON.stringify({at:Date.now(),sources:snapshot(S),power:Math.round(num(computePower(S)))}));}catch(_){}}
function restoreNumericMap(cur,prev,label){
 if(!cur||!prev)return false;var changed=false;
 Object.keys(prev).forEach(function(k){var pv=num(prev[k]),cv=num(cur[k]);if(pv>cv){cur[k]=prev[k];repaired.push(label+' · '+k+' '+cv+'→'+pv);changed=true;}});
 return changed;
}
function restoreItem(cur,prev,slot){
 if(!cur||!prev||!cur.id||cur.id!==prev.id)return false;var changed=false;
 ['level','baseDamage','baseHp','damage','hp','power','upgradeBaseLevel','originalPower'].forEach(function(k){
   var pv=num(prev[k]),cv=num(cur[k]);if(pv>cv){cur[k]=prev[k];repaired.push('Équipement '+slot+' · '+k+' '+cv+'→'+pv);changed=true;}
 });
 /* Affixes are restored only if the same item id lost entries; values are not boosted blindly. */
 if(Array.isArray(prev.affixes)&&prev.affixes.length && (!Array.isArray(cur.affixes)||cur.affixes.length<prev.affixes.length)){
   cur.affixes=clone(prev.affixes);repaired.push('Équipement '+slot+' · bonus restaurés');changed=true;
 }
 return changed;
}
function repairFrom(prev){
 if(!prev)return false;var changed=false;
 var eq=(S&&S.equipped)||{},peq=prev.equipped||{};
 Object.keys(peq).forEach(function(slot){if(restoreItem(eq[slot],peq[slot],slot))changed=true;});
 if(restoreNumericMap(S.stats||{},prev.playerStats||{},'Stat héros'))changed=true;
 if(S.tree&&restoreNumericMap(S.tree.levels||{},prev.tree||{},'Arbre'))changed=true;
 if(S.rebirth&&restoreNumericMap(S.rebirth.upgrades||{},prev.rebirth||{},'Rebirth'))changed=true;
 if(S.rebirth&&num(prev.rebirthCount)>num(S.rebirth.count)){S.rebirth.count=prev.rebirthCount;repaired.push('Rebirth · compteur restauré');changed=true;}
 if(num(prev.ascension)>num(S.ascension)){S.ascension=prev.ascension;repaired.push('Ascension restaurée');changed=true;}
 if(prev.activePet&&S.activePetId===prev.activePet.id&&Array.isArray(S.pets)){
   var p=S.pets.find(function(x){return x&&x.id===prev.activePet.id;});
   if(p&&num(prev.activePet.level)>num(p.level)){var old=num(p.level);p.level=prev.activePet.level;repaired.push('Familier · niveau '+old+'→'+prev.activePet.level);changed=true;}
 }
 return changed;
}

/* Remove the V255 flat compensation from the save. It is no longer part of power. */
try{delete S.powerIntegrityCompensationV255;delete S.powerIntegrityCompensationV255At;}catch(_){}
try{localStorage.removeItem('shadowreach.power.integrity.v255');}catch(_){}

var prior=read();
var changed=false;
try{if(prior&&prior.sources)changed=repairFrom(prior.sources);}catch(e){console.warn('Power source repair skipped',e);}
if(changed){
  try{S.power=Math.round(num(computePower(S)));}catch(_){}
  try{if(typeof refreshDerived==='function')refreshDerived();}catch(_){}
  try{if(typeof saveNow==='function')saveNow();}catch(_){}
  try{if(typeof toast==='function')toast('Source de puissance restaurée · '+repaired.length+' correction'+(repaired.length>1?'s':''),true);}catch(_){}
}

/* Keep the provenance snapshot aligned with every actual save, so next boot can distinguish
   a legitimate player change from a silent load/migration regression. */
var nativeSave=typeof saveNow==='function'?saveNow:null;
if(nativeSave){
  saveNow=function(){var r=nativeSave.apply(this,arguments);try{write();}catch(_){}return r;};
  try{window.saveNow=saveNow;}catch(_){}
}
write();
window.addEventListener('pagehide',write);
window.__srPowerSourceIntegrityV256={version:256,snapshot:snapshot,repaired:repaired};
})();
