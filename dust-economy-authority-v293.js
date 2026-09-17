/* SHADOWREACH V293 / V350 · Dust recycling economy authority
   Canonical rarity-based Dust values.
   V350 fixes a legacy fallback that returned +1 whenever a rarity key was not
   matched exactly. Rarity names are now normalized first and unknown values
   return 0 instead of silently becoming Common.
*/
(function(){
  'use strict';
  if(window.__srDustEconomyAuthorityV293)return;
  window.__srDustEconomyAuthorityV293=true;

  var DUST_BY_RARITY={
    COMMUN:1,
    RARE:2,
    EPIQUE:4,
    MYTHIQUE:10,
    ARTEFACT:25,
    LEGENDAIRE:60,
    INFERNAL:150,
    IMMORTEL:400,
    DIVIN:1000,
    /* legacy aliases kept only for old saves */
    HEROIQUE:25,
    ANCESTRAL:150,
    PEU_COMMUN:2
  };

  function normalizeRarity(raw){
    var s=String(raw==null?'':raw).trim().toUpperCase();
    try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(_){}
    s=s.replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
    if(s==='PEU__COMMUN')s='PEU_COMMUN';
    return s;
  }

  function valueForRarity(raw){
    var key=normalizeRarity(raw);
    if(!key||!Object.prototype.hasOwnProperty.call(DUST_BY_RARITY,key))return 0;
    return Math.max(0,Math.floor(Number(DUST_BY_RARITY[key])||0));
  }

  function normalizedDust(s,it){
    if(!it||!it.rarity)return 0;
    return valueForRarity(it.rarity);
  }

  try{
    if(typeof dustValue==='function'){
      normalizedDust.__srV293=true;
      normalizedDust.__srV350=true;
      normalizedDust.__srPrevious=dustValue;
      dustValue=normalizedDust;
    }
  }catch(_){ }

  try{
    window.__srDustEconomyConfigV293={
      version:293,
      revision:350,
      byRarity:Object.assign({},DUST_BY_RARITY),
      normalizeRarity:normalizeRarity,
      valueForRarity:valueForRarity,
      independentOfItemPower:true,
      independentOfForgeStars:true
    };
  }catch(_){ }
})();
