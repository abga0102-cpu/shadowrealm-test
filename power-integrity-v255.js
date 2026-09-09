/* SHADOWREACH · Power Integrity V255
   Prevents silent power loss across reloads when the effective progression/loadout did not change.
   Also applies a one-time compensation for the three confirmed erroneous drops observed during V248–V254:
   -3.15K, -3.18K, -3.23K = 9,560 power.

   Design:
   - computePower keeps the canonical formula as its base authority.
   - A stable gameplay signature is built from the actual power-bearing state.
   - For an identical signature, power is never allowed to fall below the last valid value.
   - Intentional equipment/progression changes alter the signature, so legitimate power decreases remain possible.
   - Compensation is explicit, one-time, persisted in the save, and included by the same wrapper.
*/
(function(){
'use strict';
if(window.__srPowerIntegrityV255)return;
window.__srPowerIntegrityV255=true;
if(typeof S==='undefined'||typeof computePower!=='function')return;

var nativeComputePower=computePower;
var STORE='shadowreach.power.integrity.v255';
var CONFIRMED_COMP=9560;

function cloneLite(v){
  try{return JSON.parse(JSON.stringify(v));}catch(_){return v;}
}
function petLite(s){
  var id=s&&s.activePetId;
  var p=(s&&Array.isArray(s.pets)?s.pets:[]).find(function(x){return x&&x.id===id;});
  return p?{id:p.id,level:p.level,rarity:p.rarity,species:p.species,element:p.element}:null;
}
function equippedLite(s){
  var out={};
  Object.keys((s&&s.equipped)||{}).sort().forEach(function(k){
    var it=s.equipped[k];
    out[k]=it?{
      id:it.id,slot:it.slot,rarity:it.rarity,level:it.level,
      baseDamage:it.baseDamage,baseHp:it.baseHp,damage:it.damage,hp:it.hp,
      weaponType:it.weaponType,affixes:cloneLite(it.affixes||[])
    }:null;
  });
  return out;
}
function signature(s){
  var x={
    level:s&&s.level,
    ascension:s&&s.ascension,
    equipped:equippedLite(s),
    activePet:petLite(s),
    tree:cloneLite(s&&s.tree&&s.tree.levels||{}),
    rebirth:cloneLite(s&&s.rebirth&&s.rebirth.upgrades||{}),
    sanctuary:cloneLite(s&&s.sanctuary&&s.sanctuary.activeBoosts||{}),
    boosts:cloneLite(s&&s.activeBoosts||{}),
    title:s&&s.equippedTitle||''
  };
  var raw=JSON.stringify(x),h=2166136261;
  for(var i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619);}
  return String(h>>>0);
}
function readRecord(){
  try{return JSON.parse(localStorage.getItem(STORE)||'null')||{};}catch(_){return {};}
}
function writeRecord(r){try{localStorage.setItem(STORE,JSON.stringify(r));}catch(_){} }

/* One-time compensation for losses already proven by screenshots. */
if(!S.powerIntegrityCompensationV255){
  S.powerIntegrityCompensationV255=CONFIRMED_COMP;
  S.powerIntegrityCompensationV255At=Date.now();
  try{if(typeof saveNow==='function')saveNow();}catch(_){}
}
function compensation(s){return Math.max(0,Number(s&&s.powerIntegrityCompensationV255)||0);}

computePower=function(s){
  var base=Math.round(Number(nativeComputePower(s))||0);
  var total=base+compensation(s);
  try{
    var sig=signature(s),rec=readRecord();
    if(rec.sig===sig&&Number(rec.power)>total){
      total=Math.round(Number(rec.power));
    }
    if(rec.sig!==sig||total>Number(rec.power||0)){
      writeRecord({sig:sig,power:total,at:Date.now()});
    }
  }catch(_){}
  return total;
};
try{window.computePower=computePower;}catch(_){}

/* Recalculate the live derived state immediately so the repaired value is visible now. */
try{
  var before=Math.round(Number(S.power)||0);
  var repaired=Math.round(Number(computePower(S))||0);
  if(repaired!==before){
    S.power=repaired;
    try{if(typeof refreshDerived==='function')refreshDerived();}catch(_){}
    try{if(typeof saveNow==='function')saveNow();}catch(_){}
    if(repaired>before&&typeof toast==='function'){
      toast('Puissance restaurée · +'+(repaired-before).toLocaleString('fr-FR'),true);
    }
  }
}catch(err){console.error('Power Integrity V255 init failed',err);}

/* Keep the integrity record current before the page leaves. */
window.addEventListener('pagehide',function(){
  try{var p=Math.round(Number(computePower(S))||0);writeRecord({sig:signature(S),power:p,at:Date.now()});}catch(_){}
});

window.__srPowerIntegrityV255={version:255,signature:signature,confirmedCompensation:CONFIRMED_COMP};
})();
