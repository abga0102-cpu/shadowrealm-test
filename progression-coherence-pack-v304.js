/* SHADOWREACH V304 · Progression coherence pack
   Consolidated safe authority after the V283-V303 progression QA.
   1) One canonical Ascension multiplier table across gameplay/UI/support code:
      Forge 0★/1★ = x1/x2, Skill 0★/1★ = x1/x1.5,
      Familiar 0★/1★/2★/3★ = x1/x1.5/x2.1/x3.
   2) The exported Familiar stat helper is state-aware, so previews/imports/tests
      no longer read the live player's stars by accident.
   Save schema, owned stats, rarity rates, costs and progression levels are untouched. */
(function(){'use strict';
if(window.__srProgressionCoherenceV304)return;window.__srProgressionCoherenceV304=true;

var MULT={forge:[1,2],skill:[1,1.5],pet:[1,1.5,2.1,3]};
function mulFor(stars,sys){
  var t=MULT[sys]||MULT.forge;
  var s=Math.max(0,Math.floor(Number(stars)||0));
  return t[Math.min(s,t.length-1)]||1;
}

/* Canonical star multiplier authority. This also fixes legacy UI/support paths
   that still call ascendPowerMul directly instead of the newer progression layers. */
try{
  if(typeof ascendPowerMul==='function'&&!ascendPowerMul.__srV304){
    var oldAscendPowerMul=ascendPowerMul;
    ascendPowerMul=function(stars,sys){
      if(sys==='forge'||sys==='skill'||sys==='pet')return mulFor(stars,sys);
      return oldAscendPowerMul.apply(this,arguments);
    };
    ascendPowerMul.__srV304=true;
    ascendPowerMul.__srPrevious=oldAscendPowerMul;
  }
}catch(_){ }

/* State-aware exported Familiar stats. V303 already protects computeDerived's
   private V286 helper; this closes the remaining direct-helper preview/test gap. */
var PET_BASE={COMMUN:[1500,12000],PEU_COMMUN:[5000,40000],RARE:[20000,160000],EPIQUE:[120000,960000],MYTHIQUE:[900000,7200000],ANCESTRAL:[7000000,56000000],LEGENDAIRE:[70000000,560000000],DIVIN:[544000000,4350000000]};
var PET_SPEC={loup:[1.40,.65],felin:[1.20,.85],dragonnet:[1,1],oiseau:[.70,1.40]};
function petStats(p,state){
  if(!p)return {damage:0,hp:0};
  var s=state;
  try{if(!s&&typeof S!=='undefined')s=S;}catch(_){ }
  s=s||{};
  var b=PET_BASE[p.rarity]||PET_BASE.COMMUN,sp=PET_SPEC[p.species]||PET_SPEC.dragonnet;
  var stars=0;try{stars=Math.max(0,Math.floor(Number(s.stars&&s.stars.pet)||0));}catch(_){ }
  var m=mulFor(stars,'pet'),d=b[0]*sp[0]*m,h=b[1]*sp[1]*m;
  try{if(typeof treeSum==='function'){d*=1+(Number(treeSum(s,'petDmg'))||0)/100;h*=1+(Number(treeSum(s,'petHp'))||0)/100;}}catch(_){ }
  try{if(typeof petElement==='function'&&petElement(p).id==='normal')d*=1.10;}catch(_){ }
  return {damage:Math.round(d),hp:Math.round(h)};
}
window.__srV304PetStats=petStats;
window.__srV286PetStats=petStats;

try{
  if(typeof S!=='undefined'&&S){
    S.progressionCoherenceVersion=304;
    if(typeof computePower==='function')S.power=computePower(S);
    if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);
    if(typeof saveNow==='function')saveNow();
    if(typeof scheduleRender==='function')scheduleRender();
  }
}catch(_){ }

window.__srProgressionCoherenceConfigV304={
  multipliers:MULT,
  stateAwareFamiliarStats:true,
  preservesOwnedProgress:true,
  changesSaveSchema:false
};
})();
